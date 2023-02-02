import {
  createDirectRelationship,
  getRawData,
  IntegrationStepExecutionContext,
  RelationshipClass,
  Step,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../config';
import {
  Entities,
  MappedRelationships,
  Relationships,
  StepIds,
} from '../constants';
import TenableClient from '../../tenable/TenableClient';
import { AssetExport, VulnerabilityExport } from '../../tenable/client';
import {
  createTargetHostEntity,
  createAssetEntity,
  createVulnerabilityEntity,
  createTargetCveEntities,
} from './converters';
import {
  createRelationshipFromTargetEntity,
  createRelationshipToTargetEntity,
} from '../../utils/targetEntities';
import { getAccount } from '../account/util';
import { createAccountEntity } from '../account/converters';

export async function fetchAssets(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Promise<void> {
  const { jobState, logger, instance } = context;
  const accountEntity = createAccountEntity(getAccount(context));
  const { assetApiTimeoutInMinutes, accessKey, secretKey } = instance.config;

  const provider = new TenableClient({
    logger: logger,
    accessToken: accessKey,
    secretToken: secretKey,
  });

  logger.info({ assetApiTimeoutInMinutes }, 'Attempting to fetch assets...');

  await provider.iterateAssets(
    async (asset) => {
      const assetEntity = createAssetEntity(asset, logger);
      if (await jobState.hasKey(assetEntity._key)) {
        logger.warn(
          {
            _key: assetEntity._key,
          },
          'Warning: duplicate asset _key encountered',
        );
        return;
      }
      await jobState.addEntity(assetEntity);
      await jobState.addRelationship(
        createDirectRelationship({
          from: accountEntity,
          _class: RelationshipClass.HAS,
          to: assetEntity,
        }),
      );
      await jobState.addRelationship(
        createRelationshipToTargetEntity({
          from: assetEntity,
          _class: RelationshipClass.IS,
          to: createTargetHostEntity(asset),
        }),
      );
    },
    {
      timeoutInMinutes: assetApiTimeoutInMinutes,
    },
  );
}

export async function fetchVulnerabilities(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Promise<void> {
  const { jobState, logger, instance } = context;
  const { vulnerabilityApiTimeoutInMinutes, accessKey, secretKey } =
    instance.config;
  const provider = new TenableClient({
    logger: logger,
    accessToken: accessKey,
    secretToken: secretKey,
  });

  logger.info(
    { vulnerabilityApiTimeoutInMinutes },
    'Attempting to fetch vulnerabilities...',
  );

  await provider.iterateVulnerabilities(
    async (vuln) => {
      // TODO add `targets` property from the asset.
      const vulnerabilityEntity = createVulnerabilityEntity(vuln, [], logger);
      if (await jobState.hasKey(vulnerabilityEntity._key)) {
        logger.warn(
          {
            _key: vulnerabilityEntity._key,
          },
          'Warning: duplicate tenable_vulnerability_finding _key encountered',
        );
        return;
      }
      await jobState.addEntity(vulnerabilityEntity);
    },
    {
      timeoutInMinutes: vulnerabilityApiTimeoutInMinutes,
    },
  );
}

export async function buildAssetVulnerabilityRelationships(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: Entities.VULNERABILITY._type },
    async (vulnEntity) => {
      const vulnRawData = getRawData<VulnerabilityExport>(vulnEntity);
      if (!vulnRawData) {
        logger.warn(
          {
            _key: vulnEntity._key,
          },
          'Could not get vuln raw data from vulnerability entity.',
        );
        return;
      }

      const assetEntity = await jobState.findEntity(vulnRawData.asset.uuid);
      if (!assetEntity) {
        logger.warn(
          {
            'vuln._key': vulnEntity._key,
            'asset.uuid': vulnRawData.asset.uuid,
          },
          'Could not find asset specified by vulnerability in job state.',
        );
        return;
      }

      const assetRawData = getRawData<AssetExport>(assetEntity);
      if (!assetRawData) {
        logger.warn(
          {
            'vuln._key': vulnEntity._key,
            'asset._key': assetEntity._key,
          },
          'Could not get asset raw data from asset entity.',
        );
        return;
      }

      await jobState.addRelationship(
        createDirectRelationship({
          from: assetEntity,
          _class: RelationshipClass.HAS,
          to: vulnEntity,
        }),
      );

      await jobState.addRelationship(
        createRelationshipFromTargetEntity({
          from: createTargetHostEntity(assetRawData),
          _class: RelationshipClass.HAS,
          to: vulnEntity,
        }),
      );
    },
  );
}

export async function buildVulnerabilityCveRelationships(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: Entities.VULNERABILITY._type },
    async (vulnEntity) => {
      const vulnRawData = getRawData<VulnerabilityExport>(vulnEntity);
      if (!vulnRawData) {
        logger.warn(
          {
            _key: vulnEntity._key,
          },
          'Could not get vuln raw data from vulnerability entity.',
        );
        return;
      }

      for (const targetCveEntity of createTargetCveEntities(vulnRawData)) {
        const vulnCveMappedRelationship = createRelationshipToTargetEntity({
          from: vulnEntity,
          _class: RelationshipClass.IS,
          to: targetCveEntity,
        });
        if (await jobState.hasKey(vulnCveMappedRelationship._key)) {
          logger.warn(
            {
              _key: vulnCveMappedRelationship._key,
            },
            'Warning: duplicate tenable_vulnerability_finding_is_cve _key encountered',
          );
          break;
        }
        await jobState.addRelationship(vulnCveMappedRelationship);
      }
    },
  );
}

export const scanSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: StepIds.ASSETS,
    name: 'Fetch Assets',
    entities: [Entities.ASSET],
    relationships: [Relationships.ACCOUNT_HAS_ASSET],
    mappedRelationships: [MappedRelationships.ASSET_IS_HOST],
    dependsOn: [StepIds.ACCOUNT],
    executionHandler: fetchAssets,
  },
  {
    id: StepIds.VULNERABILITIES,
    name: 'Fetch Vulnerabilities',
    entities: [Entities.VULNERABILITY],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchVulnerabilities,
  },
  {
    id: StepIds.ASSET_VULNERABILITY_RELATIONSHIPS,
    name: 'Build Asset -> Vulnerability Relationships',
    entities: [],
    relationships: [Relationships.ASSET_HAS_VULN],
    mappedRelationships: [MappedRelationships.HOST_HAS_VULN],
    dependsOn: [StepIds.ASSETS, StepIds.VULNERABILITIES],
    executionHandler: buildAssetVulnerabilityRelationships,
  },
  {
    id: StepIds.VULNERABILITY_CVE_RELATIONSHIPS,
    name: 'Build Vulnerability -> CVE Mapped Relationships',
    entities: [],
    relationships: [],
    mappedRelationships: [MappedRelationships.VULNERABILITY_IS_CVE],
    dependsOn: [StepIds.VULNERABILITIES],
    executionHandler: buildVulnerabilityCveRelationships,
  },
];
