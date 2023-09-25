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
import { buildFilters } from './filters';

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

  let duplicateKeysEncountered = 0;
  await provider.iterateAssets(
    async (asset) => {
      const assetEntity = createAssetEntity(asset);
      if (jobState.hasKey(assetEntity._key)) {
        logger.debug(
          {
            _key: assetEntity._key,
          },
          'Debug: duplicate asset _key encountered',
        );
        duplicateKeysEncountered += 1;
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

      const targetEntity = createTargetHostEntity(asset);
      if (targetEntity) {
        await jobState.addRelationship(
          createRelationshipToTargetEntity({
            from: assetEntity,
            _class: RelationshipClass.IS,
            to: targetEntity,
          }),
        );
      }
    },
    {
      timeoutInMinutes: assetApiTimeoutInMinutes,
    },
  );

  if (duplicateKeysEncountered > 0) {
    logger.info(
      { duplicateKeysEncountered },
      `Found duplicate keys for "tenable_asset" entity`,
    );
  }
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

  let duplicateKeysEncountered = 0;
  await provider.iterateVulnerabilities(
    async (vuln) => {
      const vulnerabilityEntity = createVulnerabilityEntity(vuln, logger);
      if (jobState.hasKey(vulnerabilityEntity._key)) {
        logger.debug(
          {
            _key: vulnerabilityEntity._key,
          },
          'Debug: duplicate tenable_vulnerability_finding _key encountered',
        );
        duplicateKeysEncountered += 1;
        return;
      }
      await jobState.addEntity(vulnerabilityEntity);
    },
    {
      timeoutInMinutes: vulnerabilityApiTimeoutInMinutes,
      exportVulnerabilitiesOptions: {
        num_assets: 50,
        filters: buildFilters(instance.config),
      },
    },
  );

  if (duplicateKeysEncountered > 0) {
    logger.info(
      { duplicateKeysEncountered },
      `Found duplicate keys for "tenable_vulnerability_finding" entity`,
    );
  }
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
        logger.debug(
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

      const assetVulnRelationship = createDirectRelationship({
        from: assetEntity,
        _class: RelationshipClass.HAS,
        to: vulnEntity,
      });
      if (!jobState.hasKey(assetVulnRelationship._key)) {
        await jobState.addRelationship(assetVulnRelationship);
      }

      const targetEntity = createTargetHostEntity(assetRawData);
      if (targetEntity) {
        await jobState.addRelationship(
          createRelationshipFromTargetEntity({
            from: targetEntity,
            _class: RelationshipClass.HAS,
            to: vulnEntity,
          }),
        );
      }
    },
  );
}

export async function buildVulnerabilityCveRelationships(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Promise<void> {
  const { jobState, logger } = context;

  let duplicateKeysEncountered = 0;
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
        if (jobState.hasKey(vulnCveMappedRelationship._key)) {
          logger.debug(
            {
              _key: vulnCveMappedRelationship._key,
            },
            'Debug: duplicate tenable_vulnerability_finding_is_cve _key encountered',
          );
          duplicateKeysEncountered += 1;
          break;
        }
        await jobState.addRelationship(vulnCveMappedRelationship);
      }
    },
  );

  if (duplicateKeysEncountered > 0) {
    logger.info(
      { duplicateKeysEncountered },
      `Found duplicate keys for "tenable_vulnerability_finding_is_cve" relationship`,
    );
  }
}

export const scanSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: StepIds.ASSETS,
    name: 'Fetch Assets',
    entities: [Entities.ASSET],
    relationships: [Relationships.ACCOUNT_HAS_ASSET],
    mappedRelationships: [
      MappedRelationships.TENABLE_ASSET_IS_AWS_INSTANCE,
      MappedRelationships.TENABLE_ASSET_IS_AZURE_VM,
      MappedRelationships.TENABLE_ASSET_IS_GOOGLE_COMPUTE_INSTANCE,
    ],
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
    mappedRelationships: [
      MappedRelationships.VULNERABILITY_HAS_AWS_INSTANCE,
      MappedRelationships.VULNERABILITY_HAS_AZURE_VM,
      MappedRelationships.VULNERABILITY_HAS_GOOGLE_COMPUTE_INSTANCE,
    ],
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
