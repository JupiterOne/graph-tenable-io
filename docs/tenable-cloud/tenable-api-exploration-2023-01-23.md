# Tenable API Exploration

This document is an exploration and catalogue of Tenable's APIs as of
2023-01-23. It's main purpose is to help evaluate graph-tenable-io's use of the
APIs.

# Export APIs

## Export Vulnerabilities

### Endpoint: [GET Vulnerability Chunk](https://developer.tenable.com/reference/exports-vulns-download-chunk)

#### Example Response:

```json
{
  "asset": {
    "fqdn": "example.com",
    "hostname": "192.0.2.225",
    "uuid": "cf165808-6a31-48e1-9cf3-c6c3174df51d",
    "ipv4": "192.0.2.8",
    "operating_system": ["Apple Mac OS X 10.5.8"],
    "network_id": "00000000-0000-0000-0000-000000000000",
    "tracked": true
  },
  "output": "The observed version of Google Chrome is : \n Chrome/21.0.1180.90",
  "plugin": {
    "cve": [
      "CVE-2016-1620",
      "CVE-2016-1614",
      "CVE-2016-1613",
      "CVE-2016-1612",
      "CVE-2016-1618",
      "CVE-2016-1617",
      "CVE-2016-1616",
      "CVE-2016-1615",
      "CVE-2016-1619"
    ],
    "cvss_base_score": 9.3,
    "cvss_temporal_score": 6.9,
    "cvss_temporal_vector": {
      "exploitability": "Unproven",
      "remediation_level": "Official-fix",
      "report_confidence": "Confirmed",
      "raw": "E:U/RL:OF/RC:C"
    },
    "cvss_vector": {
      "access_complexity": "Medium",
      "access_vector": "Network",
      "authentication": "None required",
      "confidentiality_impact": "Complete",
      "integrity_impact": "Complete",
      "availability_impact": "Complete",
      "raw": "AV:N/AC:M/Au:N/C:C/I:C/A:C"
    },
    "description": "The version of Google Chrome on the remote host is prior to 48.0.2564.82 and is affected by the following vulnerabilities: \n\n - An unspecified vulnerability exists in Google V8 when handling compatible receiver checks hidden behind receptors.  An attacker can exploit this to have an unspecified impact.  No other details are available. (CVE-2016-1612)\n - A use-after-free error exists in `PDFium` due to improper invalidation of `IPWL_FocusHandler` and `IPWL_Provider` upon destruction.  An attacker can exploit this to dereference already freed memory, resulting in the execution of arbitrary code. (CVE-2016-1613)\n - An unspecified vulnerability exists in `Blink` that is related to the handling of bitmaps.  An attacker can exploit this to access sensitive information.  No other details are available. (CVE-2016-1614)\n - An unspecified vulnerability exists in `omnibox` that is related to origin confusion.  An attacker can exploit this to have an unspecified impact.  No other details are available. (CVE-2016-1615)\n - An unspecified vulnerability exists that allows an attacker to spoof a displayed URL.  No other details are available. (CVE-2016-1616)\n - An unspecified vulnerability exists that is related to history sniffing with HSTS and CSP. No other details are available. (CVE-2016-1617)\n - A flaw exists in `Blink` due to the weak generation of random numbers by the ARC4-based random number generator.  An attacker can exploit this to gain access to sensitive information.  No other details are available. (CVE-2016-1618)\n - An out-of-bounds read error exists in `PDFium` in file `fx_codec_jpx_opj.cpp` in the `sycc4{22,44}_to_rgb()` functions. An attacker can exploit this to cause a denial of service by crashing the application linked using the library. (CVE-2016-1619)\n - Multiple vulnerabilities exist, the most serious of which allow an attacker to execute arbitrary code via a crafted web page. (CVE-2016-1620)\n - A flaw in `objects.cc` is triggered when handling cleared `WeakCells`, which may allow a context-dependent attacker to have an unspecified impact. No further details have been provided. (CVE-2016-2051)",
    "family": "Web Clients",
    "family_id": 1000020,
    "has_patch": false,
    "id": 9062,
    "name": "Google Chrome &lt; 48.0.2564.82 Multiple Vulnerabilities",
    "risk_factor": "HIGH",
    "see_also": [
      "http://googlechromereleases.blogspot.com/2016/01/beta-channel-update_20.html"
    ],
    "solution": "Update the Chrome browser to 48.0.2564.82 or later.",
    "synopsis": "The remote host is utilizing a web browser that is affected by multiple vulnerabilities.",
    "vpr": {
      "score": 5.9,
      "drivers": {
        "age_of_vuln": {
          "lower_bound": 366,
          "upper_bound": 730
        },
        "exploit_code_maturity": "UNPROVEN",
        "cvss_impact_score_predicted": false,
        "cvss3_impact_score": 5.9,
        "threat_intensity_last28": "VERY_LOW",
        "threat_sources_last28": ["No recorded events"],
        "product_coverage": "LOW"
      },
      "updated": "2019-12-31T10:08:58Z"
    }
  },
  "port": {
    "port": 0,
    "protocol": "TCP"
  },
  "scan": {
    "completed_at": "2018-12-31T20:59:47Z",
    "schedule_uuid": "6f7db010-9cb6-4870-b745-70a2aea2f81ce1b6640fe8a2217b",
    "started_at": "2018-12-31T20:59:47Z",
    "uuid": "0e55ec5d-c7c7-4673-a618-438a84e9d1b78af3a9957a077904"
  },
  "severity": "high",
  "severity_id": 3,
  "severity_default_id": 3,
  "severity_modification_type": "NONE",
  "first_found": "2018-12-31T20:59:47Z",
  "last_found": "2018-12-31T20:59:47Z",
  "indexed_at": "1590006395",
  "state": "OPEN"
}
```

#### J1 Data

- Current Day Type: `tenable_vulnerability_finding`
- Current Day Class: `Finding`
- Notes: There is a new version 3 export API that may be worth exploring. They
  insist it's not ready for production, but maybe it would open up new, better,
  or faster data.

#### Unique Paths In Raw Data To Create Properties From

```json
[
  [
    "asset.agent_uuid",
    "asset.device_type",
    "asset.fqdn",
    "asset.hostname",
    "asset.uuid",
    "asset.ipv4",
    "asset.last_authenticated_results",
    "asset.mac_address",
    "asset.operating_system.0",
    "asset.network_id",
    "asset.tracked",
    "plugin.checks_for_default_account",
    "plugin.checks_for_malware",
    "plugin.cpe.0",
    "plugin.cvss3_base_score",
    "plugin.cvss3_temporal_score",
    "plugin.cvss_base_score",
    "plugin.cvss_temporal_score",
    "plugin.description",
    "plugin.exploit_available",
    "plugin.exploit_framework_canvas",
    "plugin.exploit_framework_core",
    "plugin.exploit_framework_d2_elliot",
    "plugin.exploit_framework_exploithub",
    "plugin.exploit_framework_metasploit",
    "plugin.exploited_by_malware",
    "plugin.exploited_by_nessus",
    "plugin.family",
    "plugin.family_id",
    "plugin.has_patch",
    "plugin.id",
    "plugin.in_the_news",
    "plugin.name",
    "plugin.modification_date",
    "plugin.publication_date",
    "plugin.risk_factor",
    "plugin.see_also.0",
    "plugin.solution",
    "plugin.synopsis",
    "plugin.type",
    "plugin.unsupported_by_vendor",
    "plugin.version",
    "plugin.xrefs.0.type",
    "plugin.xrefs.0.id",
    "plugin.xrefs.1.type",
    "plugin.xrefs.1.id",
    "port.port",
    "port.protocol",
    "scan.completed_at",
    "scan.schedule_uuid",
    "scan.started_at",
    "scan.uuid",
    "severity",
    "severity_id",
    "severity_default_id",
    "severity_modification_type",
    "first_found",
    "last_fixed",
    "last_found",
    "state",
    "indexed",
    "output",
    "plugin.see_also.1",
    "plugin.cpe.1",
    "plugin.cve.0",
    "plugin.cvss3_temporal_vector.remediation_level",
    "plugin.cvss3_temporal_vector.report_confidence",
    "plugin.cvss3_temporal_vector.raw",
    "plugin.cvss3_vector.availability_impact",
    "plugin.cvss3_vector.confidentiality_impact",
    "plugin.cvss3_vector.integrity_impact",
    "plugin.cvss3_vector.raw",
    "plugin.cvss_temporal_vector.exploitability",
    "plugin.cvss_temporal_vector.remediation_level",
    "plugin.cvss_temporal_vector.report_confidence",
    "plugin.cvss_temporal_vector.raw",
    "plugin.cvss_vector.access_complexity",
    "plugin.cvss_vector.access_vector",
    "plugin.cvss_vector.authentication",
    "plugin.cvss_vector.availability_impact",
    "plugin.cvss_vector.confidentiality_impact",
    "plugin.cvss_vector.integrity_impact",
    "plugin.cvss_vector.raw",
    "plugin.exploitability_ease",
    "plugin.patch_publication_date",
    "plugin.stig_severity",
    "plugin.vuln_publication_date",
    "plugin.vpr.score",
    "plugin.vpr.drivers.age_of_vuln.lower_bound",
    "plugin.vpr.drivers.age_of_vuln.upper_bound",
    "plugin.vpr.drivers.exploit_code_maturity",
    "plugin.vpr.drivers.cvss_impact_score_predicted",
    "plugin.vpr.drivers.cvss3_impact_score",
    "plugin.vpr.drivers.threat_intensity_last28",
    "plugin.vpr.drivers.threat_recency.lower_bound",
    "plugin.vpr.drivers.threat_recency.upper_bound",
    "plugin.vpr.drivers.threat_sources_last28.0",
    "plugin.vpr.drivers.product_coverage",
    "plugin.vpr.updated",
    "plugin.cve.1",
    "plugin.cve.2",
    "plugin.cve.3",
    "plugin.cve.4",
    "plugin.cve.5",
    "plugin.cve.6",
    "plugin.cve.7",
    "plugin.cve.8",
    "plugin.cve.9",
    "plugin.cve.10",
    "plugin.cve.11",
    "plugin.cve.12",
    "plugin.cve.13",
    "plugin.vpr.drivers.threat_sources_last28.1",
    "plugin.xrefs.2.type",
    "plugin.xrefs.2.id"
  ]
]
```

