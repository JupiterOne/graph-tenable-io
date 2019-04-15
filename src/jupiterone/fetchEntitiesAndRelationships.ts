import { GraphClient } from "@jupiterone/jupiter-managed-integration-sdk";
import * as Entities from "./entities";

export interface JupiterOneEntitiesData {
  users: Entities.UserEntity[],
  applications: Entities.ApplicationEntity[],
  assessments: Entities.AssessmentEntity[],
  vulnerabilities: Entities.VulnerabilityEntity[],
}

// @ts-ignore
export interface JupiterOneRelationshipsData {
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
    users,
    applications,
    assessments,
    vulnerabilities,
  ] = await Promise.all([
    graph.findEntitiesByType<Entities.UserEntity>(Entities.USER_ENTITY_TYPE),
    graph.findEntitiesByType<Entities.ApplicationEntity>(Entities.APPLICATION_ENTITY_TYPE),
    graph.findEntitiesByType<Entities.AssessmentEntity>(Entities.ASSESSMENT_ENTITY_TYPE),
    graph.findEntitiesByType<Entities.VulnerabilityEntity>(Entities.VULNERABILITY_ENTITY_TYPE),
  ]);

  return {
    users,
    applications,
    assessments,
    vulnerabilities,
  };
}

export async function fetchRelationships(
  graph: GraphClient,
): Promise<JupiterOneRelationshipsData> {
  const [] = await Promise.all([]);

  return {};
}
