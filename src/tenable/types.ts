export interface Dictionary<T> {
  [key: string]: T;
}

// -- https://cloud.tenable.com/users

export interface User {
  uuid: string;
  id: number;
  user_name: string;
  username: string;
  email: string;
  name: string;
  type: string;
  container_uuid: string;
  permissions: number;
  login_fail_count: number;
  login_fail_total: number;
  enabled: boolean;
  lastlogin: number;
  uuid_id: string;
}

// -- https://cloud.tenable.com/scans
//    https://developer.tenable.com/reference#scans-list

/**
 * A scan is a configuration to perform scans on a set of targets, and it
 * provides access to the current/most recent execution. Scans also have a
 * history of execution, which is not represented by this type.
 */
export interface RecentScanSummary {
  id: number;
  legacy: boolean;
  permissions: number;
  type: string;
  read: boolean;
  last_modification_date: number;
  creation_date: number;
  status: string;
  uuid: string;
  shared: boolean;
  user_permissions: number;
  owner: string;
  schedule_uuid: string;
  timezone?: string;
  rrules?: string;
  starttime?: string;
  enabled: boolean;
  control: boolean;
  name: string;
}

// -- https://cloud.tenable.com/scans/:scanId
//    https://developer.tenable.com/reference#scans-details

/**
 * Details of a scan, providing a lot more information about the current/recent
 * execution.
 */
export interface RecentScanDetail {
  /**
   * Details about the scan itself.
   */
  info: ScanInfo;

  /**
   * The hosts that were included in the current/recent exection of the scan,
   * `undefined` when there are no hosts returned by the API.
   */
  hosts?: ScanHost[];

  /**
   * Vulnerabilities found during the current/recent execution of the scan,
   * `undefined` when there are no vulnerabilities returned by the API.
   */
  vulnerabilities?: ScanVulnerabilitySummary[];
}

export interface ScanInfo {
  owner: string;
  name: string;
  no_target: boolean;
  folder_id: number;
  control: boolean;
  user_permissions: number;
  schedule_uuid: string;
  edit_allowed: boolean;
  scanner_name: string;
  policy: string;
  shared?: string;
  object_id: number;
  hostcount: number;
  uuid: string;
  status: string;
  scan_type: string;
  targets: string;
  alt_targets_used: boolean;
  "pci-can-upload": boolean;
  timestamp: number;
  haskb: boolean;
  hasaudittrail: boolean;
}

export interface ScanHost {
  /**
   * The UUID of the scan host entry. As of Aug. 22, 2019, this is not included
   * in "webapp" `ScanDetail.hosts` entries.
   */
  uuid?: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  severity: number;
  host_id: number;
  hostname: string;
}

export interface ScanVulnerabilitySummary {
  count: number;
  plugin_family: string;
  plugin_id: number;
  plugin_name: string;
  severity: number;
}

// -- https://cloud.tenable.com/scans/:scanId/hosts/:hostId
//    https://developer.tenable.com/reference#scans-host-details

export interface ScanVulnerabilitiesResponse {
  vulnerabilities: ScanHostVulnerability[];
}

export interface ScanHostVulnerability {
  count: number;
  plugin_family: string;
  plugin_id: number;
  plugin_name: string;
  severity: number;
  host_id: number;
  hostname: string;
}

// -- https://cloud.tenable.com/assets

export interface AssetsResponse {
  assets: AssetSummary[];
  total: number;
}

export interface AssetSummary {
  id: string; // uuid
  has_agent: boolean;
  last_seen: string;
  sources: [
    {
      name: string;
      first_seen: string;
      last_seen: string;
    },
  ];
  ipv4: string[];
  ipv6: string[];
  fqdn: string[];
  netbios_name: string[];
  operating_system: string[];
  agent_name: string[];
  aws_ec2_name: string[];
  mac_address: string[];
}

// -- https://cloud.tenable.com/assets/:uuid
//    https://developer.tenable.com/reference#assets-list-assets

// Not yet ingested, though there are LOTS of details available.

// --

export interface Container {
  number_of_vulnerabilities: string;
  name: string;
  size: string;
  digest: string;
  repo_name: string;
  score: string;
  id: string;
  status: string;
  created_at: string;
  repo_id: string;
  platform: string;
  updated_at: string;
}