## Export Assets

### Endpoint: [GET Asset Chunk](https://developer.tenable.com/reference/exports-assets-download-chunk)

#### Example Response:

```json
[
  {
    "id": "95c2725c-7298-4a44-8a1d-63131ca3f01f",
    "has_agent": false,
    "has_plugin_results": true,
    "created_at": "2017-12-31T20:40:44.535Z",
    "terminated_at": null,
    "terminated_by": null,
    "updated_at": "2018-12-31T22:27:58.599Z",
    "deleted_at": null,
    "deleted_by": null,
    "first_seen": "2017-12-31T20:40:23.447Z",
    "last_seen": "2018-12-31T22:27:52.869Z",
    "first_scan_time": "2017-12-31T20:40:23.447Z",
    "last_scan_time": "2018-02-31T22:27:52.869Z",
    "last_authenticated_scan_date": null,
    "last_licensed_scan_date": "2018-12-31T22:27:52.869Z",
    "last_scan_id": "00283024-afee-44ea-b467-db5a6ed9fd50ab8f7ecb158c480e",
    "last_schedule_id": "72284901-7c68-42b2-a0c4-c1e75568849df60557ee0e264228",
    "azure_vm_id": null,
    "azure_resource_id": null,
    "gcp_project_id": null,
    "gcp_zone": null,
    "gcp_instance_id": null,
    "aws_ec2_instance_ami_id": null,
    "aws_ec2_instance_id": null,
    "agent_uuid": null,
    "bios_uuid": null,
    "aws_owner_id": null,
    "aws_availability_zone": null,
    "aws_region": null,
    "aws_vpc_id": null,
    "aws_ec2_instance_group_name": null,
    "aws_ec2_instance_state_name": null,
    "aws_ec2_instance_type": null,
    "aws_subnet_id": null,
    "aws_ec2_product_code": null,
    "aws_ec2_name": null,
    "mcafee_epo_guid": null,
    "mcafee_epo_agent_guid": null,
    "servicenow_sysid": null,
    "bigfix_asset_id": null,
    "agent_names": [],
    "installed_software": [
      "cpe:/a:apple:itunes:12.8",
      "cpe:/a:apple:quicktime:7.7.3",
      "cpe:/a:openbsd:openssh:6.9",
      "cpe:/a:google:chrome"
    ],
    "ipv4s": ["192.0.2.57"],
    "ipv6s": [],
    "fqdns": ["192.0.2.57.lightspeed.hstntx.sbcglobal.net"],
    "mac_addresses": [],
    "netbios_names": [],
    "operating_systems": [],
    "system_types": [],
    "hostnames": [],
    "ssh_fingerprints": [],
    "qualys_asset_ids": [],
    "qualys_host_ids": [],
    "manufacturer_tpm_ids": [],
    "symantec_ep_hardware_keys": [],
    "sources": [
      {
        "name": "NESSUS_SCAN",
        "first_seen": "2017-12-31T20:40:23.447Z",
        "last_seen": "2018-12-31T22:27:52.869Z"
      }
    ],
    "tags": [
      {
        "uuid": "47e7f5f6-1013-4401-a705-479bfadc7826",
        "key": "Geographic Area",
        "value": "APAC",
        "added_by": "ac2e7ef6-fac9-47bf-9170-617331322885",
        "added_at": "2018-12-31T14:53:13.817Z"
      }
    ],
    "network_interfaces": [
      {
        "name": "enccw0.0.1234",
        "mac_address": ["00:00:5E:00:53:00", "00:00:5E:00:53:FF"],
        "ipv4": ["192.0.2.57", "192.0.2.177"],
        "ipv6": ["2001:DB8:1234:1234/32"],
        "fqdn": ["example.com"]
      }
    ],
    "acr_score": "3",
    "exposure_score": "721"
  }
]
```

#### J1 Data

- Current Day Type: `tenable_asset`
- Current Day Class: `Record`
- Notes:

#### Unique Paths In Raw Data

