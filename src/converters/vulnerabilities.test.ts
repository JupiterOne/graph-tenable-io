import { RelationshipDirection } from "@jupiterone/jupiter-managed-integration-sdk";

import {
  AssetSummary,
  AssetVulnerabilityInfo,
  RecentScanSummary,
  ScanHostVulnerability,
  ScanVulnerabilitySummary,
} from "../tenable/types";
import {
  createScanFindingRelationship,
  createScanVulnerabilityRelationship,
  createVulnerabilityFindingEntity,
  createVulnerabilityFindingRelationship,
  getPriority,
  getSeverity,
  normalizeCVSS2Severity,
} from "./vulnerabilities";

const scanSummary = {
  id: 1234,
  uuid: "scan-uuid",
} as RecentScanSummary;

const vulnerabilitySummary = {
  plugin_family: "plugin-family",
  plugin_name: "plugin-name",
  plugin_id: 112526,
  severity: 199,
  count: 291,
} as ScanVulnerabilitySummary;

const assetSummary = {
  id: "asset-uuid",
  fqdn: ["vpn.corporate.com"],
  ipv4: ["127.0.0.1"],
  ipv6: ["::1"],
  mac_address: ["00:0a:95:9d:68:16"],
} as AssetSummary;

const hostVulnerability = {
  count: 1,
  host_id: 2,
  hostname: "vpn.corporate.com",
  plugin_family: "plugin-family",
  plugin_id: 3,
  plugin_name: "plugin-name",
  severity: 3,
} as ScanHostVulnerability;

const vulnerabilityInfo = {
  discovery: {
    seen_first: "2019-03-08T17:15:52.000Z",
    seen_last: "2019-03-08T17:15:52.001Z",
  },
  vpr: {
    score: 5.9,
  },
} as AssetVulnerabilityInfo;

describe("getSeverity from numericSeverity", () => {
  test("Informational for 0", () => {
    expect(getSeverity(0)).toEqual("Informational");
  });

  test("Low for > 0 < 4", () => {
    expect(getSeverity(0.1)).toEqual("Low");
    expect(getSeverity(3.99)).toEqual("Low");
  });

  test("Medium for >= 4 < 7", () => {
    expect(getSeverity(4)).toEqual("Medium");
    expect(getSeverity(6.99)).toEqual("Medium");
  });

  test("High for >= 7 < 10", () => {
    expect(getSeverity(7)).toEqual("High");
    expect(getSeverity(9.99)).toEqual("High");
  });

  test("Critical for 10", () => {
    expect(getSeverity(10)).toEqual("Critical");
  });

  test("for unknown severity", () => {
    expect(getSeverity(11)).toEqual("Unknown");
  });
});

describe("getPriority from numericPriority", () => {
  test("Low for < 4", () => {
    expect(getPriority(1)).toEqual("Low");
  });

  test("Medium for >= 4 and < 7", () => {
    expect(getPriority(4)).toEqual("Medium");
  });

  test("High for >= 7 and < 9", () => {
    expect(getPriority(7)).toEqual("High");
  });

  test("Critical for >= 9 and < 10", () => {
    expect(getPriority(10)).toEqual("Critical");
  });

  test("for unknown priority", () => {
    expect(getPriority(11)).toEqual("Unknown");
  });
});

describe("normalizeCVSS2Severity", () => {
  test("Low for < 4", () => {
    expect(normalizeCVSS2Severity(0)).toEqual({
      numericSeverity: 0,
      severity: "Low",
    });
    expect(normalizeCVSS2Severity(0.1)).toEqual({
      numericSeverity: 0.1,
      severity: "Low",
    });
    expect(normalizeCVSS2Severity(3.99)).toEqual({
      numericSeverity: 3.99,
      severity: "Low",
    });
  });

  test("Medium for >= 4 < 7", () => {
    expect(normalizeCVSS2Severity(4)).toEqual({
      numericSeverity: 4,
      severity: "Medium",
    });
    expect(normalizeCVSS2Severity(6.99)).toEqual({
      numericSeverity: 6.99,
      severity: "Medium",
    });
  });

  test("High for >= 7 < 10", () => {
    expect(normalizeCVSS2Severity(7)).toEqual({
      numericSeverity: 7,
      severity: "High",
    });
    expect(normalizeCVSS2Severity(9.99)).toEqual({
      numericSeverity: 9.99,
      severity: "High",
    });
    expect(normalizeCVSS2Severity(10)).toEqual({
      numericSeverity: 10,
      severity: "High",
    });
  });

  test("error for unknown severity", () => {
    expect(normalizeCVSS2Severity(11)).toEqual({
      numericSeverity: 11,
      severity: undefined,
    });
  });
});

