import {
  EntityFromIntegration,
  GraphClient,
  IntegrationRelationship,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { entities, relationships } from "./entities";

export interface JupiterOneEntitiesData {
  containers: EntityFromIntegration[];
  containerReports: EntityFromIntegration[];
  containerMalwares: EntityFromIntegration[];
  containerFindings: EntityFromIntegration[];
  containerUnwantedPrograms: EntityFromIntegration[];
}

export interface JupiterOneRelationshipsData {
  accountContainerRelationships: IntegrationRelationship[];
  containerReportRelationships: IntegrationRelationship[];
  reportMalwareRelationships: IntegrationRelationship[];
  reportFindingRelationships: IntegrationRelationship[];
  reportUnwantedProgramRelationships: IntegrationRelationship[];
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
    containers,
    containerReports,
    containerMalwares,
    containerFindings,
    containerUnwantedPrograms,
  ] = await Promise.all([
    graph.findEntitiesByType(entities.CONTAINER._type),
    graph.findEntitiesByType(entities.CONTAINER_REPORT._type),
    graph.findEntitiesByType(entities.CONTAINER_MALWARE._type),
    graph.findEntitiesByType(entities.CONTAINER_FINDING._type),
    graph.findEntitiesByType(entities.CONTAINER_UNWANTED_PROGRAM._type),
  ]);

  return {
    containers,
    containerReports,
    containerMalwares,
    containerFindings,
    containerUnwantedPrograms,
  };
}

export async function fetchRelationships(
  graph: GraphClient,
): Promise<JupiterOneRelationshipsData> {
  const [
    accountContainerRelationships,
    containerReportRelationships,
    reportMalwareRelationships,
    reportFindingRelationships,
    reportUnwantedProgramRelationships,
  ] = await Promise.all([
    graph.findRelationshipsByType(relationships.ACCOUNT_HAS_CONTAINER._type),
    graph.findRelationshipsByType(relationships.CONTAINER_HAS_REPORT._type),
    graph.findRelationshipsByType(
      relationships.REPORT_IDENTIFIED_MALWARE._type,
    ),
    graph.findRelationshipsByType(
      relationships.REPORT_IDENTIFIED_FINDING._type,
    ),
    graph.findRelationshipsByType(
      relationships.CONTAINER_REPORT_IDENTIFIED_UNWANTED_PROGRAM._type,
    ),
  ]);

  return {
    accountContainerRelationships,
    containerReportRelationships,
    reportMalwareRelationships,
    reportFindingRelationships,
    reportUnwantedProgramRelationships,
  };
}