```json
[
  [
    "id",
    "has_agent",
    "has_plugin_results",
    "created_at",
    "terminated_at",
    "terminated_by",
    "updated_at",
    "deleted_at",
    "deleted_by",
    "first_seen",
    "last_seen",
    "first_scan_time",
    "last_scan_time",
    "last_authenticated_scan_date",
    "last_licensed_scan_date",
    "last_scan_id",
    "last_schedule_id",
    "azure_vm_id",
    "azure_resource_id",
    "gcp_project_id",
    "gcp_zone",
    "gcp_instance_id",
    "aws_ec2_instance_ami_id",
    "aws_ec2_instance_id",
    "agent_uuid",
    "bios_uuid",
    "network_id",
    "network_name",
    "aws_owner_id",
    "aws_availability_zone",
    "aws_region",
    "aws_vpc_id",
    "aws_ec2_instance_group_name",
    "aws_ec2_instance_state_name",
    "aws_ec2_instance_type",
    "aws_subnet_id",
    "aws_ec2_product_code",
    "aws_ec2_name",
    "mcafee_epo_guid",
    "mcafee_epo_agent_guid",
    "servicenow_sysid",
    "bigfix_asset_id",
    "",
    "installed_software.0",
    "installed_software.1",
    "installed_software.2",
    "ipv4s.0",
    "operating_systems.0",
    "system_types.0",
    "sources.0.name",
    "sources.0.first_seen",
    "sources.0.last_seen",
    "network_interfaces.0.name",
    "network_interfaces.0.virtual",
    "network_interfaces.0.aliased",
    "network_interfaces.0.ipv4s.0",
    "agent_names.0",
    "installed_software.3",
    "installed_software.4",
    "installed_software.5",
    "installed_software.6",
    "installed_software.7",
    "installed_software.8",
    "installed_software.9",
    "installed_software.10",
    "installed_software.11",
    "installed_software.12",
    "installed_software.13",
    "installed_software.14",
    "installed_software.15",
    "installed_software.16",
    "installed_software.17",
    "installed_software.18",
    "installed_software.19",
    "installed_software.20",
    "installed_software.21",
    "installed_software.22",
    "installed_software.23",
    "installed_software.24",
    "installed_software.25",
    "installed_software.26",
    "installed_software.27",
    "installed_software.28",
    "installed_software.29",
    "installed_software.30",
    "installed_software.31",
    "installed_software.32",
    "installed_software.33",
    "installed_software.34",
    "installed_software.35",
    "installed_software.36",
    "installed_software.37",
    "installed_software.38",
    "installed_software.39",
    "installed_software.40",
    "installed_software.41",
    "installed_software.42",
    "installed_software.43",
    "installed_software.44",
    "installed_software.45",
    "installed_software.46",
    "installed_software.47",
    "installed_software.48",
    "installed_software.49",
    "ipv4s.1",
    "ipv6s.0",
    "ipv6s.1",
    "ipv6s.2",
    "ipv6s.3",
    "ipv6s.4",
    "ipv6s.5",
    "ipv6s.6",
    "ipv6s.7",
    "ipv6s.8",
    "fqdns.0",
    "mac_addresses.0",
    "mac_addresses.1",
    "mac_addresses.2",
    "mac_addresses.3",
    "mac_addresses.4",
    "mac_addresses.5",
    "mac_addresses.6",
    "mac_addresses.7",
    "mac_addresses.8",
    "mac_addresses.9",
    "mac_addresses.10",
    "mac_addresses.11",
    "hostnames.0",
    "tags.0.uuid",
    "tags.0.key",
    "tags.0.value",
    "tags.0.added_by",
    "tags.0.added_at",
    "tags.1.uuid",
    "tags.1.key",
    "tags.1.value",
    "tags.1.added_by",
    "tags.1.added_at",
    "network_interfaces.0.mac_addresses.0",
    "network_interfaces.1.name",
    "network_interfaces.1.virtual",
    "network_interfaces.1.aliased",
    "network_interfaces.1.ipv4s.0",
    "network_interfaces.2.name",
    "network_interfaces.2.virtual",
    "network_interfaces.2.aliased",
    "network_interfaces.2.fqdns.0",
    "network_interfaces.2.mac_addresses.0",
    "network_interfaces.2.mac_addresses.1",
    "network_interfaces.2.mac_addresses.2",
    "network_interfaces.2.mac_addresses.3",
    "network_interfaces.2.mac_addresses.4",
    "network_interfaces.2.mac_addresses.5",
    "network_interfaces.2.mac_addresses.6",
    "network_interfaces.2.mac_addresses.7",
    "network_interfaces.2.mac_addresses.8",
    "network_interfaces.2.mac_addresses.9",
    "network_interfaces.2.mac_addresses.10",
    "network_interfaces.2.mac_addresses.11",
    "network_interfaces.2.ipv4s.0",
    "network_interfaces.2.ipv4s.1",
    "network_interfaces.2.ipv6s.0",
    "network_interfaces.2.ipv6s.1",
    "network_interfaces.2.ipv6s.2",
    "network_interfaces.2.ipv6s.3",
    "network_interfaces.2.ipv6s.4",
    "network_interfaces.2.ipv6s.5",
    "network_interfaces.2.ipv6s.6",
    "network_interfaces.2.ipv6s.7",
    "network_interfaces.2.ipv6s.8",
    "sources.1.name",
    "sources.1.first_seen",
    "sources.1.last_seen",
    "network_interfaces.0.ipv4s.1",
    "network_interfaces.1.mac_addresses.0",
    "network_interfaces.1.ipv4s.1",
    "ipv4s.2",
    "network_interfaces.1.ipv6s.0",
    "network_interfaces.3.name",
    "network_interfaces.3.virtual",
    "network_interfaces.3.aliased",
    "network_interfaces.3.mac_addresses.0",
    "network_interfaces.3.ipv4s.0",
    "network_interfaces.3.ipv6s.0",
    "network_interfaces.4.name",
    "network_interfaces.4.virtual",
    "network_interfaces.4.aliased",
    "network_interfaces.4.mac_addresses.0",
    "network_interfaces.4.mac_addresses.1",
    "network_interfaces.4.ipv4s.0",
    "network_interfaces.4.ipv4s.1",
    "network_interfaces.4.ipv4s.2",
    "network_interfaces.4.ipv6s.0",
    "network_interfaces.4.ipv6s.1"
  ]
]
```

## Export Compliance

### Endpoint: [GET Compliance Chunk](https://developer.tenable.com/reference/io-exports-compliance-download)

#### Example Response:

