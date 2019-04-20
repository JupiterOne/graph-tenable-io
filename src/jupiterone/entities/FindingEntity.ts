import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export const FINDING_ENTITY_TYPE = "tenable_finding";
export const FINDING_ENTITY_CLASS = "Vulnerability";

export interface FindingVulnerabilityEntity extends EntityFromIntegration {
  referenceId: string;
  cve: string;
  publishedDate: string;
  modifiedDate: string;
  description: string;
  cvssScore: string;
  accessVector: string;
  accessComplexity: string;
  auth: string;
  availabilityImpact: string;
  confidentialityImpact: string;
  integrityImpact: string;
  cwe: string;
  remediation: string;
}
