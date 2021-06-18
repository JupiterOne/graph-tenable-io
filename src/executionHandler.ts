import {
  IntegrationExecutionContext,
  IntegrationExecutionResult,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { relationships } from "./constants";
import initializeContext from "./initializeContext";
import {
  synchronizeAccount,
  synchronizeContainerFindings,
  synchronizeContainerMalware,
  synchronizeContainerReports,
  synchronizeContainers,
  synchronizeContainerUnwantedPrograms,
  synchronizeHosts,
  synchronizeScans,
  synchronizeUsers,
} from "./synchronizers";
import { TenableIntegrationContext } from "./types";

export default async function executionHandler(
  context: IntegrationExecutionContext,
): Promise<IntegrationExecutionResult> {
  const initializedContext = await initializeContext(context);
  return synchronize(initializedContext);
}

async function synchronize(
  context: TenableIntegrationContext,
): Promise<IntegrationExecutionResult> {
  const { provider, account } = context;

  const operationResults: PersisterOperationsResult[] = [];

  const scans = await provider.fetchScans();

  context.logger.info(
    {
      scans: scans.length,
    },
    "Processing scans...",
  );
  operationResults.push(await synchronizeAccount(context));
  operationResults.push(await synchronizeScans(context, scans));
  operationResults.push(await synchronizeUsers(context, scans));
  operationResults.push(await synchronizeHosts(context, scans));

  const containers = await provider.fetchContainers();
  operationResults.push(
    await synchronizeContainers(context, containers, account),
  );

  /* istanbul ignore next */
  const containerReports = await Promise.all(
    containers.map(async c => provider.fetchReportByImageDigest(c.digest)),
  );
  operationResults.push(
    await synchronizeContainerReports(context, containerReports, containers),
  );

  operationResults.push(
    await synchronizeContainerMalware(context, containerReports),
  );
  operationResults.push(
    await synchronizeContainerFindings(context, containerReports),
  );
  operationResults.push(
    await synchronizeContainerUnwantedPrograms(context, containerReports),
  );

  return {
    operations: summarizePersisterOperationsResults(
      await removeDeprecatedEntities(context),
      ...operationResults,
    ),
  };
}

async function removeDeprecatedEntities(
  context: TenableIntegrationContext,
): Promise<PersisterOperationsResult> {
  const { graph, persister } = context;
  const results = await Promise.all(
    [
      "tenable_asset",
      "tenable_report",
      "tenable_finding",
      "tenable_malware",
      "tenable_unwanted_program",
      "tenable_webapp_vulnerability",
    ].map(async t => {
      const entitiesToDelete = await graph.findEntitiesByType(t);
      return persister.publishEntityOperations(
        persister.processEntities({
          oldEntities: entitiesToDelete,
          newEntities: [],
        }),
      );
    }),
  );

  results.push(
    await removeRelationshipsWithoutScanUuid(
      context,
      relationships.SCAN_IDENTIFIED_VULNERABILITY._type,
    ),
    await removeRelationshipsWithoutScanUuid(
      context,
      relationships.SCAN_IDENTIFIED_FINDING._type,
    ),
  );

  return summarizePersisterOperationsResults(...results);
}

async function removeRelationshipsWithoutScanUuid(
  context: TenableIntegrationContext,
  type: string,
) {
  const { graph, persister } = context;
  const relationshipsWithoutScanUuid = await graph.findRelationshipsByType(
    type,
    {},
    ["scanUuid"],
  );
  return persister.publishRelationshipOperations(
    persister.processRelationships({
      oldRelationships: relationshipsWithoutScanUuid,
      newRelationships: [],
    }),
  );
}
