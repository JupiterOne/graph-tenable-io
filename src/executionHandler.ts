import {
  IntegrationActionName,
  IntegrationExecutionContext,
  IntegrationExecutionResult,
  IntegrationRelationship,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  createAccountEntity,
  createAccountUserRelationships,
  createUserEntities,
  createUserScanRelationships,
} from "./converters";
import { createScanEntity } from "./converters/scans";
import {
  createScanFindingRelationship,
  createScanVulnerabilityRelationship,
  createVulnerabilityFindingEntity,
  createVulnerabilityFindingRelationship,
} from "./converters/vulnerabilities";
import initializeContext from "./initializeContext";
import * as Entities from "./jupiterone/entities";
import fetchEntitiesAndRelationships from "./jupiterone/fetchEntitiesAndRelationships";
import { publishChanges } from "./persister";
import { TenableAssetCache } from "./tenable";
import createTenableAssetCache from "./tenable/createTenableAssetCache";
import fetchTenableData from "./tenable/fetchTenableData";
import {
  AssetVulnerabilityInfo,
  RecentScanSummary,
  ScanHost,
  ScanStatus,
  ScanVulnerabilitySummary,
} from "./tenable/types";
import { TenableIntegrationContext } from "./types";
import logObjectCounts from "./utils/logObjectCounts";

export default async function executionHandler(
  context: IntegrationExecutionContext,
): Promise<IntegrationExecutionResult> {
  const actionFunction = ACTIONS[context.event.action.name];
  if (actionFunction) {
    return await actionFunction(await initializeContext(context));
  } else {
    return {};
  }
}

async function synchronize(
  context: TenableIntegrationContext,
): Promise<IntegrationExecutionResult> {
  const { graph, persister, provider, account } = context;

  const oldData = await fetchEntitiesAndRelationships(graph);
  const tenableData = await fetchTenableData(provider);

  logObjectCounts(context, oldData, tenableData);

  const operationResults: PersisterOperationsResult[] = [];

  const scans = await provider.fetchScans();

  operationResults.push(await synchronizeAccount(context));
  operationResults.push(await synchronizeScans(context, scans));
  operationResults.push(await synchronizeUsers(context, scans));
  operationResults.push(await synchronizeHosts(context, scans));

  return {
    operations: summarizePersisterOperationsResults(
      await removeDeprecatedEntities(context),
      await publishChanges({ persister, oldData, tenableData, account }),
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
        persister.processEntities(entitiesToDelete, []),
      );
    }),
  );

  results.push(
    await removeRelationshipsWithoutScanUuid(
      context,
      Entities.SCAN_VULNERABILITY_RELATIONSHIP_TYPE,
    ),
    await removeRelationshipsWithoutScanUuid(
      context,
      Entities.SCAN_FINDING_RELATIONSHIP_TYPE,
    ),
  );

  return summarizePersisterOperationsResults(...results);
}

async function removeRelationshipsWithoutScanUuid(
  context: TenableIntegrationContext,
  type: string,
) {
  const { graph, persister } = context;
  const relationships = await graph.findRelationshipsByType(type, {}, [
    "scanUuid",
  ]);
  return persister.publishRelationshipOperations(
    persister.processRelationships(relationships, []),
  );
}

async function synchronizeAccount(
  context: TenableIntegrationContext,
): Promise<PersisterOperationsResult> {
  const { graph, persister, account } = context;
  const existingAccounts = await graph.findEntitiesByType(
    Entities.ACCOUNT_ENTITY_TYPE,
  );
  return persister.publishEntityOperations(
    persister.processEntities(existingAccounts, [createAccountEntity(account)]),
  );
}

async function synchronizeScans(
  context: TenableIntegrationContext,
  scanSummaries: RecentScanSummary[],
): Promise<PersisterOperationsResult> {
  const { graph, persister } = context;

  const existingScans = await graph.findEntitiesByType(
    Entities.SCAN_ENTITY_TYPE,
  );

  const scanEntities = [];
  for (const scan of scanSummaries) {
    scanEntities.push(createScanEntity(scan));
  }

  return persister.publishEntityOperations(
    persister.processEntities(existingScans, scanEntities),
  );
}

