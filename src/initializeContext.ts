import { IntegrationStepExecutionContext } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from './config';
import { Account } from './types';

export function getAccount(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Account {
  return {
    id: context.instance.id,
    name: context.instance.name,
  };
}
