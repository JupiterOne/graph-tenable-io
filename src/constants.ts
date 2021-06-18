import { RelationshipClass } from "@jupiterone/integration-sdk-core";

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
  VULNERABILITY: {
    resourceName: "Vulnerability",
    _class: "Vulnerability",
    _type: "tenable_vulnerability",
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

export const relationships = {
  ACCOUNT_HAS_USER: {
    _type: "tenable_account_has_user",
    sourceType: entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: entities.USER._type,
  },
  USER_OWNS_SCAN: {
    _type: "tenable_user_owns_scan",
    sourceType: entities.USER._type,
    _class: RelationshipClass.OWNS,
    targetType: entities.SCAN._type,
  },
  ACCOUNT_HAS_CONTAINER: {
    _type: "tenable_account_has_container",
    sourceType: entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: entities.CONTAINER._type,
  },
  CONTAINER_HAS_REPORT: {
    _type: "tenable_container_has_container_report",
    sourceType: entities.CONTAINER._type,
    _class: RelationshipClass.HAS,
    targetType: entities.CONTAINER_REPORT._type,
  },
  REPORT_IDENTIFIED_FINDING: {
    _type: "tenable_container_report_identified_finding",
    sourceType: entities.CONTAINER_REPORT._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: entities.CONTAINER_FINDING._type,
  },
  REPORT_IDENTIFIED_MALWARE: {
    _type: "tenable_container_report_identified_malware",
    sourceType: entities.CONTAINER_REPORT._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: entities.CONTAINER_MALWARE._type,
  },
  CONTAINER_REPORT_IDENTIFIED_UNWANTED_PROGRAM: {
    _type: "tenable_container_report_identified_unwanted_program",
    sourceType: entities.CONTAINER_REPORT._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: entities.CONTAINER_UNWANTED_PROGRAM._type,
  },
  SCAN_IDENTIFIED_FINDING: {
    _type: "tenable_scan_identified_finding",
    sourceType: entities.SCAN._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: entities.VULN_FINDING._type,
  },
  SCAN_IDENTIFIED_VULNERABILITY: {
    _type: "tenable_scan_identified_vulnerability",
    sourceType: entities.SCAN._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: entities.VULNERABILITY._type,
  },
  FINDING_IS_VULNERABILITY: {
    _type: "tenable_vulnerability_finding_is_vulnerability",
    sourceType: entities.VULN_FINDING._type,
    _class: RelationshipClass.IS,
    targetType: "vulnerability",
  },
};

export interface FindingRelationship {
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
