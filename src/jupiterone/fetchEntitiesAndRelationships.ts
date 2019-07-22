import { GraphClient } from "@jupiterone/jupiter-managed-integration-sdk";

import * as Entities from "./entities";

export interface JupiterOneEntitiesData {
  accounts: Entities.AccountEntity[];
  users: Entities.UserEntity[];
  assets: Entities.AssetEntity[];
  scans: Entities.ScanEntity[];
  webAppVulnerabilities: Entities.ScanVulnerabilityEntity[];
  containers: Entities.ContainerEntity[];
  reports: Entities.ReportEntity[];
  malwares: Entities.MalwareVulnerabilityEntity[];
  findings: Entities.FindingVulnerabilityEntity[];
  unwantedPrograms: Entities.ContainerUnwantedProgramVulnerabilityEntity[];
}

export interface JupiterOneRelationshipsData {
  accountUserRelationships: Entities.AccountUserRelationship[];
  userScanRelationships: Entities.UserScanRelationship[];
  scanWebAppVulnerabilityRelationships: Entities.ScanVulnerabilityRelationship[];
  scanAssetRelationships: Entities.ScanAssetRelationship[];
  assetWebAppVulnerabilityRelationships: Entities.AssetScanVulnerabilityRelationship[];
  accountContainerRelationships: Entities.AccountContainerRelationship[];
  containerReportRelationships: Entities.ContainerReportRelationship[];
  reportMalwareRelationships: Entities.ReportMalwareRelationship[];
  reportFindingRelationships: Entities.ReportFindingRelationship[];
  reportUnwantedProgramRelationships: Entities.ReportUnwantedProgramRelationship[];
}

export interface JupiterOneDataModel {
  entities: JupiterOneEntitiesData;
  relationships: JupiterOneRelationshipsData;
}

export default async function fetchEntitiesAndRelationships(
  graph: GraphClient,
): Promise<JupiterOneDataModel> {
  const data: JupiterOneDataModel = {
    entities: await fetchEntities(graph),
    relationships: await fetchRelationships(graph),
  };

  return data;
}

async function fetchEntities(
  graph: GraphClient,
): Promise<JupiterOneEntitiesData> {
  const [
    accounts,
    users,
    assets,
    scans,
    webAppVulnerabilities,
    containers,
    reports,
    malwares,
    findings,
    unwantedPrograms,
  ] = await Promise.all([
    graph.findEntitiesByType<Entities.AccountEntity>(
      Entities.ACCOUNT_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.UserEntity>(Entities.USER_ENTITY_TYPE),
    graph.findEntitiesByType<Entities.AssetEntity>(Entities.ASSET_ENTITY_TYPE),
    graph.findEntitiesByType<Entities.ScanEntity>(Entities.SCAN_ENTITY_TYPE),
    graph.findEntitiesByType<Entities.ScanVulnerabilityEntity>(
      Entities.SCAN_VULNERABILITY_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.ContainerEntity>(
      Entities.CONTAINER_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.ReportEntity>(
      Entities.REPORT_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.MalwareVulnerabilityEntity>(
      Entities.MALWARE_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.FindingVulnerabilityEntity>(
      Entities.FINDING_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<
      Entities.ContainerUnwantedProgramVulnerabilityEntity
    >(Entities.UNWANTED_PROGRAM_ENTITY_TYPE),
  ]);

  return {
    accounts,
    users,
    assets,
    scans,
    webAppVulnerabilities,
    containers,
    reports,
    malwares,
    findings,
    unwantedPrograms,
  };
}

export async function fetchRelationships(
  graph: GraphClient,
): Promise<JupiterOneRelationshipsData> {
  const [
    accountUserRelationships,
    userScanRelationships,
    scanWebAppVulnerabilityRelationships,
    scanAssetRelationships,
    assetWebAppVulnerabilityRelationships,
    accountContainerRelationships,
    containerReportRelationships,
    reportMalwareRelationships,
    reportFindingRelationships,
    reportUnwantedProgramRelationships,
  ] = await Promise.all([
    graph.findRelationshipsByType<Entities.AccountUserRelationship>(
      Entities.ACCOUNT_USER_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.UserScanRelationship>(
      Entities.USER_OWNS_SCAN_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.ScanVulnerabilityRelationship>(
      Entities.SCAN_VULNERABILITY_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.ScanAssetRelationship>(
      Entities.SCAN_HAS_ASSET_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.AssetScanVulnerabilityRelationship>(
      Entities.ASSET_SCAN_VULNERABILITY_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.AccountContainerRelationship>(
      Entities.ACCOUNT_CONTAINER_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.ContainerReportRelationship>(
      Entities.CONTAINER_REPORT_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.ReportMalwareRelationship>(
      Entities.REPORT_MALWARE_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.ReportFindingRelationship>(
      Entities.REPORT_FINDING_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.ReportUnwantedProgramRelationship>(
      Entities.REPORT_UNWANTED_PROGRAM_RELATIONSHIP_TYPE,
    ),
  ]);

  return {
    accountUserRelationships,
    userScanRelationships,
    scanWebAppVulnerabilityRelationships,
    scanAssetRelationships,
    assetWebAppVulnerabilityRelationships,
    accountContainerRelationships,
    containerReportRelationships,
    reportMalwareRelationships,
    reportFindingRelationships,
    reportUnwantedProgramRelationships,
  };
}
