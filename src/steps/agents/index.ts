import TenableClient from '../../tenable/TenableClient';
import {
  IntegrationStepExecutionContext,
  RelationshipClass,
  Step,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import { Entities, StepIds, Relationships } from '../constants';
import { IntegrationConfig } from '../../config';
import { DATA_SCANNER_IDS } from '../scanners/constants';
import { createAgentEntity } from './converters';
import { getAccount } from '../account/util';
import { createAccountEntity } from '../account/converters';
import { generateEntityKey } from '../../utils/generateKey';

export async function fetchAgents(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Promise<void> {
  const { instance, jobState, logger } = context;
  const { accessKey, secretKey } = instance.config;

  const accountEntity = createAccountEntity(getAccount(context));

  const provider = new TenableClient({
    logger: logger,
    accessToken: accessKey,
    secretToken: secretKey,
  });

  const scannerIds = await jobState.getData<number[]>(DATA_SCANNER_IDS);
  if (!scannerIds) {
    return;
  }

  let duplicateKeysEncountered = 0;
  for (const scannerId of scannerIds) {
    await provider.iterateAgents(scannerId, async (agent) => {
      const agentEntity = createAgentEntity(agent);
      if (jobState.hasKey(agentEntity._key)) {
        logger.debug(
          {
            _key: agentEntity._key,
          },
          'Debug: duplicate agent _key encountered',
        );
        duplicateKeysEncountered += 1;
        return;
      }
      await jobState.addEntity(agentEntity);
      await jobState.addRelationship(
        createDirectRelationship({
          from: accountEntity,
          _class: RelationshipClass.HAS,
          to: agentEntity,
        }),
      );
    });
  }

  if (duplicateKeysEncountered > 0) {
    logger.info(
      { duplicateKeysEncountered },
      `Found duplicate keys for "tenable_agent" entity`,
    );
  }
}

export async function buildAgentRelationships(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: Entities.ASSET._type },
    async (assetEntity) => {
      const agentId =
        assetEntity.hasAgent && assetEntity.agentUuid
          ? formatToUUID(assetEntity.agentUuid as string)
          : undefined;
      if (agentId) {
        const agentEntity = await jobState.findEntity(
          generateEntityKey(Entities.AGENT._type, agentId),
        );
        if (agentEntity) {
          await jobState.addRelationship(
            createDirectRelationship({
              from: agentEntity,
              _class: RelationshipClass.PROTECTS,
              to: assetEntity,
            }),
          );
        } else {
          logger.warn(
            {
              assetKey: assetEntity._key,
              agentUuid: assetEntity.agentUuid,
              formattedAgentId: agentId,
            },
            `Asset's host agent could not be found`,
          );
        }
      }
    },
  );
}

function formatToUUID(input: string): string | undefined {
  const cleanInput = input.replace(/-/g, ''); // Remove all hyphens
  if (cleanInput.length === 32) {
    // Check valid length
    return `${cleanInput.slice(0, 8)}-${cleanInput.slice(
      8,
      12,
    )}-${cleanInput.slice(12, 16)}-${cleanInput.slice(
      16,
      20,
    )}-${cleanInput.slice(20)}`;
  }
}

export const agentsSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: StepIds.AGENTS,
    name: 'Fetch Agents',
    entities: [Entities.AGENT],
    relationships: [Relationships.ACCOUNT_HAS_AGENT],
    dependsOn: [StepIds.ACCOUNT, StepIds.SCANNER_IDS],
    executionHandler: fetchAgents,
  },
  {
    id: StepIds.AGENT_RELATIONSHIPS,
    name: 'Build Host Agent Protects Agents Relationship',
    entities: [],
    relationships: [Relationships.HOSTAGENT_PROTECTS_DEVICE],
    dependsOn: [StepIds.ASSETS, StepIds.AGENTS],
    executionHandler: buildAgentRelationships,
  },
];
