import { createScanAssetRelationships } from "./ScanAssetRelationshipConverter";

const scans: any[] = [
  {
    id: "TestId",
    scanDetail: {
      info: {
        owner: "denis.arkhireev@dualbootpartners.com",
        name: ".com",
        no_target: false,
        folder_id: 8,
        control: true,
        user_permissions: 128,
        schedule_uuid:
          "template-2a48d3bb-1cd9-28a1-7742-c26c40ac09f7591cd108d64699c9",
        edit_allowed: false,
        scanner_name: "US Cloud Scanner",
        policy: "Web App Scan",
        shared: null,
        object_id: 12,
        hostcount: 0,
        uuid: "32c22094-3343-4163-a3ac-3863926b96e9",
        status: "completed",
        scan_type: "webapp",
        targets: "https://dualbootpartners.com",
        alt_targets_used: false,
        "pci-can-upload": false,
        scan_start: 1555066123,
        timestamp: 1555068471,
        scan_end: 1555068471,
        haskb: false,
        hasaudittrail: true,
        scanner_start: null,
        scanner_end: null,
      },
      hosts: [
        {
          host_index: 0,
          critical: 0,
          high: 0,
          medium: 4,
          low: 9,
          info: 12,
          severity: 25,
          host_id: 1,
          hostname: "dualbootpartners.com",
        },
      ],
      webAppVulnerabilities: [
        {
          count: 1,
          plugin_family: "Web Applications",
          plugin_id: 112526,
          plugin_name: "Missing 'X-XSS-Protection' Header",
          severity: 1,
        },
        {
          count: 1,
          plugin_family: "Web Servers",
          plugin_id: 112530,
          plugin_name: "SSL/TLS Versions Supported",
          severity: 0,
        },
        {
          count: 1,
          plugin_family: "Web Servers",
          plugin_id: 115491,
          plugin_name: "SSL/TLS Cipher Suites Supported",
          severity: 0,
        },
        {
          count: 1,
          plugin_family: "General",
          plugin_id: 98138,
          plugin_name: "Screenshot",
          severity: 0,
        },
      ],
    },
  },
];

const assets: any[] = [
  {
    id: "df0f891f-f18b-4047-8fe1-6e15ca7798a8",
    has_agent: false,
    last_seen: "2019-04-15T12:16:15.622Z",
    sources: [
      {
        name: "WAS",
        first_seen: "2019-04-12T10:48:54.822Z",
        last_seen: "2019-04-12T10:48:54.822Z",
      },
      {
        name: "NESSUS_SCAN",
        first_seen: "2019-04-15T12:16:15.622Z",
        last_seen: "2019-04-15T12:16:15.622Z",
      },
    ],
    ipv4: ["185.203.72.17"],
    ipv6: [],
    fqdn: [
      "dualbootpartners.com",
      "dualbootpartnerscopy.com",
      "dualbootpartnerscopycopy.com",
    ],
    netbios_name: [],
    operating_system: [],
    agent_name: [],
    aws_ec2_name: [],
    mac_address: [],
  },
  {
    id: "5cf9ecff-6867-46df-bf8f-d819fc8ed0b0",
    has_agent: false,
    last_seen: "2019-04-15T12:16:15.622Z",
    sources: [
      {
        name: "WAS",
        first_seen: "2019-04-12T10:48:00.711Z",
        last_seen: "2019-04-12T10:48:00.711Z",
      },
      {
        name: "NESSUS_SCAN",
        first_seen: "2019-04-15T12:16:15.622Z",
        last_seen: "2019-04-15T12:16:15.622Z",
      },
    ],
    ipv4: ["18.221.79.150"],
    ipv6: [],
    fqdn: ["dualboot.ru"],
    netbios_name: [],
    operating_system: [
      "Linux Kernel 2.2",
      "Linux Kernel 2.4",
      "Linux Kernel 2.6",
    ],
    agent_name: [],
    aws_ec2_name: [],
    mac_address: [],
  },
];

const assetWithWrongFqdn: any[] = [
  {
    id: "5cf9ecff-6867-46df-bf8f-d819fc8ed0b0",
    has_agent: false,
    last_seen: "2019-04-15T12:16:15.622Z",
    sources: [
      {
        name: "WAS",
        first_seen: "2019-04-12T10:48:00.711Z",
        last_seen: "2019-04-12T10:48:00.711Z",
      },
      {
        name: "NESSUS_SCAN",
        first_seen: "2019-04-15T12:16:15.622Z",
        last_seen: "2019-04-15T12:16:15.622Z",
      },
    ],
    ipv4: ["18.221.79.150"],
    ipv6: [],
    fqdn: ["dualbootwrong.ru"],
    netbios_name: [],
    operating_system: [
      "Linux Kernel 2.2",
      "Linux Kernel 2.4",
      "Linux Kernel 2.6",
    ],
    agent_name: [],
    aws_ec2_name: [],
    mac_address: [],
  },
];

describe("convert assessment application relationships", () => {
  test("convert assessment application relationships with full data", () => {
    const relationships = createScanAssetRelationships(scans, assets);
    expect(relationships).toEqual([
      {
        _class: "HAS",
        _fromEntityKey: "tenable_scan_TestId",
        _key:
          "tenable_scan_TestId_has_tenable_asset_df0f891f-f18b-4047-8fe1-6e15ca7798a8",
        _toEntityKey: "tenable_asset_df0f891f-f18b-4047-8fe1-6e15ca7798a8",
        _type: "tenable_scan_has_tenable_asset",
      },
    ]);
  });

  test("convert assessment application relationships without scanDetail", () => {
    const relationships = createScanAssetRelationships(
      [{ id: "TestId" }] as any[],
      assets,
    );
    expect(relationships).toEqual([]);
  });

  test("convert assessment application relationships with wrong asset", () => {
    const relationships = createScanAssetRelationships(
      scans,
      assetWithWrongFqdn,
    );
    expect(relationships).toEqual([]);
  });
});
