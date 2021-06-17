import {
  MappedRelationshipFromIntegration,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";

export * from "./AccountContainerRelationship";
export * from "./AccountUserRelationship";
export * from "./ContainerReportRelationship";
export * from "./ReportFindingRelationship";
export * from "./ReportMalwareRelationship";
export * from "./TenableVulnerabilityEntity";
export * from "./ScanVulnerabilityRelationship";
export * from "./UserScanRelationship";

export const entities = {
  ACCOUNT: {
    resourceName: "Account",
    _class: "Account",
    _type: "tenable_account",
  },
  CONTAINER: {
    resourceName: "Container",
    _class: "Image",
    _type: "tenable_container",
  },
  // TODO does the report entity simply include container details, can we really get rid of this entity?
  CONTAINER_REPORT: {
    resourceName: "Container Report",
    _class: "Assessment",
    _type: "tenable_container_report",
  },
  CONTAINER_FINDING: {
    resourceName: "Container Finding",
    _class: "Finding",
    _type: "tenable_container_finding",
  },
  CONTAINER_MALWARE: {
    resourceName: "Container Malware",
    _class: "Finding",
    _type: "tenable_container_malware",
  },
  CONTAINER_UNWANTED_PROGRAM: {
    resourceName: "Container Unwanted Program",
    _class: "Finding",
    _type: "tenable_container_unwanted_program",
  },
  VULN_FINDING: {
    resourceName: "Vulnerability Finding",
    _class: "Finding",
    _type: "tenable_vulnerability_finding",
  },
  SCAN: {
    resourceName: "Scan",
    _class: ["Assessment", "Service"],
    _type: "tenable_scan",
  },
  USER: {
    resourceName: "User",
    _class: "User",
    _type: "tenable_user",
  },
};

export const CONTAINER_REPORT_UNWANTED_PROGRAM_RELATIONSHIP_TYPE =
  "tenable_container_report_identified_unwanted_program";
export const CONTAINER_REPORT_UNWANTED_PROGRAM_RELATIONSHIP_CLASS =
  "IDENTIFIED";

export const VULNERABILITY_FINDING_RELATIONSHIP_TYPE =
  "tenable_vulnerability_finding_is_vulnerability";
export const VULNERABILITY_FINDING_RELATIONSHIP_CLASS = "IS";

export const SCAN_FINDING_RELATIONSHIP_TYPE = "tenable_scan_identified_finding";
export const SCAN_FINDING_RELATIONSHIP_CLASS = "IDENTIFIED";

export type ContainerReportUnwantedProgramRelationship = RelationshipFromIntegration;

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