async function synchronizeUsers(
  context: TenableIntegrationContext,
  scanSummaries: RecentScanSummary[],
): Promise<PersisterOperationsResult> {
  const { graph, persister, provider, account } = context;

  const [
    users,
    existingUsers,
    existingAccountUsers,
    existingUserScans,
  ] = await Promise.all([
    provider.fetchUsers(),
    graph.findEntitiesByType(Entities.USER_ENTITY_TYPE),
    graph.findRelationshipsByType(Entities.ACCOUNT_USER_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(Entities.USER_OWNS_SCAN_RELATIONSHIP_TYPE),
  ]);

  return persister.publishPersisterOperations([
    persister.processEntities(existingUsers, createUserEntities(users)),
    [
      ...persister.processRelationships(
        existingAccountUsers as IntegrationRelationship[],
        createAccountUserRelationships(account, users),
      ),
      ...persister.processRelationships(
        existingUserScans as IntegrationRelationship[],
        createUserScanRelationships(scanSummaries, users),
      ),
    ],
  ]);
}

async function synchronizeHosts(
  context: TenableIntegrationContext,
  scanSummaries: RecentScanSummary[],
): Promise<PersisterOperationsResult> {
  const { provider } = context;

  const assetCache = await createTenableAssetCache(provider);

  const operationResults: PersisterOperationsResult[] = [];

  /* istanbul ignore next */
  for (const scanSummary of scanSummaries) {
    if (scanSummary.status === ScanStatus.Completed) {
      const scanDetail = await provider.fetchScanDetail(scanSummary);
      if (scanDetail) {
        if (scanDetail.vulnerabilities) {
          operationResults.push(
            await synchronizeScanVulnerabilities(
              context,
              scanSummary,
              scanDetail.vulnerabilities,
            ),
          );
        }
        if (scanDetail.hosts) {
          for (const host of scanDetail.hosts) {
            operationResults.push(
              await synchronizeHostVulnerabilities(
                context,
                assetCache,
                scanSummary,
                host,
              ),
            );
          }
        }
      }
    }
  }

  return summarizePersisterOperationsResults(...operationResults);
}

async function synchronizeScanVulnerabilities(
  context: TenableIntegrationContext,
  scan: RecentScanSummary,
  vulnerabilties: ScanVulnerabilitySummary[],
): Promise<PersisterOperationsResult> {
  const { logger, graph, persister } = context;

  const vulnLogger = logger.child({
    scan: {
      id: scan.id,
      uuid: scan.uuid,
    },
  });

  vulnLogger.info(
    { scanVulnerabilities: vulnerabilties.length },
    "Processing vulnerabilities discovered by recent scan...",
  );

  const scanVulnerabilityRelationships = [];
  for (const vuln of vulnerabilties) {
    scanVulnerabilityRelationships.push(
      createScanVulnerabilityRelationship(scan, vuln),
    );
  }

  const existingScanVulnerabilityRelationships = await graph.findRelationshipsByType(
    Entities.SCAN_VULNERABILITY_RELATIONSHIP_TYPE,
    { scanUuid: scan.uuid },
  );

  const operations = persister.publishRelationshipOperations(
    persister.processRelationships(
      existingScanVulnerabilityRelationships,
      scanVulnerabilityRelationships,
    ),
  );

  vulnLogger.info(
    "Processing vulnerabilities discovered by recent scan completed.",
  );

  return operations;
}

/**
 * Creates findings for each host vulnerability identified by the scan. Note
 * that multiple different scans may identify the same vulnerability; the graph
 * will have a finding of the vulnerability for each scan because they are
 * different findings.
 */
async function synchronizeHostVulnerabilities(
  context: TenableIntegrationContext,
  assetCache: TenableAssetCache,
  scan: RecentScanSummary,
  scanHost: ScanHost,
): Promise<PersisterOperationsResult> {
  const { logger, graph, persister, provider } = context;

  const vulnLogger = logger.child({
    scan: {
      id: scan.id,
      uuid: scan.uuid,
    },
    scanHost: {
      hostname: scanHost.hostname,
      id: scanHost.host_id,
      uuid: scanHost.uuid || "NONE",
    },
  });

  const [
    scanHostVulnerabilities,
    existingFindingEntities,
    existingVulnerabilityFindingRelationships,
    existingScanFindingRelationships,
  ] = await Promise.all([
    provider.fetchScanHostVulnerabilities(scan.id, scanHost.host_id),
    graph.findEntitiesByType(Entities.VULNERABILITY_FINDING_ENTITY_TYPE, {
      scanUuid: scan.uuid,
    }),
    graph.findRelationshipsByType(
      Entities.VULNERABILITY_FINDING_RELATIONSHIP_TYPE,
      { scanUuid: scan.uuid },
    ),
    graph.findRelationshipsByType(Entities.SCAN_FINDING_RELATIONSHIP_TYPE, {
      scanUuid: scan.uuid,
    }),
  ]);

  const findingEntities = [];
  const vulnerabilityFindingRelationships = [];
  const scanFindingRelationships = [];

  const hostAsset = assetCache.findAsset(scanHost);

  /* istanbul ignore next */
  if (!hostAsset) {
    vulnLogger.info(
      "No asset found for scan host, some details cannot be provided",
    );
  }

  /* istanbul ignore next */
  const assetUuid = hostAsset ? hostAsset.id : scanHost.uuid;

  logger.info(
    {
      assetUuid,
      scanHostVulnerabilities: scanHostVulnerabilities.length,
    },
    "Processing host vulnerabilities discovered by recent scan...",
  );

  for (const vulnerability of scanHostVulnerabilities) {
    let vulnerabilityDetails: AssetVulnerabilityInfo | undefined;
    /* istanbul ignore next */
    if (assetUuid) {
      vulnerabilityDetails = await provider.fetchAssetVulnerabilityInfo(
        assetUuid,
        vulnerability,
      );
    }

    findingEntities.push(
      createVulnerabilityFindingEntity({
        scan,
        asset: hostAsset,
        assetUuid,
        vulnerability,
        vulnerabilityDetails,
      }),
    );

    vulnerabilityFindingRelationships.push(
      createVulnerabilityFindingRelationship({
        scan,
        assetUuid,
        vulnerability,
      }),
    );

    scanFindingRelationships.push(
      createScanFindingRelationship({ scan, assetUuid, vulnerability }),
    );
  }

  const operations = persister.publishPersisterOperations([
    persister.processEntities(existingFindingEntities, findingEntities),
    [
      ...persister.processRelationships(
        existingVulnerabilityFindingRelationships as IntegrationRelationship[],
        vulnerabilityFindingRelationships,
      ),
      ...persister.processRelationships(
        existingScanFindingRelationships as IntegrationRelationship[],
        scanFindingRelationships,
      ),
    ],
  ]);

  logger.info(
    "Processing host vulnerabilities discovered by recent scan completed.",
  );

  return operations;
}

type ActionFunction = (
  context: TenableIntegrationContext,
) => Promise<IntegrationExecutionResult>;

interface ActionMap {
  [actionName: string]: ActionFunction | undefined;
}

const ACTIONS: ActionMap = {
  [IntegrationActionName.INGEST]: synchronize,
};
