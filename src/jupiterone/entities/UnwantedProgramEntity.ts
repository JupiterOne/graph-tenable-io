import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export const UNWANTED_PROGRAM_ENTITY_TYPE = "tenable_unwanted_program";
export const UNWANTED_PROGRAM_ENTITY_CLASS = "Vulnerability";

export interface ContainerUnwantedProgramVulnerabilityEntity
  extends EntityFromIntegration {
  file: string;
  md5: string;
  sha256: string;
}
