import {
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../config';
import { Entities, INGESTION_SOURCE_IDS, StepIds } from '../constants';
import { createAccountEntity } from './converters';
import { getAccount } from './util';

export async function fetchAccount(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Promise<void> {
  await context.jobState.addEntity(createAccountEntity(getAccount(context)));
}

export const accountStep: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
> = {
  id: StepIds.ACCOUNT,
  name: 'Fetch Account',
  entities: [Entities.ACCOUNT],
  ingestionSourceId: INGESTION_SOURCE_IDS.ACCOUNT,
  relationships: [],
  dependsOn: [],
  executionHandler: fetchAccount,
};
