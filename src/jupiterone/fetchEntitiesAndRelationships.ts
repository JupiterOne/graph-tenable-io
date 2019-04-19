import { GraphClient } from "@jupiterone/jupiter-managed-integration-sdk";
import * as Entities from "./entities";

export interface JupiterOneEntitiesData {
  accounts: Entities.AccountEntity[];
  users: Entities.UserEntity[];
  assets: Entities.AssetEntity[];
  scans: Entities.ScanEntity[];
  webAppVulnerabilities: Entities.WebAppVulnerabilityEntity[];
  containers: Entities.ContainerEntity[];
  reports: Entities.ReportEntity[];
  containerVulnerabilities: Entities.ContainerVulnerabilityEntity[];
}

export interface JupiterOneRelationshipsData {
  accountUserRelationships: Entities.AccountUserRelationship[];
  userScanRelationships: Entities.UserScanRelationship[];
  scanWebAppVulnerabilityRelationships: Entities.ScanWebAppVulnerabilityRelationship[];
  scanAssetRelationships: Entities.ScanAssetRelationship[];
  assetWebAppVulnerabilityRelationships: Entities.AssetWebAppVulnerabilityRelationship[];
  accountContainerRelationships: Entities.AccountContainerRelationship[];
  containerReportRelationships: Entities.ContainerReportRelationship[];
  reportContainerVulnerabilityRelationships: Entities.ReportContainerVulnerabilityRelationship[];
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
    containerVulnerabilities,
  ] = await Promise.all([
    graph.findEntitiesByType<Entities.AccountEntity>(
      Entities.ACCOUNT_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.UserEntity>(Entities.USER_ENTITY_TYPE),
    graph.findEntitiesByType<Entities.AssetEntity>(Entities.ASSET_ENTITY_TYPE),
    graph.findEntitiesByType<Entities.ScanEntity>(Entities.SCAN_ENTITY_TYPE),
    graph.findEntitiesByType<Entities.WebAppVulnerabilityEntity>(
      Entities.WEBAPP_VULNERABILITY_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.ContainerEntity>(
      Entities.CONTAINER_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.ReportEntity>(
      Entities.REPORT_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.ContainerVulnerabilityEntity>(
      Entities.CONTAINER_VULNERABILITY_ENTITY_TYPE,
    ),
  ]);

  return {
    accounts,
    users,
    assets,
    scans,
    webAppVulnerabilities,
    containers,
    reports,
    containerVulnerabilities,
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
    reportContainerVulnerabilityRelationships,
  ] = await Promise.all([
    graph.findRelationshipsByType<Entities.AccountUserRelationship>(
      Entities.ACCOUNT_USER_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.UserScanRelationship>(
      Entities.USER_OWNS_SCAN_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.ScanWebAppVulnerabilityRelationship>(
      Entities.SCAN_HAS_WEBAPP_VULNERABILITY_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.ScanAssetRelationship>(
      Entities.SCAN_HAS_ASSET_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<
      Entities.AssetWebAppVulnerabilityRelationship
    >(Entities.ASSET_HAS_WEBAPP_VULNERABILITY_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType<Entities.AccountContainerRelationship>(
      Entities.ACCOUNT_CONTAINER_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.ContainerReportRelationship>(
      Entities.CONTAINER_REPORT_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<
      Entities.ReportContainerVulnerabilityRelationship
    >(Entities.REPORT_CONTAINER_VULNERABILITY_RELATIONSHIP_TYPE),
  ]);

  return {
    accountUserRelationships,
    userScanRelationships,
    scanWebAppVulnerabilityRelationships,
    scanAssetRelationships,
    assetWebAppVulnerabilityRelationships,
    accountContainerRelationships,
    containerReportRelationships,
    reportContainerVulnerabilityRelationships,
  };
}
