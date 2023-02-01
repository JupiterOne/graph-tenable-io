import {
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../config';
import { Entities, Relationships, StepIds } from '../../constants';
import { getAccount } from '../account/util';
import TenableClient from '../../tenable/TenableClient';
import { createAccountUserRelationship, createUserEntity } from './converters';

export async function fetchUsers(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
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
  IntegrationStepExecutionContext<IntegrationConfig>
> = {
  id: StepIds.USERS,
  name: 'Fetch Users',
  entities: [Entities.USER],
  relationships: [Relationships.ACCOUNT_HAS_USER],
  dependsOn: [StepIds.ACCOUNT],
  executionHandler: fetchUsers,
};
