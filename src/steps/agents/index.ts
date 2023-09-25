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

export const agentsStep: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
> = {
  id: StepIds.AGENTS,
  name: 'Fetch Agents',
  entities: [Entities.AGENT],
  relationships: [Relationships.ACCOUNT_HAS_AGENT],
  dependsOn: [StepIds.ACCOUNT, StepIds.SCANNER_IDS],
  executionHandler: fetchAgents,
};
