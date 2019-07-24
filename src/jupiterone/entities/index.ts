import {
  EntityFromIntegration,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";

export * from "./AccountContainerRelationship";
export * from "./AccountEntity";
export * from "./AccountUserRelationship";
export * from "./AssetEntity";
export * from "./AssetScanVulnerabilityRelationship";
export * from "./ContainerEntity";
export * from "./ContainerReportRelationship";
export * from "./FindingEntity";
export * from "./ContainerReportEntity";
export * from "./ReportFindingRelationship";
export * from "./ReportMalwareRelationship";
export * from "./ScanAssetRelationship";
export * from "./ScanEntity";
export * from "./TenableVulnerabilityEntity";
export * from "./ScanVulnerabilityRelationship";
export * from "./UserEntity";
export * from "./UserScanRelationship";

export const CONTAINER_MALWARE_ENTITY_TYPE = "tenable_container_malware";
export const CONTAINER_MALWARE_ENTITY_CLASS = "Finding";

export const CONTAINER_REPORT_UNWANTED_PROGRAM_RELATIONSHIP_TYPE =
  "tenable_container_report_identified_unwanted_program";
export const CONTAINER_REPORT_UNWANTED_PROGRAM_RELATIONSHIP_CLASS =
  "IDENTIFIED";

export const CONTAINER_UNWANTED_PROGRAM_ENTITY_TYPE =
  "tenable_container_unwanted_program";
export const CONTAINER_UNWANTED_PROGRAM_ENTITY_CLASS = "Finding";

export const VULNERABILITY_FINDING_RELATIONSHIP_TYPE =
  "tenable_vulnerability_finding_is_vulnerability";
export const VULNERABILITY_FINDING_RELATIONSHIP_CLASS = "IS";

export const SCAN_FINDING_RELATIONSHIP_TYPE = "tenable_scan_identified_finding";
export const SCAN_FINDING_RELATIONSHIP_CLASS = "IDENTIFIED";

export type ContainerReportUnwantedProgramRelationship = RelationshipFromIntegration;

export interface ContainerMalwareEntity extends EntityFromIntegration {
  infectedFile: string;
  fileTypeDescriptor: string;
  md5: string;
  sha256: string;
}

export interface ContainerUnwantedProgramEntity extends EntityFromIntegration {
  file: string;
  md5: string;
  sha256: string;
}

export type ScanFindingRelationship = RelationshipFromIntegration;

export type VulnerabilityFindingRelationship = RelationshipFromIntegration;