export type ContainerVulnerability =
  | ContainerMalware
  | ContainerFinding
  | ContainerUnwantedProgram;

export interface ContainerReport {
  malware: ContainerMalware[];
  sha256: string;
  os: string;
  risk_score: number;
  findings: ContainerFinding[];
  os_version: string;
  created_at: string;
  updated_at: string;
  platform: string;
  image_name: string;
  digest: string;
  tag: string;
  potentially_unwanted_programs: ContainerUnwantedProgram[];
  docker_image_id: string;
  os_architecture: string;
}

export interface ContainerMalware {
  infectedFile: string;
  fileTypeDescriptor: string;
  md5: string;
  sha256: string;
}

export interface ContainerFinding {
  nvdFinding: {
    reference_id?: string;
    cve: string;
    cpe: string[];
    published_date: string;
    modified_date: string; // possibly blank
    description: string;
    cvss_score: string;
    access_vector: string;
    access_complexity: string;
    auth: string;
    availability_impact: string;
    confidentiality_impact: string;
    integrity_impact: string;
    cwe: string;
    remediation: string; // possibly blank
    references: string[]; // possibly empty
  };
  packages: Package[];
}

interface Package {
  name: string;
  version: string;
  release: string;
  epoch: string;
  rawString: string;
}

export interface ContainerUnwantedProgram {
  file: string;
  md5: string;
  sha256: string;
}

export interface UserPermissionsResponse {
  type: string;
  permissions: number;
  enabled: boolean;
}

export interface UsersResponse {
  users: User[];
}

export interface ScansResponse {
  folders: Folder[];
  scans: RecentScanSummary[];
  timestamp: number;
}

interface Folder {
  unread_count: number;
  custom: number;
  default_tag: number;
  type: string;
  name: string;
  id: number;
}

export interface ScanResponse {
  info: ScanInfo;
  hosts?: ScanHost[];
  vulnerabilities: ScanVulnerabilitySummary[];
}

// -- https://cloud.tenable.com/workbenches/assets/:assetId/vulnerabilities/:pluginId/info

export interface AssetVulnerabilityResponse {
  info: AssetVulnerabilityInfo;
}

/**
 * Detailed vulnerability information for a scanned asset/host.
 */
export interface AssetVulnerabilityInfo {
  count: number;
  vuln_count: number;
  description: string;
  synopsis: string;
  solution: string;
  discovery: {
    seen_first: string;
    seen_last: string;
  };
  severity: number;
  plugin_details: {
    family: string;
    name: string;
    severity: number;
  };
  reference_information: AssetVulnerabilityReferenceInfo;
  risk_information: AssetVulnerabilityRiskInfo;
  vulnerability_information: any;
  vpr?: {
    score: number;
    drivers: any;
  };
}

/**
 * Stores vulnerability reference information such as:
 *
 * ```js
 * {
 *  "name":"cve"
 *  "url":"http://web.nvd.nist.gov/view/vuln/detail?vulnId="
 *  "values":[
 *    "CVE-2010-3190"
 *  ]
 * }
 * ```
 */
export interface AssetVulnerabilityReferenceInfo {
  name: string;
  url: string;
  values: string[];
}

export interface AssetVulnerabilityRiskInfo {
  risk_factor?: string;
  cvss_vector?: string;
  cvss_base_score?: string;
  cvss_temporal_vector?: string;
  cvss_temporal_score?: string;
  cvss3_vector: any;
  cvss3_base_score: any;
  cvss3_temporal_vector: any;
  cvss3_temporal_score: any;
  stig_severity: any;
}

// --

export type ContainersResponse = Container[];

export type ReportResponse = ContainerReport;

export interface TenableDataModel {
  containers: Container[];
  containerReports: ContainerReport[];
  containerMalwares: Dictionary<ContainerMalware[]>;
  containerFindings: Dictionary<ContainerFinding[]>;
  containerUnwantedPrograms: Dictionary<ContainerUnwantedProgram[]>;
}

export enum Method {
  GET = "get",
  POST = "post",
}
