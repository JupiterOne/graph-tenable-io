import {
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
import { entities, relationships } from "./jupiterone/entities";
import fetchEntitiesAndRelationships from "./jupiterone/fetchEntitiesAndRelationships";
import { publishChanges } from "./persister";
import { AssetExportCache, VulnerabilityExportCache } from "./tenable";
import { createAssetExportCache } from "./tenable/createAssetExportCache";
import { createVulnerabilityExportCache } from "./tenable/createVulnerabilityExportCache";
import fetchTenableData from "./tenable/fetchTenableData";
import {
  RecentScanSummary,
  ScanHost,
  ScanStatus,
  ScanVulnerabilitySummary,
  VulnerabilityExport,
} from "./tenable/types";
import { TenableIntegrationContext } from "./types";
import logObjectCounts from "./utils/logObjectCounts";

export default async function executionHandler(
  context: IntegrationExecutionContext,
): Promise<IntegrationExecutionResult> {
  const initializedContext = await initializeContext(context);
  return synchronize(initializedContext);
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

async function synchronizeAccount(
  context: TenableIntegrationContext,
): Promise<PersisterOperationsResult> {
  const { graph, persister, account } = context;
  const existingAccounts = await graph.findEntitiesByType(
    entities.ACCOUNT._type,
  );
  return persister.publishEntityOperations(
    persister.processEntities({
      oldEntities: existingAccounts,
      newEntities: [createAccountEntity(account)],
    }),
  );
}

async function synchronizeScans(
  context: TenableIntegrationContext,
  scanSummaries: RecentScanSummary[],
): Promise<PersisterOperationsResult> {
  const { graph, persister } = context;

  const existingScans = await graph.findEntitiesByType(entities.SCAN._type);

  const scanEntities = [];
  for (const scan of scanSummaries) {
    scanEntities.push(createScanEntity(scan));
  }

  return persister.publishEntityOperations(
    persister.processEntities({
      oldEntities: existingScans,
      newEntities: scanEntities,
    }),
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
    graph.findEntitiesByType(entities.USER._type),
    graph.findRelationshipsByType(relationships.ACCOUNT_HAS_USER._type),
    graph.findRelationshipsByType(relationships.USER_OWNS_SCAN._type),
  ]);

  return persister.publishPersisterOperations([
    persister.processEntities({
      oldEntities: existingUsers,
      newEntities: createUserEntities(users),
    }),
    [
      ...persister.processRelationships({
        oldRelationships: existingAccountUsers as IntegrationRelationship[],
        newRelationships: createAccountUserRelationships(account, users),
      }),
      ...persister.processRelationships({
        oldRelationships: existingUserScans as IntegrationRelationship[],
        newRelationships: createUserScanRelationships(scanSummaries, users),
      }),
    ],
  ]);
}

async function synchronizeHosts(
  context: TenableIntegrationContext,
  scanSummaries: RecentScanSummary[],
): Promise<PersisterOperationsResult> {
  const { provider, logger } = context;

  const assetCache = await createAssetExportCache(logger, provider);
  const vulnerabilityCache = await createVulnerabilityExportCache(
    logger,
    provider,
  );

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
        // If the scan detail is archived any calls
        // to sync the host details will give a 404 until
        // we add the export functionality requested by
        // Tenable. POST /scans/scan_id/export
        if (scanDetail.hosts && !scanDetail.info.is_archived) {
          context.logger.info(
            {
              scanDetailHosts: scanDetail.hosts.length,
            },
            "Processing scan detail hosts...",
          );
          for (const host of scanDetail.hosts) {
            operationResults.push(
              await synchronizeHostVulnerabilities(
                context,
                assetCache,
                vulnerabilityCache,
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
    relationships.SCAN_IDENTIFIED_VULNERABILITY._type,
    { scanUuid: scan.uuid },
  );

  const operations = persister.publishRelationshipOperations(
    persister.processRelationships({
      oldRelationships: existingScanVulnerabilityRelationships,
      newRelationships: scanVulnerabilityRelationships,
    }),
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
  assetCache: AssetExportCache,
  vulnerabilityCache: VulnerabilityExportCache,
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
      uuid: scanHost.uuid,
    },
  });

  const [
    scanHostVulnerabilities,
    existingFindingEntities,
    existingVulnerabilityFindingRelationships,
    existingScanFindingRelationships,
  ] = await Promise.all([
    provider.fetchScanHostVulnerabilities(scan.id, scanHost.host_id),
    graph.findEntitiesByType(entities.VULN_FINDING._type, {
      scanUuid: scan.uuid,
    }),
    graph.findRelationshipsByType(
      relationships.FINDING_IS_VULNERABILITY._type,
      {
        scanUuid: scan.uuid,
      },
    ),
    graph.findRelationshipsByType(relationships.SCAN_IDENTIFIED_FINDING._type, {
      scanUuid: scan.uuid,
    }),
  ]);

  const findingEntities = [];
  const vulnerabilityFindingRelationships = [];
  const scanFindingRelationships = [];

  const hostAsset = assetCache.findAssetExportByUuid(scanHost.uuid);

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
    let vulnerabilityExport: VulnerabilityExport | undefined;
    /* istanbul ignore next */
    if (assetUuid) {
      vulnerabilityExport = vulnerabilityCache.findVulnerabilityExportByAssetPluginUuid(
        assetUuid,
        vulnerability.plugin_id,
      );
    }

    findingEntities.push(
      createVulnerabilityFindingEntity({
        scan,
        asset: hostAsset,
        assetUuid,
        vulnerability,
        vulnerabilityExport,
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
    persister.processEntities({
      oldEntities: existingFindingEntities,
      newEntities: findingEntities,
    }),
    [
      ...persister.processRelationships({
        oldRelationships: existingVulnerabilityFindingRelationships as IntegrationRelationship[],
        newRelationships: vulnerabilityFindingRelationships,
      }),
      ...persister.processRelationships({
        oldRelationships: existingScanFindingRelationships as IntegrationRelationship[],
        newRelationships: scanFindingRelationships,
      }),
    ],
  ]);

  logger.info(
    "Processing host vulnerabilities discovered by recent scan completed.",
  );

  return operations;
}
