import {
  getRawData,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { TenableIntegrationConfig } from './config';
import { entities } from './constants';
import { getAccount } from './initializeContext';
import {
  synchronizeContainerFindings,
  synchronizeContainerMalware,
  synchronizeContainerReports,
  synchronizeContainers,
  synchronizeContainerUnwantedPrograms,
  synchronizeHosts,
  synchronizeUsers,
} from './synchronizers';
import TenableClient from './tenable/TenableClient';
import { RecentScanSummary } from './tenable/types';

export default async function executionHandler(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Promise<void> {
  return synchronize(context);
}

async function synchronize(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Promise<void> {
  const provider = new TenableClient({
    logger: context.logger,
    accessToken: context.instance.config.accessKey,
    secretToken: context.instance.config.secretKey,
  });

  const scans: RecentScanSummary[] = [];

  await context.jobState.iterateEntities(
    { _type: entities.SCAN._type },
    (scanEntity) => {
      const scan = getRawData<RecentScanSummary>(scanEntity);
      if (!scan) return;
      scans.push(scan);
    },
  );

  await synchronizeUsers(context, scans);
  await synchronizeHosts(context, scans);

  const containers = await provider.fetchContainers();
  await synchronizeContainers(context, containers, getAccount(context));

  /* istanbul ignore next */
  const containerReports = await Promise.all(
    containers.map(async (c) => provider.fetchReportByImageDigest(c.digest)),
  );
  await synchronizeContainerReports(context, containerReports, containers);

  await synchronizeContainerMalware(context, containerReports);
  await synchronizeContainerFindings(context, containerReports);
  await synchronizeContainerUnwantedPrograms(context, containerReports);
}
