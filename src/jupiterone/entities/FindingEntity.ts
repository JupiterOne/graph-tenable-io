import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export const VULNERABILITY_FINDING_ENTITY_TYPE =
  "tenable_vulnerability_finding";
export const VULNERABILITY_FINDING_ENTITY_CLASS = "Finding";

export const CONTAINER_FINDING_ENTITY_TYPE = "tenable_container_finding";
export const CONTAINER_FINDING_ENTITY_CLASS = "Finding";

export interface VulnerabilityFindingEntity extends EntityFromIntegration {
  scanId: number;
  hostId: number;
  hostname: string;
}

export interface ContainerFindingEntity extends EntityFromIntegration {
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
