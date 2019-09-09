import {
  EntityFromIntegration,
  MappedRelationshipFromIntegration,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";

export * from "./AccountContainerRelationship";
export * from "./AccountEntity";
export * from "./AccountUserRelationship";
export * from "./ContainerEntity";
export * from "./ContainerReportRelationship";
export * from "./FindingEntity";
export * from "./ContainerReportEntity";
export * from "./ReportFindingRelationship";
export * from "./ReportMalwareRelationship";
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

interface FindingRelationship {
  scanId: number;
  scanUuid: string;
  pluginId: number;

  /**
   * The UUID of the host/asset when provided in the `ScanHost` or discovered in
   * the assets listing using the hostname.
   *
   * Scans produce findings where the host has no UUID, or the UUID or hostname
   * of the host does not match an `AssetSummary` loaded by the
   * `TenableAssetCache`. In these cases, the `assetUuid` will be `undefined`;
   */
  assetUuid?: string;
}

export type ScanFindingRelationship = RelationshipFromIntegration &
  FindingRelationship;

export type VulnerabilityFindingRelationship = MappedRelationshipFromIntegration &
  FindingRelationship;
