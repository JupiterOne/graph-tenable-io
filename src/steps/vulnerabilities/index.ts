import {
  createDirectRelationship,
  getRawData,
  IntegrationStepExecutionContext,
  RelationshipClass,
  Step,
} from '@jupiterone/integration-sdk-core';
import { TenableIntegrationConfig } from '../../config';
import {
  entities,
  MappedRelationships,
  relationships,
  StepIds,
} from '../../constants';
import TenableClient from '../../tenable/TenableClient';
import {
  AssetExport,
  VulnerabilityExport,
} from '@jupiterone/tenable-client-nodejs';
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
import { getAccount } from '../../initializeContext';
import { createAccountEntity } from '../account/converters';

export async function fetchAssets(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Promise<void> {
  const { jobState, logger, instance } = context;
  const accountEntity = createAccountEntity(getAccount(context));
  const provider = new TenableClient({
    logger: logger,
    accessToken: instance.config.accessKey,
    secretToken: instance.config.secretKey,
  });

  await provider.iterateAssets(async (asset) => {
    const assetEntity = await jobState.addEntity(createAssetEntity(asset));
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
  });
}

export async function fetchVulnerabilities(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Promise<void> {
  const { jobState, logger, instance } = context;
  const provider = new TenableClient({
    logger: logger,
    accessToken: instance.config.accessKey,
    secretToken: instance.config.secretKey,
  });

  await provider.iterateVulnerabilities(async (vuln) => {
    // TODO add `targets` property from the asset.
    await jobState.addEntity(createVulnerabilityEntity(vuln, []));
  });
}

export async function buildAssetVulnerabilityRelationships(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: entities.VULN._type },
    async (vulnEntity) => {
      const vuln = getRawData<VulnerabilityExport>(vulnEntity);
      if (!vuln) {
        logger.warn(
          {
            _key: vulnEntity._key,
          },
          'Could not get vuln raw data from vulnerability entity.',
        );
        return;
      }

      const assetEntity = await jobState.findEntity(vuln.asset.uuid);
      if (!assetEntity) {
        logger.warn(
          {
            'vuln._key': vulnEntity._key,
            'asset.uuid': vuln.asset.uuid,
          },
          'Could not find asset specified by vulnerability in job state.',
        );
        return;
      }

      const asset = getRawData<AssetExport>(assetEntity);
      if (!asset) {
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
          from: createTargetHostEntity(asset),
          _class: RelationshipClass.HAS,
          to: vulnEntity,
        }),
      );
    },
  );
}

export async function buildVulnerabilityCveRelationships(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: entities.VULN._type },
    async (vulnEntity) => {
      const vuln = getRawData<VulnerabilityExport>(vulnEntity);
      if (!vuln) {
        logger.warn(
          {
            _key: vulnEntity._key,
          },
          'Could not get vuln raw data from vulnerability entity.',
        );
        return;
      }

      for (const targetCveEntity of createTargetCveEntities(vuln)) {
        await jobState.addRelationship(
          createRelationshipToTargetEntity({
            from: vulnEntity,
            _class: RelationshipClass.IS,
            to: targetCveEntity,
          }),
        );
      }
    },
  );
}

export const scanSteps: Step<
  IntegrationStepExecutionContext<TenableIntegrationConfig>
>[] = [
  {
    id: StepIds.ASSETS,
    name: 'Fetch Assets',
    entities: [entities.ASSET],
    relationships: [relationships.ACCOUNT_HAS_ASSET],
    mappedRelationships: [MappedRelationships.ASSET_IS_HOST],
    dependsOn: [StepIds.ACCOUNT],
    executionHandler: fetchAssets,
  },
  {
    id: StepIds.VULNERABILITIES,
    name: 'Fetch Vulnerabilities',
    entities: [entities.VULN],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchVulnerabilities,
  },
  {
    id: StepIds.ASSET_VULNERABILITY_RELATIONSHIPS,
    name: 'Build Asset -> Vulnerability Relationships',
    entities: [],
    relationships: [relationships.ASSET_HAS_VULN],
    mappedRelationships: [MappedRelationships.HOST_HAS_VULN],
    dependsOn: [StepIds.ASSETS, StepIds.VULNERABILITIES],
    executionHandler: buildVulnerabilityCveRelationships,
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
