import {
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import { TenableIntegrationConfig } from '../../config';
import { entities, StepIds } from '../../constants';
import { createAccountEntity } from './converters';
import { getAccount } from '../../initializeContext';

export async function fetchAccount(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Promise<void> {
  await context.jobState.addEntity(createAccountEntity(getAccount(context)));
}

export const accountStep: Step<
  IntegrationStepExecutionContext<TenableIntegrationConfig>
> = {
  id: StepIds.ACCOUNT,
  name: 'Fetch Account',
  entities: [entities.ACCOUNT],
  relationships: [],
  dependsOn: [],
  executionHandler: fetchAccount,
};
