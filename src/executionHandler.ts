import {
  getRawData,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { TenableIntegrationConfig } from './config';
import { entities } from './constants';
import { synchronizeHosts } from './synchronizers';
import { RecentScanSummary } from './tenable/types';

export default async function executionHandler(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Promise<void> {
  return synchronize(context);
}

async function synchronize(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Promise<void> {
  const scans: RecentScanSummary[] = [];

  await context.jobState.iterateEntities(
    { _type: entities.SCAN._type },
    (scanEntity) => {
      const scan = getRawData<RecentScanSummary>(scanEntity);
      if (!scan) return;
      scans.push(scan);
    },
  );

  await synchronizeHosts(context, scans);
}