```json
[
  {
    "asset_uuid": "e5e6fa1b-243f-45b7-82cb-285c271cbaa6",
    "first_seen": "2021-01-16T00:18:49Z",
    "last_seen": "2021-01-28T17:27:07Z",
    "audit_file": "CIS_CentOS_8_Server_L1_v1.0.0.audit",
    "check_id": "00a3efcb8730ae2af470fdfc4eac23dfb1880539ad6a861e6ebc94df6b6f3dbf",
    "check_name": "5.5.4 Ensure default group for the root account is GID 0",
    "check_info": "The usermod command can be used to specify which group the root user belongs to. This affects permissions of files that are created by the root user.  Using GID 0 for the root account helps prevent root -owned files from accidentally becoming accessible to non-privileged users.",
    "expected_value": "expect: ^root:x:0:0:\nfile: /etc/passwd\nregex: ^root:\nsystem: Linux",
    "actual_value": "Compliant file(s):\n      /etc/passwd - regex '^root:' found - expect '^root:x:0:0:' found in the following lines:\n          1: root:x:0:0:root:/root:/bin/bash",
    "status": "PASSED",
    "reference": [
      {
        "framework": "800-171",
        "control": "3.1.1"
      },
      {
        "framework": "800-53",
        "control": "AC-2"
      },
      {
        "framework": "CN-L3",
        "control": "7.1.3.2(d)"
      },
      {
        "framework": "CSCv7",
        "control": "5.1"
      },
      {
        "framework": "CSF",
        "control": "DE.CM-1"
      },
      {
        "framework": "CSF",
        "control": "DE.CM-3"
      },
      {
        "framework": "CSF",
        "control": "PR.AC-1"
      },
      {
        "framework": "CSF",
        "control": "PR.AC-4"
      },
      {
        "framework": "ISO/IEC-27001",
        "control": "A.9.2.1"
      },
      {
        "framework": "ITSG-33",
        "control": "AC-2"
      },
      {
        "framework": "LEVEL",
        "control": "1S"
      },
      {
        "framework": "NESA",
        "control": "T5.2.1"
      },
      {
        "framework": "NESA",
        "control": "T5.2.2"
      },
      {
        "framework": "NIAv2",
        "control": "AM28"
      },
      {
        "framework": "NIAv2",
        "control": "NS5j"
      },
      {
        "framework": "NIAv2",
        "control": "SS14e"
      },
      {
        "framework": "QCSC-v1",
        "control": "13.2"
      },
      {
        "framework": "QCSC-v1",
        "control": "15.2"
      },
      {
        "framework": "QCSC-v1",
        "control": "5.2.2"
      },
      {
        "framework": "QCSC-v1",
        "control": "8.2.1"
      }
    ],
    "see_also": "https://workbench.cisecurity.org/files/2518",
    "solution": "Run the following command to set the root user default group to GID 0 : # usermod -g 0 root",
    "plugin_id": 21157
  },
  {
    "asset_uuid": "e5e6fa1b-243f-45b7-82cb-285c271cbaa6",
    "first_seen": "2021-01-16T00:18:49Z",
    "last_seen": "2021-01-28T17:27:03Z",
    "audit_file": "CIS_CentOS_8_Server_L1_v1.0.0.audit",
    "check_id": "015aab79fea967958c41a87283234540c44463142dda87499cc1784b5d619bea",
    "check_name": "3.2.1 Ensure source routed packets are not accepted - sysctl net.ipv6.conf.all.accept_source_route",
    "check_info": "In networking, source routing allows a sender to partially or fully specify the route packets take through a network. In contrast, non-source routed packets travel a path determined by routers in the network. In some cases, systems may not be routable or reachable from some locations (e.g. private addresses vs. Internet routable), and so source routed packets would need to be used.  Setting net.ipv4.conf.all.accept_source_route, net.ipv4.conf.default.accept_source_route, net.ipv6.conf.all.accept_source_route and net.ipv6.conf.default.accept_source_route to 0 disables the system from accepting source routed packets. Assume this system was capable of routing packets to Internet routable addresses on one interface and private addresses on another interface. Assume that the private addresses were not routable to the Internet routable addresses and vice versa. Under normal routing circumstances, an attacker from the Internet routable addresses could not use the system as a way to reach the private address systems. If, however, source routed packets were allowed, they could be used to gain access to the private address systems as the route could be specified, rather than rely on routing protocols that did not allow this routing.",
    "expected_value": "cmd: /usr/sbin/sysctl net.ipv6.conf.default.accept_source_route\nexpect: ^[\\s]*net\\.ipv6\\.conf\\.default\\.accept_source_route[\\s]*=[\\s]*0[\\s]*$\nsystem: Linux",
    "actual_value": "The command '/usr/sbin/sysctl net.ipv6.conf.default.accept_source_route' returned : \n\nnet.ipv6.conf.default.accept_source_route = 0",
    "status": "PASSED",
    "reference": [
      {
        "framework": "800-171",
        "control": "3.13.1"
      },
      {
        "framework": "800-53",
        "control": "SC-7(12)"
      },
      {
        "framework": "CSCv7",
        "control": "5.1"
      },
      {
        "framework": "ITSG-33",
        "control": "SC-7(12)"
      },
      {
        "framework": "LEVEL",
        "control": "1S"
      },
      {
        "framework": "NIAv2",
        "control": "AM38"
      },
      {
        "framework": "NIAv2",
        "control": "SS13d"
      },
      {
        "framework": "NIAv2",
        "control": "SS26"
      },
      {
        "framework": "QCSC-v1",
        "control": "5.2.1"
      },
      {
        "framework": "QCSC-v1",
        "control": "5.2.2"
      },
      {
        "framework": "QCSC-v1",
        "control": "6.2"
      },
      {
        "framework": "QCSC-v1",
        "control": "8.2.1"
      }
    ],
    "see_also": "https://workbench.cisecurity.org/files/2518",
    "solution": "Set the following parameters in /etc/sysctl.conf or a /etc/sysctl.d/* file: net.ipv4.conf.all.accept_source_route = 0 net.ipv4.conf.default.accept_source_route = 0 net.ipv6.conf.all.accept_source_route = 0 net.ipv6.conf.default.accept_source_route = 0 Run the following commands to set the active kernel parameters: # sysctl -w net.ipv4.conf.all.accept_source_route=0 # sysctl -w net.ipv4.conf.default.accept_source_route=0 # sysctl -w net.ipv6.conf.all.accept_source_route=0 # sysctl -w net.ipv6.conf.default.accept_source_route=0 # sysctl -w net.ipv4.route.flush=1 # sysctl -w net.ipv6.route.flush=1",
    "plugin_id": 21157
  },
  {
    "asset_uuid": "e5e6fa1b-243f-45b7-82cb-285c271cbaa6",
    "first_seen": "2021-01-28T17:26:40Z",
    "last_seen": "2021-01-28T17:27:02Z",
    "audit_file": "CIS_CentOS_8_Server_L1_v1.0.0.audit",
    "check_id": "029872b8096c787524a6bc025aaa541f2ac662384859158a5388d3b3e4d07162",
    "check_name": "3.4.4.1.2 Ensure loopback traffic is configured - INPUT",
    "check_info": "Configure the loopback interface to accept traffic. Configure all other interfaces to deny traffic to the loopback network (127.0.0.0/8).  Loopback traffic is generated between processes on machine and is typically critical to operation of the system. The loopback interface is the only place that loopback network (127.0.0.0/8) traffic should be seen, all other interfaces should ignore traffic on this network as an anti-spoofing measure.",
    "expected_value": "cmd: /usr/sbin/iptables -L INPUT -v -n | /usr/bin/awk '{ a[$3\":\"$4\":\"$6\":\"$7\":\"$8\":\"$9] = NR; print } END { if (a[\"ACCEPT:all:lo:*:0.0.0.0/0:0.0.0.0/0\"] > 0 && a[\"ACCEPT:all:lo:*:0.0.0.0/0:0.0.0.0/0\"] < a[\"DROP:all:*:*:127.0.0.0/8:0.0.0.0/0\"]) { print \"pass\" } else { print \"fail\" } }'\nexpect: ^pass$\nsystem: Linux",
    "actual_value": "The command '/usr/sbin/iptables -L INPUT -v -n | /usr/bin/awk '{ a[$3\":\"$4\":\"$6\":\"$7\":\"$8\":\"$9] = NR; print } END { if (a[\"ACCEPT:all:lo:*:0.0.0.0/0:0.0.0.0/0\"] > 0 && a[\"ACCEPT:all:lo:*:0.0.0.0/0:0.0.0.0/0\"] < a[\"DROP:all:*:*:127.0.0.0/8:0.0.0.0/0\"]) { print \"pass\" } else { print \"fail\" } }'' returned : \n\nChain INPUT (policy ACCEPT 2247K packets, 301M bytes)\n pkts bytes target     prot opt in     out     source               destination         \nfail",
    "status": "FAILED",
    "reference": [
      {
        "framework": "800-171",
        "control": "3.13.1"
      },
      {
        "framework": "800-53",
        "control": "SC-7(12)"
      },
      {
        "framework": "CSCv7",
        "control": "9.4"
      },
      {
        "framework": "ITSG-33",
        "control": "SC-7(12)"
      },
      {
        "framework": "LEVEL",
        "control": "1S"
      },
      {
        "framework": "NIAv2",
        "control": "AM38"
      },
      {
        "framework": "NIAv2",
        "control": "SS13d"
      },
      {
        "framework": "NIAv2",
        "control": "SS26"
      },
      {
        "framework": "QCSC-v1",
        "control": "5.2.1"
      },
      {
        "framework": "QCSC-v1",
        "control": "5.2.2"
      },
      {
        "framework": "QCSC-v1",
        "control": "6.2"
      },
      {
        "framework": "QCSC-v1",
        "control": "8.2.1"
      }
    ],
    "see_also": "https://workbench.cisecurity.org/files/2518",
    "solution": "Run the following commands to implement the loopback rules: # iptables -A INPUT -i lo -j ACCEPT # iptables -A OUTPUT -o lo -j ACCEPT # iptables -A INPUT -s 127.0.0.0/8 -j DROP",
    "plugin_id": 21157
  }
]
```

#### J1 Data

- Current Day Type: N/A
- Current Day Class: N/A
- Notes:

# Vulnerability Management

## List Agents

### Endpoint: [GET Agents List](https://developer.tenable.com/reference/agents-list)

#### Example Response:

```json
{
  "agents": [
    {
      "id": 157,
      "uuid": "655993d5-c131-46e8-a82f-957f6f894cac",
      "name": "GRD-LPTP",
      "platform": "WINDOWS",
      "distro": "win-x86-64",
      "ip": "192.0.2.57",
      "last_scanned": 1515620036,
      "plugin_feed_id": "201801081515",
      "core_build": "106",
      "core_version": "7.0.0",
      "linked_on": 1456775443,
      "last_connect": 1515674073,
      "status": "off",
      "groups": [
        {
          "name": "CodyAgents",
          "id": 8
        },
        {
          "name": "Agent Group A",
          "id": 3316
        }
      ]
    },
    {
      "id": 14569,
      "uuid": "72ac6ad1-fc86-4af4-be0c-0ff3bfbfb242",
      "name": "example.com",
      "platform": "LINUX",
      "distro": "es7-x86-64",
      "ip": "192.0.2.57",
      "plugin_feed_id": "201805161620",
      "core_build": "13",
      "core_version": "7.0.3",
      "linked_on": 1508329832,
      "last_connect": 1526565530,
      "status": "off",
      "groups": [
        {
          "name": "SC Research",
          "id": 1167
        }
      ]
    },
    {
      "id": 14570,
      "uuid": "938cb466-06ea-477e-abb0-99d8da0e0f20",
      "name": "example.com",
      "platform": "LINUX",
      "distro": "es7-x86-64",
      "ip": "192.0.2.57",
      "plugin_feed_id": "201805161620",
      "core_build": "13",
      "core_version": "7.0.3",
      "linked_on": 1508329886,
      "last_connect": 1526565624,
      "status": "off",
      "groups": [
        {
          "name": "SC Research",
          "id": 1167
        }
      ]
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 50,
    "offset": 0,
    "sort": [
      {
        "name": "name",
        "order": "asc"
      }
    ]
  }
}
```

#### J1 Data

- Current Day Type: N/A
- Current Day Class: N/A
- Notes: Could be useful for creating a HostAgent to Host|Device relationships

## List Agents For Group

### Endpoint: [GET Agents For Group](https://developer.tenable.com/reference/agent-group-list-agents)

#### Example Response:

