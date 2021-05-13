import { RelationshipDirection } from "@jupiterone/jupiter-managed-integration-sdk";

import {
  AssetExport,
  RecentScanSummary,
  ScanHostVulnerability,
  ScanVulnerabilitySummary,
  VulnerabilityExport,
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

const assetExport = {
  id: "asset-uuid",
  fqdns: ["vpn.corporate.com"],
  ipv4s: ["127.0.0.1"],
  ipv6s: ["::1"],
  mac_addresses: ["00:0a:95:9d:68:16"],
} as AssetExport;

const hostVulnerability = {
  count: 1,
  host_id: 2,
  hostname: "vpn.corporate.com",
  plugin_family: "plugin-family",
  plugin_id: 3,
  plugin_name: "plugin-name",
  severity: 3,
} as ScanHostVulnerability;

const vulnerabilityExport = {
  asset: {
    device_type: "general-purpose",
    hostname: "104.131.67.167",
    uuid: "48cabb0b-f0fe-4db8-9a96-4fec60e4d4f4",
    ipv4: "104.131.67.167",
    last_unauthenticated_results: "2021-05-12T22:26:48Z",
    operating_system: ["Linux Kernel 4.15 on Ubuntu 18.04 (bionic)"],
    network_id: "00000000-0000-0000-0000-000000000000",
    tracked: true,
  },
  output:
    "\nThe following known CA certificates were part of the certificate\nchain sent by the remote host, but contain hashes that are considered\nto be weak.\n\n|-Subject             : O=Digital Signature Trust Co./CN=DST Root CA X3\n|-Signature Algorithm : SHA-1 With RSA Encryption\n|-Valid From          : Sep 30 21:12:19 2000 GMT\n|-Valid To            : Sep 30 14:01:15 2021 GMT\n",
  plugin: {
    bid: [11849, 33065],
    cpe: ["cpe:/a:ietf:x.509_certificate", "cpe:/a:ietf:md5"],
    cve: ["CVE-2004-2761"],
    exploit_available: true,
    exploitability_ease: "Exploits are available",
    family: "General",
    family_id: 30,
    has_patch: false,
    id: 95631,
    name: "SSL Certificate Signed Using Weak Hashing Algorithm (Known CA)",
    modification_date: "2019-11-26T00:00:00Z",
    publication_date: "2016-12-08T00:00:00Z",
    type: "remote",
    version: "1.12",
    vuln_publication_date: "2004-08-18T00:00:00Z",
    xrefs: [
      { type: "CERT", id: "836068" },
      { type: "CWE", id: "310" },
    ],
    vpr: {
      score: 4.4,
      drivers: {
        age_of_vuln: { lower_bound: 731 },
        exploit_code_maturity: "PROOF_OF_CONCEPT",
        cvss_impact_score_predicted: false,
        cvss3_impact_score: 3.6,
        threat_intensity_last28: "VERY_LOW",
        threat_sources_last28: ["No recorded events"],
        product_coverage: "LOW",
      },
      updated: "2020-12-30T05:20:01Z",
    },
  },
  port: { port: 443, protocol: "TCP", service: "www" },
  scan: {
    completed_at: "2021-05-12T22:27:03.798Z",
    schedule_uuid:
      "template-cfdaeaa4-871d-cf00-62cc-b9f5488eb5dfe81ad4dd841d21cb",
    started_at: "2021-05-12T21:12:24.210Z",
    uuid: "92d56999-1a5a-4366-8742-6519013e8d72",
  },
  severity: "info",
  severity_id: 0,
  severity_default_id: 0,
  severity_modification_type: "NONE",
  first_found: "2021-05-12T22:27:03.798Z",
  last_found: "2021-05-12T22:27:03.798Z",
  state: "OPEN",
} as VulnerabilityExport;

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
        assetUuid: assetExport.id,
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
        assetUuid: assetExport.id,
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
      asset: assetExport,
      assetUuid: assetExport.id,
      vulnerability: hostVulnerability,
      vulnerabilityExport,
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
      numericPriority: 4.4,
      priority: "Medium",
      firstSeenOn: 1620858423798,
      lastSeenOn: 1620858423798,
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
      asset: assetExport,
      assetUuid: assetExport.id,
      vulnerability: hostVulnerability,
      vulnerabilityExport: {
        ...vulnerabilityExport,
        plugin: {
          ...vulnerabilityExport.plugin,
          vpr: undefined,
        },
      },
    });
    expect(entity).toMatchObject({
      numericPriority: undefined,
      priority: undefined,
    });
  });

  test("handles no vulnerability export", () => {
    const data = {
      scan: scanSummary,
      asset: assetExport,
      assetUuid: assetExport.id,
      vulnerability: hostVulnerability,
      vulnerabilityExport: undefined,
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
      open: true,
      targets: ["vpn.corporate.com", "127.0.0.1", "::1", "00:0a:95:9d:68:16"],
    });
  });
});
