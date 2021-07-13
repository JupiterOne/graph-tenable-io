import { Relationship } from '@jupiterone/integration-sdk-core';
import { entities, relationships } from '../../constants';
import {
  AssetExport,
  AssetVulnerabilityRiskInfo,
  RecentScanSummary,
  ScanHostVulnerability,
  ScanVulnerabilitySummary,
  VulnerabilityExport,
  User,
} from '@jupiterone/tenable-client-nodejs';
import {
  generateEntityKey,
  generateRelationshipKey,
} from '../../utils/generateKey';
import getTime from '../../utils/getTime';
import getEpochTimeInMilliseconds from '../../utils/getEpochTimeInMilliseconds';

import {
  convertProperties,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';

export function createScanEntity(data: RecentScanSummary) {
  return {
    _key: scanEntityKey(data.id),
    _type: entities.SCAN._type,
    _class: entities.SCAN._class,
    _rawData: [{ name: 'default', rawData: data }],
    displayName: data.name,
    id: data.id.toString(),
    legacy: data.legacy,
    permissions: data.permissions,
    type: data.type,
    read: data.read,
    lastModificationDate: getEpochTimeInMilliseconds(
      data.last_modification_date,
    ), // todo use parseTimePropertyValue
    creationDate: getEpochTimeInMilliseconds(data.creation_date), // todo use parseTimePropertyValue
    status: data.status,
    uuid: data.uuid,
    shared: data.shared,
    userPermissions: data.user_permissions,
    owner: data.owner,
    scheduleUuid: data.schedule_uuid,
    timezone: data.timezone,
    rrules: data.rrules,
    starttime: data.starttime,
    enabled: data.enabled,
    control: data.control,
    name: data.name,
  };
}

function scanEntityKey(scanId: number): string {
  return generateEntityKey(entities.SCAN._type, scanId);
}

export function createUserScanRelationship(
  user: User,
  scan: RecentScanSummary,
): Relationship {
  const parentKey = generateEntityKey(entities.USER._type, user.id);
  const childKey = generateEntityKey(entities.SCAN._type, scan.id);
  const relationship: Relationship = {
    _class: relationships.USER_OWNS_SCAN._class,
    _type: relationships.USER_OWNS_SCAN._type,
    _fromEntityKey: parentKey,
    _key: `${parentKey}_owns_${childKey}`,
    _toEntityKey: childKey,
  };
  return relationship;
}

// TODO: Move these into integration SDK and push out to other scanner
// integrations
export enum FindingSeverityPriority {
  Informational = 'Informational',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
  Unknown = 'Unknown',
}

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
export function normalizeCVSS2Severity(cvss2Severity: number | string): {
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
) {
  return {
    _key: generateEntityKey(
      entities.VULNERABILITY._type,
      vulnerability.plugin_id,
    ),
    _type: entities.VULNERABILITY._type,
    _class: entities.VULNERABILITY._class,
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
) {
  const sourceEntityKey = generateEntityKey(entities.SCAN._type, scan.id);
  const targetEntity = createTenableVulnerabilityEntity(vulnerability);

  return {
    _key: generateRelationshipKey(
      sourceEntityKey,
      relationships.SCAN_IDENTIFIED_VULNERABILITY._class,
      targetEntity._key,
    ),
    _class: relationships.SCAN_IDENTIFIED_VULNERABILITY._class,
    _type: relationships.SCAN_IDENTIFIED_VULNERABILITY._type,
    _mapping: {
      relationshipDirection: RelationshipDirection.FORWARD,
      sourceEntityKey,
      targetFilterKeys: ['_key'],
      targetEntity: targetEntity as any,
    },
    displayName: 'IDENTIFIED',
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
}) {
  const sourceEntityKey = vulnerabilityFindingEntityKey(scan, vulnerability);
  const targetEntity = createTenableVulnerabilityEntity(vulnerability);

  return {
    _key: `${sourceEntityKey}_${targetEntity._key}`,
    _type: relationships.FINDING_IS_VULNERABILITY._type,
    _class: relationships.FINDING_IS_VULNERABILITY._class,
    _mapping: {
      relationshipDirection: RelationshipDirection.FORWARD,
      sourceEntityKey,
      targetFilterKeys: ['_key'],
      targetEntity: targetEntity as any,
    },
    assetUuid,
    displayName: 'IS',
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
}) {
  const findingKey = vulnerabilityFindingEntityKey(scan, vulnerability);
  const scanKey = scanEntityKey(scan.id);
  return {
    _key: `${scanKey}_${findingKey}`,
    _type: relationships.SCAN_IDENTIFIED_FINDING._type,
    _class: relationships.SCAN_IDENTIFIED_FINDING._class,
    _fromEntityKey: scanKey,
    _toEntityKey: findingKey,
    scanId: scan.id,
    scanUuid: scan.uuid,
    pluginId: vulnerability.plugin_id,
    assetUuid,
    displayName: 'IDENTIFIED',
  };
}

export function createVulnerabilityFindingEntity(data: {
  scan: RecentScanSummary;
  asset: AssetExport | undefined;
  assetUuid: string | undefined;
  vulnerability: ScanHostVulnerability;
  vulnerabilityExport?: VulnerabilityExport;
}) {
  const { scan, asset, assetUuid, vulnerability, vulnerabilityExport } = data;

  const details = {};

  if (vulnerabilityExport) {
    const numericPriority =
      vulnerabilityExport.plugin.vpr && vulnerabilityExport.plugin.vpr.score;
    const priority = numericPriority && getPriority(numericPriority);
    const cvss: AssetVulnerabilityRiskInfo = {
      risk_factor: vulnerabilityExport.plugin.risk_factor,
      cvss_vector: JSON.stringify(vulnerabilityExport.plugin.cvss_vector),
      cvss_base_score: vulnerabilityExport.plugin.cvss_base_score?.toString(),
      cvss_temporal_vector: vulnerabilityExport.plugin.cvss_temporal_vector,
      cvss_temporal_score: vulnerabilityExport.plugin.cvss_temporal_score,
      cvss3_vector: vulnerabilityExport.plugin.cvss3_vector,
      cvss3_base_score: vulnerabilityExport.plugin.cvss3_base_score,
      cvss3_temporal_vector: vulnerabilityExport.plugin.cvss3_temporal_vector,
      cvss3_temporal_score: vulnerabilityExport.plugin.cvss_temporal_score,
      stig_severity: vulnerabilityExport.plugin.stig_severity,
    };

    Object.assign(details, {
      ...convertProperties(cvss),
      description: vulnerabilityExport.plugin.description,
      synopsis: vulnerabilityExport.plugin.synopsis,
      solution: vulnerabilityExport.plugin.solution,
      reference: vulnerabilityExport.plugin.see_also,
      numericPriority,
      priority,
      firstSeenOn: getTime(vulnerabilityExport.first_found),
      lastSeenOn: getTime(vulnerabilityExport.last_found),
    });
  }

  return {
    ...details,
    _key: vulnerabilityFindingEntityKey(scan, vulnerability),
    _type: entities.VULN_FINDING._type,
    _class: entities.VULN_FINDING._class,
    _rawData: [{ name: 'default', rawData: data }],
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
      [asset.fqdns, asset.ipv4s, asset.ipv6s, asset.mac_addresses].reduce(
        (a, e) => [...a, ...e],
      ),
  };
}

function vulnerabilityFindingEntityKey(
  scan: RecentScanSummary,
  vulnerability: ScanHostVulnerability,
) {
  return generateEntityKey(
    entities.VULN_FINDING._type,
    `${scan.id}_${vulnerability.plugin_id}_${vulnerability.host_id}`,
  );
}
