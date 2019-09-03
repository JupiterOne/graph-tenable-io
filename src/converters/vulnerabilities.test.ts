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
  normalizeTenableSeverity,
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

describe("normalizeTenableSeverity", () => {
  test("Informational for 0", () => {
    expect(normalizeTenableSeverity(0)).toEqual([0, "Informational"]);
  });

  test("Low for > 0 < 4", () => {
    expect(normalizeTenableSeverity(0.1)).toEqual([1, "Low"]);
    expect(normalizeTenableSeverity(3.99)).toEqual([1, "Low"]);
  });

  test("Medium for >= 4 < 7", () => {
    expect(normalizeTenableSeverity(4)).toEqual([2, "Medium"]);
    expect(normalizeTenableSeverity(6.99)).toEqual([2, "Medium"]);
  });

  test("High for >= 7 < 10", () => {
    expect(normalizeTenableSeverity(7)).toEqual([3, "High"]);
    expect(normalizeTenableSeverity(9.99)).toEqual([3, "High"]);
  });

  test("Critical for 10", () => {
    expect(normalizeTenableSeverity(10)).toEqual([4, "Critical"]);
  });

  test("error for unknown severity", () => {
    expect(() => {
      normalizeTenableSeverity(11);
    }).toThrow(/unhandled severity/i);
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
          severity: 199,
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
      createVulnerabilityFindingRelationship(
        scanSummary,
        assetSummary,
        hostVulnerability,
      ),
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
          severity: 3,
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
      createScanFindingRelationship(
        scanSummary,
        assetSummary,
        hostVulnerability,
      ),
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
    const entity = createVulnerabilityFindingEntity({
      scan: scanSummary,
      asset: assetSummary,
      vulnerability: hostVulnerability,
      vulnerabilityDetails: vulnerabilityInfo,
    });

    expect(entity).toEqual({
      _key: "tenable_vulnerability_finding_1234_3_2",
      _type: "tenable_vulnerability_finding",
      _class: "Finding",
      scanId: 1234,
      scanUuid: "scan-uuid",
      assetUuid: "asset-uuid",
      hostId: 2,
      hostname: "vpn.corporate.com",
      displayName: "plugin-name",
      pluginName: "plugin-name",
      pluginFamily: "plugin-family",
      pluginId: 3,
      numericSeverity: 1,
      severity: "Low",
      tenableSeverity: 3,
      tenablePriority: 5.9,
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
      vulnerability: hostVulnerability,
      vulnerabilityDetails: { ...vulnerabilityInfo, vpr: undefined },
    });
    expect(entity).toMatchObject({
      tenablePriority: undefined,
    });
  });
});
