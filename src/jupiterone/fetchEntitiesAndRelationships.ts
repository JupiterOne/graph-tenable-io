import { GraphClient } from "@jupiterone/jupiter-managed-integration-sdk";
import * as Entities from "./entities";

export interface JupiterOneEntitiesData {
  accounts: Entities.AccountEntity[];
  users: Entities.UserEntity[];
  applications: Entities.ApplicationEntity[];
  assessments: Entities.AssessmentEntity[];
  vulnerabilities: Entities.VulnerabilityEntity[];
}

export interface JupiterOneRelationshipsData {
  accountUserRelationships: Entities.AccountUserRelationship[];
  userAssessmentRelationships: Entities.UserAssessmentRelationship[];
  assessmentVulnerabilityRelationships: Entities.AssessmentVulnerabilityRelationship[];
  assessmentApplicationRelationships: Entities.AssessmentApplicationRelationship[];
  applicationVulnerabilityRelationships: Entities.ApplicationVulnerabilityRelationship[];
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
    vulnerabilities,
  ] = await Promise.all([
    graph.findEntitiesByType<Entities.AccountEntity>(
      Entities.ACCOUNT_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.UserEntity>(Entities.USER_ENTITY_TYPE),
    graph.findEntitiesByType<Entities.ApplicationEntity>(
      Entities.APPLICATION_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.AssessmentEntity>(
      Entities.ASSESSMENT_ENTITY_TYPE,
    ),
    graph.findEntitiesByType<Entities.VulnerabilityEntity>(
      Entities.VULNERABILITY_ENTITY_TYPE,
    ),
  ]);

  return {
    accounts,
    users,
    applications,
    assessments,
    vulnerabilities,
  };
}

export async function fetchRelationships(
  graph: GraphClient,
): Promise<JupiterOneRelationshipsData> {
  const [
    accountUserRelationships,
    userAssessmentRelationships,
    assessmentVulnerabilityRelationships,
    assessmentApplicationRelationships,
    applicationVulnerabilityRelationships,
  ] = await Promise.all([
    graph.findRelationshipsByType<Entities.AccountUserRelationship>(
      Entities.ACCOUNT_USER_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.UserAssessmentRelationship>(
      Entities.USER_HAS_ASSESSMENT_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.AssessmentVulnerabilityRelationship>(
      Entities.ASSESSMENT_HAS_VULNERABILITY_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<Entities.AssessmentApplicationRelationship>(
      Entities.ASSESSMENT_HAS_APPLICATION_RELATIONSHIP_TYPE,
    ),
    graph.findRelationshipsByType<
      Entities.ApplicationVulnerabilityRelationship
    >(Entities.APPLICATION_HAS_VULNERABILITY_RELATIONSHIP_TYPE),
  ]);

  return {
    accountUserRelationships,
    userAssessmentRelationships,
    assessmentVulnerabilityRelationships,
    assessmentApplicationRelationships,
    applicationVulnerabilityRelationships,
  };
}