describe("createScanVulnerabilityRelationship", () => {
  test("converts all expected properties", () => {
    expect(
      createScanVulnerabilityRelationship(scanSummary, vulnerabilitySummary),
    ).toEqual({
      _key: "tenable_scan_1234_identified_tenable_vulnerability_112526",
      _class: "IDENTIFIED",
      _type: "tenable_scan_identified_vulnerability",
      _mapping: {
        relationshipDirection: RelationshipDirection.FORWARD,
        sourceEntityKey: "tenable_scan_1234",
        targetFilterKeys: ["_key"],
        targetEntity: {
          _key: "tenable_vulnerability_112526",
          _type: "tenable_vulnerability",
          _class: "Vulnerability",
          pluginId: 112526,
          pluginFamily: "plugin-family",
          pluginName: "plugin-name",
          numericSeverity: 199,
          severity: "Unknown",
          displayName: "plugin-name",
        },
      },
      displayName: "IDENTIFIED",
      scanId: 1234,
      scanUuid: "scan-uuid",
      count: 291,
    });
  });
});

describe("createVulnerabilityFindingRelationship", () => {
  test("converts all expected properties", () => {
    expect(
      createVulnerabilityFindingRelationship({
        scan: scanSummary,
        assetUuid: assetSummary.id,
        vulnerability: hostVulnerability,
      }),
    ).toEqual({
      _class: "IS",
      _key: "tenable_vulnerability_finding_1234_3_2_tenable_vulnerability_3",
      _type: "tenable_vulnerability_finding_is_vulnerability",
      _mapping: {
        relationshipDirection: "FORWARD",
        sourceEntityKey: "tenable_vulnerability_finding_1234_3_2",
        targetEntity: {
          _class: "Vulnerability",
          _key: "tenable_vulnerability_3",
          _type: "tenable_vulnerability",
          displayName: "plugin-name",
          pluginFamily: "plugin-family",
          pluginId: 3,
          pluginName: "plugin-name",
          numericSeverity: 3,
          severity: "Low",
        },
        targetFilterKeys: ["_key"],
      },
      assetUuid: "asset-uuid",
      displayName: "IS",
      pluginId: 3,
      scanId: 1234,
      scanUuid: "scan-uuid",
    });
  });
});

describe("createScanFindingRelationship", () => {
  test("converts all expected properties", () => {
    expect(
      createScanFindingRelationship({
        scan: scanSummary,
        assetUuid: assetSummary.id,
        vulnerability: hostVulnerability,
      }),
    ).toEqual({
      _class: "IDENTIFIED",
      _type: "tenable_scan_identified_finding",
      _key: "tenable_scan_1234_tenable_vulnerability_finding_1234_3_2",
      _fromEntityKey: "tenable_scan_1234",
      _toEntityKey: "tenable_vulnerability_finding_1234_3_2",
      assetUuid: "asset-uuid",
      displayName: "IDENTIFIED",
      pluginId: 3,
      scanId: 1234,
      scanUuid: "scan-uuid",
    });
  });
});

describe("createVulnerabilityFindingEntity", () => {
  test("converts all expected properties", () => {
    const data = {
      scan: scanSummary,
      asset: assetSummary,
      assetUuid: assetSummary.id,
      vulnerability: hostVulnerability,
      vulnerabilityDetails: vulnerabilityInfo,
    };
    const entity = createVulnerabilityFindingEntity(data);

    expect(entity).toEqual({
      _key: "tenable_vulnerability_finding_1234_3_2",
      _type: "tenable_vulnerability_finding",
      _class: "Finding",
      _rawData: [{ name: "default", rawData: data }],
      scanId: 1234,
      scanUuid: "scan-uuid",
      assetUuid: "asset-uuid",
      hostId: 2,
      hostname: "vpn.corporate.com",
      displayName: "plugin-name",
      pluginName: "plugin-name",
      pluginFamily: "plugin-family",
      pluginId: 3,
      numericSeverity: 3,
      severity: "Low",
      numericPriority: 5.9,
      priority: "Medium",
      firstSeenOn: 1552065352000,
      lastSeenOn: 1552065352001,
      open: true,

      // Something similar to
      // https://bitbucket.org/lifeomic/jupiter-docs/pull-requests/217#Lguides/entity-relationship-mappings.mdT311
      // may be necessary, see if placing all in targets will create
      // relationships
      targets: ["vpn.corporate.com", "127.0.0.1", "::1", "00:0a:95:9d:68:16"],
    });
  });

  test("handles no vulnerability vpr data", () => {
    const entity = createVulnerabilityFindingEntity({
      scan: scanSummary,
      asset: assetSummary,
      assetUuid: assetSummary.id,
      vulnerability: hostVulnerability,
      vulnerabilityDetails: { ...vulnerabilityInfo, vpr: undefined },
    });
    expect(entity).toMatchObject({
      numericPriority: undefined,
      priority: undefined,
    });
  });
});
