import { createScanEntities } from "./ScanEntityConverter";

test("convert assessment entities", () => {
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
          timestamp: 1555068471,
          haskb: false,
          hasaudittrail: true,
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
        scanVulnerabilities: [
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

  const entities = createScanEntities(scans);

  expect(entities).toEqual([
    {
      _class: ["Assessment", "Service"],
      _key: "tenable_scan_TestId",
      _type: "tenable_scan",
      id: "TestId",
    },
  ]);
});
