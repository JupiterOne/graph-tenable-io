import {
  convertProperties,
  RelationshipDirection,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  SCAN_ENTITY_TYPE,
  SCAN_FINDING_RELATIONSHIP_CLASS,
  SCAN_FINDING_RELATIONSHIP_TYPE,
  SCAN_VULNERABILITY_RELATIONSHIP_CLASS,
  SCAN_VULNERABILITY_RELATIONSHIP_TYPE,
  ScanFindingRelationship,
  ScanVulnerabilityRelationship,
  TENABLE_VULNERABILITY_ENTITY_CLASS,
  TENABLE_VULNERABILITY_ENTITY_TYPE,
  TenableVulnerabilityEntity,
  VULNERABILITY_FINDING_ENTITY_CLASS,
  VULNERABILITY_FINDING_ENTITY_TYPE,
  VULNERABILITY_FINDING_RELATIONSHIP_CLASS,
  VULNERABILITY_FINDING_RELATIONSHIP_TYPE,
  VulnerabilityFindingEntity,
  VulnerabilityFindingRelationship,
} from "../jupiterone";
import {
  AssetSummary,
  AssetVulnerabilityInfo,
  RecentScanSummary,
  ScanHostVulnerability,
  ScanVulnerabilitySummary,
} from "../tenable/types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";
import getTime from "../utils/getTime";
import { scanEntityKey } from "./scans";
import { FindingSeverityPriority } from "./types";

/**
 * Converts Tenable Plugin Severity Ratings or "Risk Factor" to label. See
 * https://community.tenable.com/s/article/Active-Plugins-Severity-vs-CVSS-v2-and-v3-scores
 *
 * Throws an `IntegrationError` when the Tenable severity number is not
 * recognized.
 */
export function getSeverity(numericSeverity: number): FindingSeverityPriority {
  if (numericSeverity === 0) {
    return FindingSeverityPriority.Informational;
  } else if (numericSeverity < 4) {
    return FindingSeverityPriority.Low;
  } else if (numericSeverity < 7) {
    return FindingSeverityPriority.Medium;
  } else if (numericSeverity < 10) {
    return FindingSeverityPriority.High;
  } else if (numericSeverity === 10) {
    return FindingSeverityPriority.Critical;
  } else {
    return FindingSeverityPriority.Unknown;
  }
}

/**
 * Converts Tenable Priority Ratings to label. See
 * https://docs.tenable.com/tenablesc/5_9/Content/RiskMetrics.htm#VPR
 */
export function getPriority(numericPriority: number): FindingSeverityPriority {
  if (numericPriority < 4) {
    return FindingSeverityPriority.Low;
  } else if (numericPriority < 7) {
    return FindingSeverityPriority.Medium;
  } else if (numericPriority < 9) {
    return FindingSeverityPriority.High;
  } else if (numericPriority <= 10) {
    return FindingSeverityPriority.Critical;
  } else {
    return FindingSeverityPriority.Unknown;
  }
}

/**
 * Converts NVD CVSS2 severity values to J1 normalized numeric values. See
 * https://nvd.nist.gov/vuln-metrics/cvss.
 *
 * Throws an `IntegrationError` when the CVSS2 severity value is not recognized.
 */
export function normalizeCVSS2Severity(
  cvss2Severity: number | string,
): {
  numericSeverity: number;
  severity: FindingSeverityPriority | undefined;
} {
  const numericSeverity = Number(cvss2Severity);
  let severity;
  if (numericSeverity < 4) {
    severity = FindingSeverityPriority.Low;
  } else if (numericSeverity < 7) {
    severity = FindingSeverityPriority.Medium;
  } else if (numericSeverity <= 10) {
    severity = FindingSeverityPriority.High;
  }
  return { numericSeverity, severity };
}

function createTenableVulnerabilityEntity(
  vulnerability: ScanVulnerabilitySummary,
): TenableVulnerabilityEntity {
  return {
    _key: generateEntityKey(
      TENABLE_VULNERABILITY_ENTITY_TYPE,
      vulnerability.plugin_id,
    ),
    _type: TENABLE_VULNERABILITY_ENTITY_TYPE,
    _class: TENABLE_VULNERABILITY_ENTITY_CLASS,
    displayName: vulnerability.plugin_name,
    pluginId: vulnerability.plugin_id,
    pluginFamily: vulnerability.plugin_family,
    pluginName: vulnerability.plugin_name,
    numericSeverity: vulnerability.severity,
    severity: getSeverity(vulnerability.severity),
  };
}

export function createScanVulnerabilityRelationship(
  scan: RecentScanSummary,
  vulnerability: ScanVulnerabilitySummary,
): ScanVulnerabilityRelationship {
  const sourceEntityKey = generateEntityKey(SCAN_ENTITY_TYPE, scan.id);
  const targetEntity = createTenableVulnerabilityEntity(vulnerability);

  return {
    _key: generateRelationshipKey(
      sourceEntityKey,
      SCAN_VULNERABILITY_RELATIONSHIP_CLASS,
      targetEntity._key,
    ),
    _class: SCAN_VULNERABILITY_RELATIONSHIP_CLASS,
    _type: SCAN_VULNERABILITY_RELATIONSHIP_TYPE,
    _mapping: {
      relationshipDirection: RelationshipDirection.FORWARD,
      sourceEntityKey,
      targetFilterKeys: ["_key"],
      targetEntity: targetEntity as any,
    },
    displayName: "IDENTIFIED",
    scanId: scan.id,
    scanUuid: scan.uuid,
    count: vulnerability.count,
  };
}

