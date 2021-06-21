import {
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import { TenableIntegrationConfig } from '../../config';
import { entities, relationships, StepIds } from '../../constants';
import { getAccount } from '../../initializeContext';
import TenableClient from '../../tenable/TenableClient';
import { createAccountUserRelationship, createUserEntity } from './converters';

export async function fetchUsers(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Promise<void> {
  const { jobState, logger, instance } = context;
  const client = new TenableClient({
    logger: logger,
    accessToken: instance.config.accessKey,
    secretToken: instance.config.secretKey,
  });

  const account = getAccount(context);
  const users = await client.fetchUsers();

  for (const user of users) {
    await jobState.addEntity(createUserEntity(user));
    await jobState.addRelationship(
      createAccountUserRelationship(account, user),
    );
  }
}

export const userStep: Step<
  IntegrationStepExecutionContext<TenableIntegrationConfig>
> = {
  id: StepIds.USERS,
  name: 'Fetch Users',
  entities: [entities.USER],
  relationships: [relationships.ACCOUNT_HAS_USER],
  dependsOn: [],
  executionHandler: fetchUsers,
};
