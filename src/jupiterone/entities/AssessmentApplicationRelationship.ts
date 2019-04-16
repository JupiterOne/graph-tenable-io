import { RelationshipFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export type AssessmentApplicationRelationship = RelationshipFromIntegration;

export const ASSESSMENT_HAS_APPLICATION_RELATIONSHIP_TYPE =
  "tenable_scan_has_tenable_asset";
export const ASSESSMENT_HAS_APPLICATION_RELATIONSHIP_CLASS = "HAS";
