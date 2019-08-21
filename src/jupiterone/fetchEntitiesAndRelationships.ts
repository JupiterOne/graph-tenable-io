import { GraphClient } from "@jupiterone/jupiter-managed-integration-sdk";

import * as Entities from "./entities";

export interface JupiterOneEntitiesData {
  containers: Entities.ContainerEntity[];
  containerReports: Entities.ContainerReportEntity[];
  containerMalwares: Entities.ContainerMalwareEntity[];
  containerFindings: Entities.ContainerFindingEntity[];
  containerUnwantedPrograms: Entities.ContainerUnwantedProgramEntity[];
}

export interface JupiterOneRelationshipsData {
  accountContainerRelationships: Entities.AccountContainerRelationship[];
  containerReportRelationships: Entities.ContainerReportRelationship[];
  reportMalwareRelationships: Entities.ReportMalwareRelationship[];
  reportFindingRelationships: Entities.ReportFindingRelationship[];
  reportUnwantedProgramRelationships: Entities.ContainerReportUnwantedProgramRelationship[];
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
    graph.findEntitiesByType<Entities.ContainerEntity>(
      Entities.CONTAINER_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.ContainerReportEntity>(
      Entities.CONTAINER_REPORT_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.ContainerMalwareEntity>(
      Entities.CONTAINER_MALWARE_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.ContainerFindingEntity>(
      Entities.CONTAINER_FINDING_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.ContainerUnwantedProgramEntity>(
      Entities.CONTAINER_UNWANTED_PROGRAM_ENTITY_TYPE,
    ),
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
    graph.findRelationshipsByType<
      Entities.ContainerReportUnwantedProgramRelationship
    >(Entities.CONTAINER_REPORT_UNWANTED_PROGRAM_RELATIONSHIP_TYPE),
  ]);

  return {
    accountContainerRelationships,
    containerReportRelationships,
    reportMalwareRelationships,
    reportFindingRelationships,
    reportUnwantedProgramRelationships,
  };
}