/**
 * Create a relationship between a finding and the vulnerability that was found.
 *
 * The `vulnerability` is sufficient for building the relationship; the
 * `Finding` key is derived from the scan/host/asset information.
 */
export function createVulnerabilityFindingRelationship({
  scan,
  assetUuid,
  vulnerability,
}: {
  scan: RecentScanSummary;
  assetUuid: string | undefined;
  vulnerability: ScanHostVulnerability;
}): VulnerabilityFindingRelationship {
  const sourceEntityKey = vulnerabilityFindingEntityKey(scan, vulnerability);
  const targetEntity = createTenableVulnerabilityEntity(vulnerability);

  return {
    _key: `${sourceEntityKey}_${targetEntity._key}`,
    _type: VULNERABILITY_FINDING_RELATIONSHIP_TYPE,
    _class: VULNERABILITY_FINDING_RELATIONSHIP_CLASS,
    _mapping: {
      relationshipDirection: RelationshipDirection.FORWARD,
      sourceEntityKey,
      targetFilterKeys: ["_key"],
      targetEntity: targetEntity as any,
    },
    assetUuid,
    displayName: "IS",
    pluginId: vulnerability.plugin_id,
    scanId: scan.id,
    scanUuid: scan.uuid,
  };
}

/**
 * Create a relationship between a finding and the scan that found it.
 *
 * The `vulnerability` is sufficient for building the relationship; the
 * `Finding` key is derived from the scan/host/asset information.
 */
export function createScanFindingRelationship({
  scan,
  assetUuid,
  vulnerability,
}: {
  scan: RecentScanSummary;
  assetUuid: string | undefined;
  vulnerability: ScanHostVulnerability;
}): ScanFindingRelationship {
  const findingKey = vulnerabilityFindingEntityKey(scan, vulnerability);
  const scanKey = scanEntityKey(scan.id);
  return {
    _key: `${scanKey}_${findingKey}`,
    _type: SCAN_FINDING_RELATIONSHIP_TYPE,
    _class: SCAN_FINDING_RELATIONSHIP_CLASS,
    _fromEntityKey: scanKey,
    _toEntityKey: findingKey,
    scanId: scan.id,
    scanUuid: scan.uuid,
    pluginId: vulnerability.plugin_id,
    assetUuid,
    displayName: "IDENTIFIED",
  };
}

export function createVulnerabilityFindingEntity(data: {
  scan: RecentScanSummary;
  asset: AssetSummary | undefined;
  assetUuid: string | undefined;
  vulnerability: ScanHostVulnerability;
  vulnerabilityDetails?: AssetVulnerabilityInfo;
}): VulnerabilityFindingEntity {
  const { scan, asset, assetUuid, vulnerability, vulnerabilityDetails } = data;

  const details = {};

  if (vulnerabilityDetails) {
    const numericPriority =
      vulnerabilityDetails.vpr && vulnerabilityDetails.vpr.score;
    const priority = numericPriority && getPriority(numericPriority);
    const cvss = vulnerabilityDetails.risk_information;

    Object.assign(details, {
      ...convertProperties(cvss),
      description: vulnerabilityDetails.description,
      synopsis: vulnerabilityDetails.synopsis,
      solution: vulnerabilityDetails.solution,
      reference:
        vulnerabilityDetails.reference_information &&
        vulnerabilityDetails.reference_information.url,
      numericPriority,
      priority,
      firstSeenOn: getTime(vulnerabilityDetails.discovery.seen_first),
      lastSeenOn: getTime(vulnerabilityDetails.discovery.seen_last),
    });
  }

  return {
    ...details,
    _key: vulnerabilityFindingEntityKey(scan, vulnerability),
    _type: VULNERABILITY_FINDING_ENTITY_TYPE,
    _class: VULNERABILITY_FINDING_ENTITY_CLASS,
    _rawData: [{ name: "default", rawData: data }],
    scanId: scan.id,
    scanUuid: scan.uuid,
    assetUuid,
    hostId: vulnerability.host_id,
    hostname: vulnerability.hostname,
    displayName: vulnerability.plugin_name,
    pluginName: vulnerability.plugin_name,
    pluginFamily: vulnerability.plugin_family,
    pluginId: vulnerability.plugin_id,
    numericSeverity: vulnerability.severity,
    severity: getSeverity(vulnerability.severity),
    // Set open to true because we are only collecting findings from the latest assessment run
    open: true,
    targets:
      asset &&
      [asset.fqdn, asset.ipv4, asset.ipv6, asset.mac_address].reduce((a, e) => [
        ...a,
        ...e,
      ]),
  };
}

export function vulnerabilityFindingEntityKey(
  scan: RecentScanSummary,
  vulnerability: ScanHostVulnerability,
) {
  return generateEntityKey(
    VULNERABILITY_FINDING_ENTITY_TYPE,
    `${scan.id}_${vulnerability.plugin_id}_${vulnerability.host_id}`,
  );
}
