import { GraphClient } from "@jupiterone/jupiter-managed-integration-sdk";
import * as Entities from "./entities";

export interface JupiterOneEntitiesData {
  accounts: Entities.AccountEntity[];
  users: Entities.UserEntity[];
  applications: Entities.AssetEntity[];
  assessments: Entities.ScanEntity[];
  webAppVulnerabilities: Entities.WebAppVulnerabilityEntity[];
}

export interface JupiterOneRelationshipsData {
  accountUserRelationships: Entities.AccountUserRelationship[];
  userAssessmentRelationships: Entities.UserScanRelationship[];
  assessmentWebAppVulnerabilityRelationships: Entities.ScanWebAppVulnerabilityRelationship[];
  assessmentApplicationRelationships: Entities.ScanAssetRelationship[];
  applicationWebAppVulnerabilityRelationships: Entities.AssetWebAppVulnerabilityRelationship[];
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
    applications,
    assessments,
    webAppVulnerabilities,
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
  ]);

  return {
    accounts,
    users,
    applications,
    assessments,
    webAppVulnerabilities,
  };
}

export async function fetchRelationships(
  graph: GraphClient,
): Promise<JupiterOneRelationshipsData> {
  const [
    accountUserRelationships,
    userAssessmentRelationships,
    assessmentWebAppVulnerabilityRelationships,
    assessmentApplicationRelationships,
    applicationWebAppVulnerabilityRelationships,
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
  ]);

  return {
    accountUserRelationships,
    userAssessmentRelationships,
    assessmentWebAppVulnerabilityRelationships,
    assessmentApplicationRelationships,
    applicationWebAppVulnerabilityRelationships,
  };
}
