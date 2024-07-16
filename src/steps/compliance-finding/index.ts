import {
  IntegrationMissingKeyError,
  IntegrationStepExecutionContext,
  RelationshipClass,
  Step,
  createDirectRelationship,
  getRawData,
} from '@jupiterone/integration-sdk-core';
import TenableClient from '../../tenable/TenableClient';
import { Entities, StepIds, Relationships } from '../constants';
import { IntegrationConfig } from '../../config';
import { createComplianceFindingEntity } from './converter';
import { buildComplianceFilters } from './filters';

export async function fetchComplianceFindings(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Promise<void> {
  const { jobState, logger, instance } = context;
  const { complianceApiTimeoutInMinutes, accessKey, secretKey, numFindings } =
    instance.config;

  const provider = new TenableClient({
    logger: logger,
    accessToken: accessKey,
    secretToken: secretKey,
  });

  logger.info(
    { complianceApiTimeoutInMinutes },
    'Attempting to fetch compliance findings...',
  );

  let duplicateKeysEncountered = 0;
  await provider.iterateComplianceData(
    async (finding) => {
      const complianceEntity = createComplianceFindingEntity(finding);
      if (jobState.hasKey(complianceEntity._key)) {
        logger.debug(
          {
            _key: complianceEntity._key,
          },
          'Debug: duplicate tenable_compliance_finding _key encountered',
        );
        duplicateKeysEncountered += 1;
      }
      try {
        await jobState.addEntity(complianceEntity);
      } catch (error) {
        /* Empty for now, will remove try/catch when we have a report of duplicated keys */
      }
    },
    {
      timeoutInMinutes: complianceApiTimeoutInMinutes,
      exportComplianceFindingsOptions: {
        num_findings: 5000,
        filters: buildComplianceFilters(instance.config),
      },
    },
  );

  if (duplicateKeysEncountered > 0) {
    logger.info(
      { duplicateKeysEncountered },
      `Found duplicate keys for "tenable_compliance_finding" entity`,
    );
  }
}

export async function buildAssetComplianceFindingRelationships(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Promise<void> {
  const { jobState } = context;
  await jobState.iterateEntities(
    { _type: Entities.COMPLIANCE_FINDINGS._type },
    async (complianceEntity) => {
      const complianceData = getRawData<any>(complianceEntity);
      if (complianceData && complianceData.asset && complianceData.asset.id) {
        const assetKey = complianceData.asset.id;

        if (!assetKey) {
          throw new IntegrationMissingKeyError(
            `Cannot build Relationship.
              Error: Missing Key.
              assetKey: ${assetKey}`,
          );
        }

        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: assetKey,
            fromType: Entities.ASSET._type,
            toKey: complianceEntity._key,
            toType: Entities.COMPLIANCE_FINDINGS._type,
          }),
        );
      }
    },
  );
}

export const complianceFindingSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: StepIds.COMPLIANCE_FINDINGS,
    name: 'Fetch Compliance',
    entities: [Entities.COMPLIANCE_FINDINGS],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchComplianceFindings,
  },
  {
    id: StepIds.ASSET_COMPLIANCE_FINDINGS_RELATIONSHIPS,
    name: 'Build Asset Has Compliance Finding Relationship',
    entities: [],
    relationships: [Relationships.ASSET_HAS_COMPLIANCE_FINDINGS],
    dependsOn: [StepIds.ASSETS, StepIds.COMPLIANCE_FINDINGS],
    executionHandler: buildAssetComplianceFindingRelationships,
  },
];
