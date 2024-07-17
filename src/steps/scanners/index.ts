import TenableClient from '../../tenable/TenableClient';
import {
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import { INGESTION_SOURCE_IDS, StepIds } from '../constants';
import { IntegrationConfig } from '../../config';
import { DATA_SCANNER_IDS } from './constants';

export async function fetchScannerIds({
  jobState,
  logger,
  instance,
}: IntegrationStepExecutionContext<IntegrationConfig>): Promise<void> {
  const { accessKey, secretKey } = instance.config;

  const provider = new TenableClient({
    logger: logger,
    accessToken: accessKey,
    secretToken: secretKey,
  });

  const scannerIds: number[] = [];
  await provider.iterateScanners((scanner) => {
    scannerIds.push(scanner.id);
  });

  await jobState.setData(DATA_SCANNER_IDS, scannerIds);
}

export const scannerStep: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
> = {
  id: StepIds.SCANNER_IDS,
  name: 'Fetch Scanner IDs',
  entities: [],
  ingestionSourceId: INGESTION_SOURCE_IDS.SCANNER_IDS,
  relationships: [],
  dependsOn: [],
  executionHandler: fetchScannerIds,
};
