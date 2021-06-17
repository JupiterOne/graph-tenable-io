import {
  EntityFromIntegration,
  GraphClient,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  ACCOUNT_CONTAINER_RELATIONSHIP_TYPE,
  AccountContainerRelationship,
  CONTAINER_REPORT_RELATIONSHIP_TYPE,
  CONTAINER_REPORT_UNWANTED_PROGRAM_RELATIONSHIP_TYPE,
  ContainerReportRelationship,
  ContainerReportUnwantedProgramRelationship,
  entities,
  REPORT_FINDING_RELATIONSHIP_TYPE,
  REPORT_MALWARE_RELATIONSHIP_TYPE,
  ReportFindingRelationship,
  ReportMalwareRelationship,
} from "./entities";

export interface JupiterOneEntitiesData {
  containers: EntityFromIntegration[];
  containerReports: EntityFromIntegration[];
  containerMalwares: EntityFromIntegration[];
  containerFindings: EntityFromIntegration[];
  containerUnwantedPrograms: EntityFromIntegration[];
}

export interface JupiterOneRelationshipsData {
  accountContainerRelationships: AccountContainerRelationship[];
  containerReportRelationships: ContainerReportRelationship[];
  reportMalwareRelationships: ReportMalwareRelationship[];
  reportFindingRelationships: ReportFindingRelationship[];
  reportUnwantedProgramRelationships: ContainerReportUnwantedProgramRelationship[];
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
    graph.findRelationshipsByType<AccountContainerRelationship>(
      ACCOUNT_CONTAINER_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<ContainerReportRelationship>(
      CONTAINER_REPORT_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<ReportMalwareRelationship>(
      REPORT_MALWARE_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<ReportFindingRelationship>(
      REPORT_FINDING_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<ContainerReportUnwantedProgramRelationship>(
      CONTAINER_REPORT_UNWANTED_PROGRAM_RELATIONSHIP_TYPE,
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
