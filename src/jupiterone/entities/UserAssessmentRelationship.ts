import { RelationshipFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export type UserAssessmentRelationship = RelationshipFromIntegration;

export const USER_HAS_ASSESSMENT_RELATIONSHIP_TYPE =
  "tenable_user_owns_tenable_scan";
export const USER_HAS_ASSESSMENT_RELATIONSHIP_CLASS = "OWNS";
