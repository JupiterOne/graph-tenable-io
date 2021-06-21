import {
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import { TenableIntegrationConfig } from '../../config';
import { entities, StepIds } from '../../constants';
import TenableClient from '../../tenable/TenableClient';
import { createScanEntity } from './converters';

export async function fetchScans(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Promise<void> {
  const client = new TenableClient({
    logger: context.logger,
    accessToken: context.instance.config.accessKey,
    secretToken: context.instance.config.secretKey,
  });

  const scans = await client.fetchScans();

  for (const scan of scans) {
    await context.jobState.addEntity(createScanEntity(scan));
  }
}

export const scanStep: Step<
  IntegrationStepExecutionContext<TenableIntegrationConfig>
> = {
  id: StepIds.SCANS,
  name: 'Fetch Scans',
  entities: [entities.SCAN],
  relationships: [],
  dependsOn: [],
  executionHandler: fetchScans,
};
