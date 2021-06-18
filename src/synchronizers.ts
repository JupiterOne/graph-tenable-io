import {
  IntegrationRelationship,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { entities, relationships } from "./constants";
import {
  createAccountContainerRelationships,
  createAccountEntity,
  createAccountUserRelationships,
  createContainerEntities,
  createContainerFindingEntities,
  createContainerReportRelationships,
  createContainerReportUnwantedProgramRelationships,
  createMalwareEntities,
  createReportEntities,
  createReportFindingRelationships,
  createReportMalwareRelationships,
  createUnwantedProgramEntities,
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
import { AssetExportCache, VulnerabilityExportCache } from "./tenable";
import { createAssetExportCache } from "./tenable/createAssetExportCache";
import { createVulnerabilityExportCache } from "./tenable/createVulnerabilityExportCache";
import {
  Container,
  ContainerFinding,
  ContainerMalware,
  ContainerReport,
  ContainerUnwantedProgram,
  Dictionary,
  RecentScanSummary,
  ScanHost,
  ScanStatus,
  ScanVulnerabilitySummary,
  VulnerabilityExport,
} from "./tenable/types";
import { Account, TenableIntegrationContext } from "./types";

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

async function synchronizeContainers(
  { persister, graph, logger }: TenableIntegrationContext,
  containers: Container[],
  account: Account,
) {
  logger.info("Synchronizing containers");
  const containerEntityOperationsResult = await persister.publishEntityOperations(
    persister.processEntities({
      oldEntities: await graph.findEntitiesByType(entities.CONTAINER._type),
      newEntities: createContainerEntities(containers),
    }),
  );
  logger.info("Finished synchronizing containers");

  logger.info("Synchronizing account -> container relationships");
  const accountContainerRelationshipOperationsResult = await persister.publishRelationshipOperations(
    persister.processRelationships({
      oldRelationships: await graph.findRelationshipsByType(
        relationships.ACCOUNT_HAS_CONTAINER._type,
      ),
      newRelationships: createAccountContainerRelationships(
        account,
        containers,
      ),
    }),
  );
  logger.info("Finished synchronizing account -> container relationships");

  return summarizePersisterOperationsResults(
    containerEntityOperationsResult,
    accountContainerRelationshipOperationsResult,
  );
}

async function synchronizeContainerReports(
  { persister, graph, logger }: TenableIntegrationContext,
  containerReports: ContainerReport[],
  containers: Container[],
) {
  logger.info("Synchronizing container reports");
  const containerReportEntityOperationsResult = await persister.publishEntityOperations(
    persister.processEntities({
      oldEntities: await graph.findEntitiesByType(
        entities.CONTAINER_REPORT._type,
      ),
      newEntities: createReportEntities(containerReports),
    }),
  );
  logger.info("Finished synchronizing container reports");

  logger.info("Synchronizing container -> report relationships");
  const containerReportRelationshipOperationsResult = await persister.publishRelationshipOperations(
    persister.processRelationships({
      oldRelationships: await graph.findRelationshipsByType(
        relationships.CONTAINER_HAS_REPORT._type,
      ),
      newRelationships: createContainerReportRelationships(
        containers,
        containerReports,
      ),
    }),
  );
  logger.info("Finished synchronizing container -> report relationships");

  return summarizePersisterOperationsResults(
    containerReportEntityOperationsResult,
    containerReportRelationshipOperationsResult,
  );
}

async function synchronizeContainerMalware(
  { persister, graph, logger }: TenableIntegrationContext,
  containerReports: ContainerReport[],
) {
  const malwares: Dictionary<ContainerMalware[]> = {};

  for (const report of containerReports) {
    /* istanbul ignore next */
    if (!malwares[report.sha256]) {
      malwares[report.sha256] = [];
    }
    /* istanbul ignore next */
    malwares[report.sha256] = malwares[report.sha256].concat(report.malware);
  }

  logger.info("Synchronizing container malware");
  const malwareEntityOperationsResult = await persister.publishEntityOperations(
    persister.processEntities({
      oldEntities: await graph.findEntitiesByType(
        entities.CONTAINER_MALWARE._type,
      ),
      newEntities: createMalwareEntities(malwares),
    }),
  );
  logger.info("Finished synchronizing container malware");

  logger.info("Synchronizing report -> malware relationships");
  const reportMalwareRelationshipOperationsResult = await persister.publishRelationshipOperations(
    persister.processRelationships({
      oldRelationships: await graph.findRelationshipsByType(
        relationships.REPORT_IDENTIFIED_MALWARE._type,
      ),
      newRelationships: createReportMalwareRelationships(
        containerReports,
        malwares,
      ),
    }),
  );
  logger.info("Finished synchronizing report -> malware relationships");

  return summarizePersisterOperationsResults(
    malwareEntityOperationsResult,
    reportMalwareRelationshipOperationsResult,
  );
}

async function synchronizeContainerFindings(
  { persister, graph, logger }: TenableIntegrationContext,
  containerReports: ContainerReport[],
) {
  const findings: Dictionary<ContainerFinding[]> = {};

  for (const report of containerReports) {
    /* istanbul ignore next */
    if (!findings[report.sha256]) {
      findings[report.sha256] = [];
    }
    /* istanbul ignore next */
    findings[report.sha256] = findings[report.sha256].concat(report.findings);
  }

  logger.info("Synchronizing container finding");
  const findingEntityOperationsResult = await persister.publishEntityOperations(
    persister.processEntities({
      oldEntities: await graph.findEntitiesByType(
        entities.CONTAINER_FINDING._type,
      ),
      newEntities: createContainerFindingEntities(findings),
    }),
  );
  logger.info("Finished synchronizing container finding");

  logger.info("Synchronizing report -> finding relationships");
  const reportMalwareRelationshipOperationsResult = await persister.publishRelationshipOperations(
    persister.processRelationships({
      oldRelationships: await graph.findRelationshipsByType(
        relationships.REPORT_IDENTIFIED_FINDING._type,
      ),
      newRelationships: createReportFindingRelationships(
        containerReports,
        findings,
      ),
    }),
  );
  logger.info("Finished synchronizing report -> finding relationships");

  return summarizePersisterOperationsResults(
    findingEntityOperationsResult,
    reportMalwareRelationshipOperationsResult,
  );
}

async function synchronizeContainerUnwantedPrograms(
  { persister, graph, logger }: TenableIntegrationContext,
  containerReports: ContainerReport[],
) {
  const unwantedPrograms: Dictionary<ContainerUnwantedProgram[]> = {};

  for (const report of containerReports) {
    /* istanbul ignore next */
    if (!unwantedPrograms[report.sha256]) {
      unwantedPrograms[report.sha256] = [];
    }
    /* istanbul ignore next */
    unwantedPrograms[report.sha256] = unwantedPrograms[report.sha256].concat(
      report.potentially_unwanted_programs,
    );
  }

  logger.info("Synchronizing container unwanted programs");
  const findingEntityOperationsResult = await persister.publishEntityOperations(
    persister.processEntities({
      oldEntities: await graph.findEntitiesByType(
        entities.CONTAINER_UNWANTED_PROGRAM._type,
      ),
      newEntities: createUnwantedProgramEntities(unwantedPrograms),
    }),
  );
  logger.info("Finished synchronizing container unwanted programs");

  logger.info("Synchronizing report -> unwanted program relationships");
  const reportMalwareRelationshipOperationsResult = await persister.publishRelationshipOperations(
    persister.processRelationships({
      oldRelationships: await graph.findRelationshipsByType(
        relationships.CONTAINER_REPORT_IDENTIFIED_UNWANTED_PROGRAM._type,
      ),
      newRelationships: createContainerReportUnwantedProgramRelationships(
        containerReports,
        unwantedPrograms,
      ),
    }),
  );
  logger.info(
    "Finished synchronizing report -> unwanted program relationships",
  );

  return summarizePersisterOperationsResults(
    findingEntityOperationsResult,
    reportMalwareRelationshipOperationsResult,
  );
}

export {
  synchronizeAccount,
  synchronizeScans,
  synchronizeUsers,
  synchronizeHosts,
  synchronizeContainers,
  synchronizeContainerReports,
  synchronizeContainerMalware,
  synchronizeContainerFindings,
  synchronizeContainerUnwantedPrograms,
};
