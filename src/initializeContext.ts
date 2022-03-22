import { IntegrationStepExecutionContext } from '@jupiterone/integration-sdk-core';
import { TenableIntegrationConfig } from './config';
import { Account } from './types';

export function getAccount(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Account {
  return {
    id: context.instance.id,
    name: context.instance.name,
  };
}
