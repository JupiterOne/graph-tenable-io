import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

import { FindingSeverityPriority } from "../../converters";

export const VULNERABILITY_FINDING_ENTITY_TYPE =
  "tenable_vulnerability_finding";
export const VULNERABILITY_FINDING_ENTITY_CLASS = "Finding";

export const CONTAINER_FINDING_ENTITY_TYPE = "tenable_container_finding";
export const CONTAINER_FINDING_ENTITY_CLASS = "Finding";

export interface VulnerabilityFindingEntity extends EntityFromIntegration {
  scanId: number;
  scanUuid: string;

  /**
   * The UUID of the host/asset when provided in the `ScanHost` or discovered in
   * the assets listing using the hostname.
   *
   * Scans produce findings where the host has no UUID, or the UUID or hostname
   * of the host does not match an `AssetSummary` loaded by the
   * `TenableAssetCache`. In these cases, the `assetUuid` will be `undefined`;
   */
  assetUuid?: string;

  hostId: number;
  hostname: string;

  pluginFamily: string;
  pluginId: number;
  pluginName: string;

  numericSeverity: number;
  severity: FindingSeverityPriority;
  numericPriority?: number;
  priority?: string;

  open: boolean;
  targets: string[] | undefined;

  firstSeenOn?: number;
  lastSeenOn?: number;
}

export interface ContainerFindingEntity extends EntityFromIntegration {
  referenceId?: string;
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
  numericSeverity: number;
  severity: FindingSeverityPriority | undefined;
}