```json
{
  "agents": [
    {
      "id": 20,
      "uuid": "96efbd47-9d96-443f-be29-2ac723dde270",
      "name": "Codys-MacBook-Pro.local",
      "platform": "DARWIN",
      "distro": "macosx",
      "ip": "10.31.100.110",
      "last_scanned": 1545272687,
      "plugin_feed_id": "201812281741",
      "core_build": "1",
      "core_version": "7.2.1",
      "linked_on": 1452106253,
      "last_connect": 1546264939,
      "status": "off",
      "groups": [
        {
          "name": "Agent Group A",
          "id": 8
        },
        {
          "name": "Agent Group B",
          "id": 31
        },
        {
          "name": "Agent Group C",
          "id": 3315
        }
      ],
      "supports_remote_logs": false
    },
    {
      "id": 65,
      "uuid": "7d14d098-2c60-403a-a1d0-8bce78e27f867b06b5e32a5e47a1",
      "name": "DC02",
      "platform": "WINDOWS",
      "distro": "win-x86-64",
      "ip": "10.31.114.10",
      "last_scanned": 1478743235,
      "plugin_feed_id": "0",
      "linked_on": 1453821446,
      "status": "off",
      "groups": [
        {
          "name": "Agent Group A",
          "id": 8
        },
        {
          "name": "Agent Group B",
          "id": 31
        },
        {
          "name": "Agent Group C",
          "id": 3316
        }
      ],
      "supports_remote_logs": false
    },
    {
      "id": 643,
      "uuid": "d59d1f5b-f775-4061-9e36-fae22ab7518f2596d192e3cf57f8",
      "name": "DESKTOP-PSNDJQ6",
      "platform": "WINDOWS",
      "distro": "win-x86-64",
      "ip": "192.0.2.3",
      "last_scanned": 1477011651,
      "plugin_feed_id": "0",
      "linked_on": 1468619962,
      "status": "off",
      "groups": [
        {
          "name": "Agent Group A",
          "id": 8
        },
        {
          "name": "Agent Group C",
          "id": 3316
        }
      ],
      "supports_remote_logs": false
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 50,
    "offset": 0,
    "sort": [
      {
        "name": "name",
        "order": "asc"
      }
    ]
  }
}
```

#### J1 Data

- Current Day Type: ``
- Current Day Class: ``
- Notes:

## List Attributes

### Endpoint: [GET Attributes](https://cloud.tenable.com/api/v3/assets/attributes)

#### Example Response:

```json
{
  "attributes": [
    {
      "id": "116af8c3-969d-4621-9f9f-364eeb58e3a7",
      "name": "Owner",
      "description": "The person that owns the asset."
    },
    {
      "id": "116af8c3-969d-4621-9f9f-364eeb58e3a7",
      "name": "Risk Rating",
      "description": "The risk rating of the asset."
    },
    {
      "id": "116af8c3-969d-4621-9f9f-364eeb58e3a7",
      "name": "Location",
      "description": "Where the asset is located."
    }
  ]
}
```

#### J1 Data

- Current Day Type: N/A
- Current Day Class: N/A
- Notes: Could be useful for decorating assets, correlating ownership. Would be
  difficult to add since we don't know what we want from each. Maybe we could
  filter the attributes in the configuration adding these. Do customers use
  these? Would also require the use of:
  https://developer.tenable.com/reference/io-v3-asset-attributes-assigned-list,
  which may be too slow for us to add.

## List Networks

### Endpoint: [GET Networks](https://developer.tenable.com/reference/networks-list-scanners)

#### Example Response:

```json
{
  "networks": [
    {
      "owner_uuid": "ddbd3e11-3311-4682-9912-8e81805fd8a9",
      "created": 154474408527,
      "modified": 154474408527,
      "scanner_count": 10,
      "uuid": "00000000-0000-0000-0000-000000000000",
      "name": "Default",
      "is_default": true,
      "created_by": "ddbd3e11-3311-4682-9912-8e81805fd8a9",
      "modified_by": "ddbd3e11-3311-4682-9912-8e81805fd8a9",
      "created_in_seconds": 1544744085,
      "modified_in_seconds": 1544744085
    },
    {
      "owner_uuid": "0e67b283-07a4-464c-a5e4-7b42576962fd",
      "created": 1557526802865,
      "modified": 1557526802865,
      "scanner_count": 1,
      "uuid": "42475f11-5e6b-4d6a-a53d-63fe494961df",
      "name": "Headquarters",
      "description": "Network devices at Columbia, MD location",
      "is_default": false,
      "created_by": "0f403df2-3b35-4339-9f74-1574805de203",
      "modified_by": "0f403df2-3b35-4339-9f74-1574805de203",
      "assets_ttl_days": 91,
      "created_in_seconds": 1557526802,
      "modified_in_seconds": 1557526802
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 50,
    "offset": 0,
    "sort": [
      {
        "name": "name",
        "order": "asc"
      }
    ]
  }
}
```

#### J1 Data

- Current Day Type: N/A
- Current Day Class: N/A
- Notes:

## List Network Asset Count

### Endpoint: [GET Network Asset Count](https://developer.tenable.com/reference/io-networks-asset-count-details)

#### Example Response:

```json
{
  "numAssetsNotSeen": 200,
  "numAssetsTotal": 1000
}
```

#### J1 Data

- Current Day Type: N/A
- Current Day Class: N/A
- Notes: Could be valuable for identifying weak networks.

## List Scanners for Network

### Endpoint: [GET Scanners For Network](https://developer.tenable.com/reference/networks-list-scanners)

#### Example Response:

```json
{
  "scanners": [
    {
      "creation_date": 1521065518,
      "distro": "2.6.32-504.8.1.el6.x86_64",
      "engine_build": "201710101",
      "engine_version": "NNM 5.4.0",
      "group": false,
      "id": 215898,
      "key": "bd98a384ff0e91c8f94fa7f786f8827c1eb7b28dffcfb9895f9d85bd8f0a7d53",
      "last_connect": 1524524576,
      "last_modification_date": 1524523493,
      "linked": 1,
      "loaded_plugin_set": "201803271415",
      "name": "NNM-540",
      "num_scans": 0,
      "owner": "system",
      "owner_id": 1,
      "owner_name": "system",
      "owner_uuid": "ddbd3e11-3311-4682-9912-8e81805fd8a9",
      "platform": "LINUX",
      "pool": false,
      "report_frequency": 3600,
      "settings": {},
      "scan_count": 0,
      "source": "service",
      "status": "off",
      "timestamp": 1524523493,
      "type": "managed_pvs",
      "uuid": "946df0af-0597-4d1e-993d-36a5c25b0d36",
      "remote_uuid": "4e7b9e29-b128-4ae5-9108-b936b35c6f1a9b9a533780bda648",
      "supports_remote_logs": false
    }
  ]
}
```

#### J1 Data

- Current Day Type: ``
- Current Day Class: ``
- Notes:

## List Scanners

### Endpoint: [GET List Scanners](https://developer.tenable.com/reference/scanners-list)

#### Example Response:

```json
{
  "scanners": [
    {
      "creation_date": 1500743403,
      "group": true,
      "id": 120958,
      "key": "fd16fc0278c4222feb0697045cd8f0358449acc6ca3130aa63a09d5acb1dd78f",
      "last_connect": null,
      "last_modification_date": 1500743403,
      "license": {
        "activation_code": "448U-ABCD-1234",
        "agents": -1,
        "ips": 500,
        "scanners": -1,
        "users": -1,
        "enterprise_pause": false,
        "expiration_date": 1614038400,
        "evaluation": false,
        "apps": {
          "consec": {
            "mode": "standard",
            "expiration_date": 1613970000,
            "activation_code": "C82J-ABCD-1234",
            "max_gb": "1"
          },
          "was": {
            "mode": "standard",
            "expiration_date": 1613970000,
            "activation_code": "C99G-ABCD-1234",
            "web_assets": "10"
          }
        },
        "scanners_used": 1,
        "agents_used": 0
      },
      "linked": 1,
      "name": "US West Cloud Scanners",
      "network_name": "Default",
      "num_scans": 0,
      "owner": "system",
      "owner_id": 1,
      "owner_name": "system",
      "owner_uuid": "564bc2ce-4dae-4285-aade-2b744697d9aa",
      "pool": true,
      "scan_count": 0,
      "shared": 1,
      "source": "service",
      "status": "on",
      "timestamp": 1500743403,
      "type": "local",
      "user_permissions": 64,
      "uuid": "26e9266b-d42e-4f77-877f-3164bce652c4db3eac57471272de",
      "supports_remote_logs": false
    },
    {
      "creation_date": 1559325208,
      "group": true,
      "id": 236329,
      "key": "6dec14cb6d33bce4173b8bd0a022400e306629ddca7951bebe4252a6973c16ce",
      "last_connect": null,
      "last_modification_date": 1559325208,
      "linked": 1,
      "name": "US Cloud Scanner",
      "network_name": "Default",
      "num_scans": 0,
      "owner": "system",
      "owner_id": 1,
      "owner_name": "system",
      "owner_uuid": "564bc2ce-4dae-4285-aade-2b744697d9aa",
      "pool": true,
      "scan_count": 0,
      "shared": 1,
      "source": "service",
      "status": "on",
      "timestamp": 1559325208,
      "type": "pool",
      "user_permissions": 128,
      "uuid": "00000000-0000-0000-0000-00000000000000000000000000001",
      "supports_remote_logs": false
    },
    {
      "creation_date": 1561584499,
      "group": true,
      "id": 236911,
      "key": "68a3829fe2ce4d9ee6ab053691c7b9114cab6148294b12489bbcc0db54c6c109",
      "last_connect": null,
      "last_modification_date": 1561584499,
      "linked": 1,
      "name": "US West Cloud Scanners",
      "network_name": "Default",
      "num_scans": 0,
      "owner": "system",
      "owner_id": 1,
      "owner_name": "system",
      "owner_uuid": "564bc2ce-4dae-4285-aade-2b744697d9aa",
      "pool": true,
      "scan_count": 0,
      "shared": 1,
      "source": "service",
      "status": "on",
      "timestamp": 1561584499,
      "type": "pool",
      "user_permissions": 128,
      "uuid": "e84ca418-ef25-4dd6-8635-4df11a6e1c2f",
      "supports_remote_logs": false
    }
  ]
}
```

#### J1 Data

- Current Day Type: N/A
- Current Day Class: N/A
- Notes: Would be a great tie in between networks, hostagent, scanner

## List Scans

### Endpoint: [GET Scans](https://developer.tenable.com/reference/scans-list)

#### Example Response:

```json
{
  "scans": [
    {
      "control": true,
      "creation_date": 1667846780,
      "enabled": false,
      "id": 32,
      "last_modification_date": 1667955712,
      "legacy": false,
      "name": "Example Scan 1",
      "owner": "example@example.com",
      "policy_id": 30,
      "read": false,
      "schedule_uuid": "26cf08d3-3f94-79f4-8038-996376eabd4f186741fe15533e70",
      "shared": true,
      "status": "completed",
      "template_uuid": "131a8e52-3ea6-a291-ec0a-d2ff0619c19d7bd788d6be818b65",
      "has_triggers": false,
      "type": "remote",
      "permissions": 16,
      "user_permissions": 128,
      "uuid": "c1d84965-c4c6-47ea-99c6-2111b803bcae",
      "wizard_uuid": "931a8e52-3ea6-a291-ec0a-d2ff0619c19d7bd788d6be818b65",
      "progress": 100,
      "total_targets": 3072
    },
    {
      "control": true,
      "creation_date": 1667846760,
      "enabled": false,
      "id": 29,
      "last_modification_date": 1667951900,
      "legacy": false,
      "name": "Example Scan 2",
      "owner": "example@example.com",
      "policy_id": 27,
      "read": false,
      "schedule_uuid": "461e4ebc-b309-face-6fa1-afa4ba163cb6d84b9dc0a0dc5020",
      "shared": true,
      "status": "completed",
      "template_uuid": "231a8e52-3ea6-a291-ec0a-d2ff0619c19d7bd788d6be818b65",
      "has_triggers": false,
      "type": "remote",
      "permissions": 16,
      "user_permissions": 128,
      "uuid": "a2ae343e-308b-4540-90b9-ceae09641d84",
      "wizard_uuid": "831a8e52-3ea6-a291-ec0a-d2ff0619c19d7bd788d6be818b65",
      "progress": 100,
      "total_targets": 3072
    },
    {
      "control": true,
      "creation_date": 1656499184,
      "enabled": false,
      "id": 14,
      "last_modification_date": 1656499323,
      "legacy": false,
      "name": "Example Scan 3",
      "owner": "system",
      "read": true,
      "schedule_uuid": "bca83022-b67a-5f73-c0ca-db4542057d40fa937bee56c5655b",
      "shared": false,
      "status": "completed",
      "has_triggers": false,
      "type": "pvs",
      "permissions": 0,
      "user_permissions": 128,
      "uuid": "d83acc14-2f92-44d3-a843-80c2c4f35ebf",
      "progress": 100,
      "total_targets": 1
    }
  ],
  "folders": [
    {
      "id": 43,
      "name": "My Scans",
      "type": "main",
      "custom": 0,
      "unread_count": 3,
      "default_tag": 1
    },
    {
      "id": 44,
      "name": "Trash",
      "type": "trash",
      "custom": 0,
      "unread_count": 2,
      "default_tag": 0
    }
  ],
  "timestamp": 1671477512
}
```

#### J1 Data

- Current Day Type: ``
- Current Day Class: ``
- Notes:

# Cloud Security

## List Projects - Cloud Security

### Endpoint: [GET Projects](https://cloud.tenable.com/cns/api/v1/projects)

#### Example Response:

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Vulnerable Project",
    "tenant_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "cloud_provider": "aws",
    "status": "READY",
    "resource_count": 83,
    "cloud_resource_count": 68,
    "iac_resource_count": 16,
    "policy_violation_count": 16,
    "cloud_policy_violation_count": 0,
    "iac_policy_violation_count": 16,
    "policy_violation_count_low": 3,
    "policy_violation_count_medium": 6,
    "policy_violation_count_high": 7,
    "drift_count": 0,
    "vertical_drift_count": 0,
    "pipeline_failures": 0,
    "repositories": [
      {
        "repo_id": "75b5dc16-d9bb-4d86-9ca3-fcf2c532361e",
        "repo_name": "vulnerable-environment"
      }
    ],
    "cloud_accounts": [
      {
        "cloud_account_id": "75b5dc16-d9bb-4d86-9ca3-fcf2c532361e",
        "cloud_account_name": "test-account"
      }
    ]
  }
]
```

#### J1 Data

- Current Day Type: N/A
- Current Day Class: N/A
- Notes:

## List Repositories

### Endpoint: [GET Repositories](https://developer.tenable.com/reference/cns-v1-repos-list)

#### Example Response:

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "vulnerable_repo",
    "url": "https://github.com/tenable/vulnerable_repo.git",
    "iac_engine_type": "default_engine",
    "status": "READY",
    "config": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "key": "TERRAFORM_VERSION",
        "value": 0.12,
        "type": ""
      },
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
        "key": "TERRASCAN",
        "value": true,
        "type": ""
      },
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "key": "BRANCH_NAME",
        "value": "develop",
        "type": ""
      }
    ],
    "directory_path": "/",
    "cloud_provider": "aws",
    "branch_name": "main",
    "repo_type": "normal",
    "projects": ["4fa85f64-5717-4562-b3fc-2c963f66afa6"]
  }
]
```

#### J1 Data

- Current Day Type: ``
- Current Day Class: ``
- Notes:

## Get Repository Details

### Endpoint: [GET Repository Details](https://developer.tenable.com/reference/cns-v1-repos-details)

#### Example Response:

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "vulnerable_repo",
  "url": "https://github.com/tenable/vulnerable_repo.git",
  "iac_engine_type": "default_engine",
  "status": "READY",
  "config": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "key": "TERRAFORM_VERSION",
      "value": 0.12,
      "type": ""
    },
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
      "key": "TERRASCAN",
      "value": true,
      "type": ""
    },
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "key": "BRANCH_NAME",
      "value": "develop",
      "type": ""
    }
  ],
  "directory_path": "/",
  "cloud_provider": "aws",
  "auto_remediate": false,
  "branch_name": "main",
  "repo_type": "normal",
  "resources_count": 10,
  "violations_count": 1,
  "last_scan_date": null,
  "projects": ["4fa85f64-5717-4562-b3fc-2c963f66afa6"]
}
```

#### J1 Data

- Current Day Type: N/A
- Current Day Class: N/A
- Notes: Provides some additional details for the repository.

## IaC Scans List

### Endpoint: [GET IaC Scans](https://developer.tenable.com/reference/cns-v1-scans-list)

#### Example Response:

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "created": "2021-11-19T13:20:49.480607Z",
    "completed": "2021-11-19T13:20:50.480607Z",
    "tenant_id": "test@test.com//github",
    "repo_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "projects": ["4fa85f64-5717-4562-b3fc-2c963f66afa6"],
    "scan_type": "iac",
    "scan_status": "COMPLETED",
    "scan_results": [
      {
        "id": "1fa85f64-5717-4562-b3fc-2c963f66afa6",
        "policy_group_name": "Tenable.cs Security Best Practices for AWS",
        "policy_name": "Ensure encryption is enabled for AWS Amazon Machine Image (AMI)",
        "severity": "MEDIUM",
        "category": "",
        "resource_name": "test_ami",
        "resource_type": "aws_ami",
        "module_name": "",
        "file_name": "https://github.com/test/repo.git/main.tf",
        "line_number": 5
      }
    ]
  }
]
```

#### J1 Data

- Current Day Type: N/A
- Current Day Class: N/A
- Notes:

## PRs

### Endpoint: [GET PRs](https://cloud.tenable.com/cns/api/v1/pr)

#### Example Response:

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Auto generated PR from Tenable.cs",
    "status": "OPEN",
    "created_at": "2021-11-19T13:20:49.480607Z",
    "reviewers": [],
    "updated_at": "2021-11-19T13:20:49.480607Z",
    "repository": "test/repo",
    "iac_source_path": "tenablecs_12345",
    "destination_branch": "main",
    "description": "Ensure encryption is enabled for AWS Amazon Machine Image (AMI)",
    "source_branch": "tenablecs_12345",
    "pull_request_id": 2,
    "pull_request_url": "https://github.com/test/repo/pull/2"
  }
]
```

#### J1 Data

- Current Day Type: N/A
- Current Day Class: N/A
- Notes:

# Container Security

## List Images

### Endpoint: [GET Images](https://cloud.tenable.com/container-security/api/v2/images)

#### Example Response:

```json
{
  "items": [
    {
      "repoId": "2491620318530539587",
      "repoName": "dmjb",
      "name": "jboss",
      "tag": "latest",
      "digest": "sha256:f75748b2bbd5a386c8d876770ff09a65c42335fb1f538025b928c794ffa8123f",
      "hasReport": false,
      "hasInventory": false,
      "status": "scan_failed",
      "lastJobStatus": "failed",
      "pullCount": "0",
      "pushCount": "1",
      "source": "pushed",
      "createdAt": "2019-10-31T11:31:11.283Z",
      "updatedAt": "2019-11-31T12:33:29.903Z",
      "finishedAt": "2019-12-31T12:33:29.903Z",
      "imageHash": "859c02589af7",
      "size": "4471",
      "layers": [
        {
          "size": 133212385,
          "digest": "sha256:01e684a89bbea67a11fcc96caed8e8b3320c44e29c2ab2a85016f48a69870bc8"
        },
        {
          "size": 32,
          "digest": "sha256:4f4fb700ef54461cfa02571ae0db9a0dc1e0cdb5577484a6d75e68dc38e8acc1"
        },
        {
          "size": 32,
          "digest": "sha256:4f4fb700ef54461cfa02571ae0db9a0dc1e0cdb5577484a6d75e68dc38e8acc1"
        },
        {
          "size": 32,
          "digest": "sha256:4f4fb700ef54461cfa02571ae0db9a0dc1e0cdb5577484a6d75e68dc38e8acc1"
        },
        {
          "size": 32,
          "digest": "sha256:4f4fb700ef54461cfa02571ae0db9a0dc1e0cdb5577484a6d75e68dc38e8acc1"
        },
        {
          "size": 3338,
          "digest": "sha256:ebdaef68b4f08d23189ae32fd90bd68261385549f46360d9c3d163b988d91a45"
        },
        {
          "size": 250,
          "digest": "sha256:cc7ec6c68bd72324ab932dc00474d0713044542c2adf6bff6f4e4d1cacc70737"
        },
        {
          "size": 510,
          "digest": "sha256:01bb3ac59edc6a05e14a5151cdc39eae261ff37a933118063d1f91bb14aaceb4"
        },
        {
          "size": 7863072,
          "digest": "sha256:a248b0871c3cac9ce2b2a956e118ce03e49027d5d4c4da74df00ae399fff17c3"
        },
        {
          "size": 681,
          "digest": "sha256:c9f371853f28eb40b76f309e27f671b57bffb8d80df4ca8e7970885ae532e172"
        },
        {
          "size": 86733990,
          "digest": "sha256:2fe0df338fc0cc7d9ec4428ba7538f165f901f3a7760c7fecbdda11a435c5eee"
        },
        {
          "size": 71511,
          "digest": "sha256:aa2f8df214335759614f9aceea51f570354944f59c36cc8399415bbfab91839e"
        },
        {
          "size": 67494686,
          "digest": "sha256:23efb549476f5f10a40b3784758a807c0194d87a0b18c9a5a3436e67611e971b"
        },
        {
          "size": 421,
          "digest": "sha256:1049dfc2ba444c2f74f3eb77a07d0fd5fe304d79ea7178d5a0885788696d63aa"
        },
        {
          "size": 374,
          "digest": "sha256:ef072d3c9b418ba3ce624ce456d311bb81c9ae5d4d5bc682da5edadde408fce7"
        }
      ],
      "os": "Unknown",
      "osVersion": "Unknown"
    },
    {
      "repoId": "7185635748924628551",
      "repoName": "elastic",
      "name": "elasticsearch",
      "tag": "5",
      "digest": "sha256:0278ed727ad6dd0bef0be279b3112755a110980c31f07e7f4a54e19b9ca2e24a",
      "hasReport": true,
      "hasInventory": false,
      "status": "scanned",
      "lastJobStatus": "completed",
      "score": 10,
      "numberOfVulns": 54,
      "numberOfMalware": 0,
      "pullCount": "0",
      "pushCount": "1",
      "source": "on_prem_import",
      "createdAt": "2018-12-31T17:51:03.295Z",
      "updatedAt": "2019-11-31T10:48:02.857Z",
      "finishedAt": "2019-12-31T10:48:02.857Z",
      "imageHash": "5e9d896dc62c",
      "size": "3460",
      "layers": [],
      "os": "Debian",
      "osVersion": "9.5"
    },
    {
      "repoId": "7185635748924628551",
      "repoName": "postgres_db",
      "name": "postgres",
      "tag": "latest",
      "digest": "sha256:0dec082064d1203a3ead704057de56823d2c8ae11818da0fd3065dee9ec1b92e",
      "hasReport": true,
      "hasInventory": false,
      "status": "scanned",
      "lastJobStatus": "completed",
      "score": 10,
      "numberOfVulns": 46,
      "numberOfMalware": 0,
      "pullCount": "0",
      "pushCount": "1",
      "source": "on_prem_import",
      "createdAt": "2018-12-31T17:51:43.861Z",
      "updatedAt": "2019-11-31T16:46:10.739Z",
      "finishedAt": "2019-12-31T16:46:10.739Z",
      "imageHash": "c230b2f564da",
      "size": "3244",
      "layers": [],
      "os": "Debian",
      "osVersion": "9.6"
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 1000,
    "total": 138,
    "sort": []
  }
}
```

#### J1 Data

- Current Day Type: `tenable_container_image`
- Current Day Class: ``
- Notes:

## List Repositories

### Endpoint: [GET List Repositories](https://developer.tenable.com/reference/container-security-v2-list-repositories)

#### Example Response:

```json
{
  "items": [
    {
      "name": "dmjb",
      "imagesCount": 6,
      "labelsCount": 6,
      "vulnerabilitiesCount": 792,
      "malwareCount": 0,
      "pullCount": 0,
      "pushCount": 12,
      "totalBytes": 1766950068
    },
    {
      "name": "air-gap",
      "imagesCount": 7,
      "labelsCount": 7,
      "vulnerabilitiesCount": 514,
      "malwareCount": 0,
      "pullCount": 0,
      "pushCount": 0,
      "totalBytes": 0
    },
    {
      "name": "imiell",
      "imagesCount": 1,
      "labelsCount": 1,
      "vulnerabilitiesCount": 291,
      "malwareCount": 0,
      "pullCount": 0,
      "pushCount": 2,
      "totalBytes": 403346467
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 10,
    "total": 3,
    "sort": []
  }
}
```

#### J1 Data

- Current Day Type: `tenable_container_repository`
- Current Day Class: Repository
- Notes:

## Image Report

### Endpoint: [GET Image Report](https://developer.tenable.com/reference/container-security-v2-get-image-report)

#### Example Response:

```json
{
  "os_release_name": "16.04.2 LTS (Xenial Xerus)",
  "malware": [
    {
      "file": "/20131116130541_http___198_2_192_204_22_disknyp",
      "type": "ELF32",
      "md5": "c92129fc230bacd113530fee254fc2b6",
      "sha256": "sha256:60e24cb19a3cfdc88712f3511adfde242abff3c1915b34eeb19dd7cc72380df2"
    },
    {
      "file": "/20131103183232_http___61_132_227_111_8080_meimei",
      "type": "ELF32",
      "md5": "27072fd3a3cedaeed8cfebf29b9ed73f",
      "sha256": "sha256:a8cd37210dea08880122c360cd096eda872f443c3dd39e498b2695955a3e0ad7"
    },
    {
      "file": "/20131116163507_http___198_2_192_204_22_disknyp",
      "type": "ELF32",
      "md5": "c92129fc230bacd113530fee254fc2b6",
      "sha256": "sha256:60e24cb19a3cfdc88712f3511adfde242abff3c1915b34eeb19dd7cc72380df2"
    }
  ],
  "sha256": "sha256:f708f91abdec052d05a46213815540616d24627b6af9cb3668484efb017969bf",
  "os": "LINUX_UBUNTU",
  "risk_score": 10,
  "findings": [
    {
      "nvdFinding": {
        "cve": "CVE-2018-0494",
        "description": "2018/05/09",
        "published_date": "2018/05/09",
        "modified_date": "It was discovered that Wget incorrectly handled certain inputs. An\nattacker could possibly use this to inject arbitrary cookie values.\n\nNote that Tenable Network Security has extracted the preceding\ndescription block directly from the Ubuntu security advisory. Tenable\nhas attempted to automatically clean and format it as much as possible\nwithout introducing additional issues.",
        "cvss_score": "4.3",
        "access_vector": "Network",
        "access_complexity": "Medium",
        "auth": "None required",
        "availability_impact": "None",
        "confidentiality_impact": "None",
        "integrity_impact": "Partial",
        "cwe": "CWE-20",
        "cpe": ["p-cpe:/a:canonical:ubuntu_linux:wget"],
        "remediation": "Update the affected wget package.",
        "references": ["USN:3643-1"]
      },
      "packages": [
        {
          "name": "wget",
          "version": "1.17.1-1ubuntu1.2",
          "type": "linux"
        }
      ]
    },
    {
      "nvdFinding": {
        "cve": "CVE-2017-15670",
        "description": "2018/01/17",
        "published_date": "2018/01/17",
        "modified_date": "It was discovered that the GNU C library did not properly handle all\nof the possible return values from the kernel getcwd(2) syscall. A\nlocal attacker could potentially exploit this to execute arbitrary\ncode in setuid programs and gain administrative privileges.\n(CVE-2018-1000001)\n\nA memory leak was discovered in the _dl_init_paths() function in the\nGNU C library dynamic loader. A local attacker could potentially\nexploit this with a specially crafted value in the LD_HWCAP_MASK\nenvironment variable, in combination with CVE-2017-1000409 and another\nvulnerability on a system with hardlink protections disabled, in order\nto gain administrative privileges. (CVE-2017-1000408)\n\nA heap-based buffer overflow was discovered in the _dl_init_paths()\nfunction in the GNU C library dynamic loader. A local attacker could\npotentially exploit this with a specially crafted value in the\nLD_LIBRARY_PATH environment variable, in combination with\nCVE-2017-1000408 and another vulnerability on a system with hardlink\nprotections disabled, in order to gain administrative privileges.\n(CVE-2017-1000409)\n\nAn off-by-one error leading to a heap-based buffer overflow was\ndiscovered in the GNU C library glob() implementation. An attacker\ncould potentially exploit this to cause a denial of service or execute\narbitrary code via a maliciously crafted pattern. (CVE-2017-15670)\n\nA heap-based buffer overflow was discovered during unescaping of user\nnames with the ~ operator in the GNU C library glob() implementation.\nAn attacker could potentially exploit this to cause a denial of\nservice or execute arbitrary code via a maliciously crafted pattern.\n(CVE-2017-15804)\n\nIt was discovered that the GNU C library dynamic loader mishandles\nRPATH and RUNPATH containing $ORIGIN for privileged (setuid or\nAT_SECURE) programs. A local attacker could potentially exploit this\nby providing a specially crafted library in the current working\ndirectory in order to gain administrative privileges. (CVE-2017-16997)\n\nIt was discovered that the GNU C library malloc() implementation could\nreturn a memory block that is too small if an attempt is made to\nallocate an object whose size is close to SIZE_MAX, resulting in a\nheap-based overflow. An attacker could potentially exploit this to\ncause a denial of service or execute arbitrary code. This issue only\naffected Ubuntu 17.10. (CVE-2017-17426).\n\nNote that Tenable Network Security has extracted the preceding\ndescription block directly from the Ubuntu security advisory. Tenable\nhas attempted to automatically clean and format it as much as possible\nwithout introducing additional issues.",
        "cvss_score": "7.5",
        "access_vector": "Network",
        "access_complexity": "Medium",
        "auth": "None required",
        "availability_impact": "Complete",
        "confidentiality_impact": "Complete",
        "integrity_impact": "Complete",
        "cwe": "CWE-119",
        "cpe": ["p-cpe:/a:canonical:ubuntu_linux:libc6"],
        "remediation": "Update the affected libc6 package.",
        "references": ["USN:3534-1"]
      },
      "packages": [
        {
          "name": "libc6",
          "version": "2.23-0ubuntu9",
          "type": "linux"
        }
      ]
    },
    {
      "nvdFinding": {
        "cve": "CVE-2017-13089",
        "description": "2017/10/26",
        "published_date": "2017/10/26",
        "modified_date": "Antti LevomÃ¤ki, Christian Jalio, and Joonas Pihlaja discovered that\nWget incorrectly handled certain HTTP responses. A remote attacker\ncould use this issue to cause Wget to crash, resulting in a denial of\nservice, or possibly execute arbitrary code. (CVE-2017-13089,\nCVE-2017-13090)\n\nDawid Golunski discovered that Wget incorrectly handled recursive or\nmirroring mode. A remote attacker could possibly use this issue to\nbypass intended access list restrictions. (CVE-2016-7098)\n\nOrange Tsai discovered that Wget incorrectly handled CRLF sequences in\nHTTP headers. A remote attacker could possibly use this issue to\ninject arbitrary HTTP headers. (CVE-2017-6508).\n\nNote that Tenable Network Security has extracted the preceding\ndescription block directly from the Ubuntu security advisory. Tenable\nhas attempted to automatically clean and format it as much as possible\nwithout introducing additional issues.",
        "cvss_score": "9.3",
        "access_vector": "Network",
        "access_complexity": "Medium",
        "auth": "None required",
        "availability_impact": "Complete",
        "confidentiality_impact": "Complete",
        "integrity_impact": "Complete",
        "cwe": "CWE-119",
        "cpe": ["p-cpe:/a:canonical:ubuntu_linux:wget"],
        "remediation": "Update the affected wget package.",
        "references": ["USN:3464-1"]
      },
      "packages": [
        {
          "name": "wget",
          "version": "1.17.1-1ubuntu1.2",
          "type": "linux"
        }
      ]
    }
  ],
  "os_version": "16.04",
  "created_at": "2018-12-31T17:07:34.556Z",
  "installed_packages": [
    {
      "name": "dpkg",
      "version": "1.18.4ubuntu1.2",
      "type": "linux"
    },
    {
      "name": "ubuntu-keyring",
      "version": "2012.05.19",
      "type": "linux"
    },
    {
      "name": "libssl1.0.0",
      "version": "1.0.2g-1ubuntu4.8",
      "type": "linux"
    },
    {
      "name": "libcap2-bin",
      "version": "1:2.24-12",
      "type": "linux"
    },
    {
      "name": "liblz4-1",
      "version": "0.0~r131-2ubuntu2",
      "type": "linux"
    }
  ],
  "platform": "docker",
  "image_name": "ubuntu",
  "updated_at": "2019-12-31T11:04:20.301Z",
  "digest": "f708f91abdec052d05a46213815540616d24627b6af9cb3668484efb017969bf",
  "tag": "infected",
  "potentially_unwanted_programs": [],
  "docker_image_id": "4013750e4cd5",
  "os_architecture": "AMD64"
}
```

#### J1 Data

- Current Day Type: `tenable_container_report`, `tenable_container_malware`,
  `tenable_container_finding`, `tenable_container_unwanted_program`
- Current Day Class: Assessment
- Notes:

##

### Endpoint: []()

#### Example Response:

```json

```

#### J1 Data

- Current Day Type: ``
- Current Day Class: ``
- Notes:
