export interface Dictionary<T> {
  [key: string]: T;
}

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

/**
 * A scan is a configuration to perform scans on a set of targets, and it
 * provides access to the current/most recent execution. Scans also have a
 * history of execution, which is not represented by this type.
 */
export interface Scan {
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
  timezone: string;
  rrules: string;
  starttime: string;
  enabled: boolean;
  control: boolean;
  name: string;
}

/**
 * A `Scan`, but filled out with more details to provide information about the
 * current/recent execution.
 */
export interface ScanDetail extends Scan {
  info: ScanInfo;

  /**
   * The hosts that were included in the current/recent exection of the scan.
   */
  hosts: Host[];

  /**
   * Vulnerabilities found during the current/recent execution of the scan.
   */
  vulnerabilities?: VulnerabilitySummary[];
}

export interface VulnerabilitySummary {
  count: number;
  plugin_family: string;
  plugin_id: number;
  plugin_name: string;
  severity: number;
}

export interface ScanVulnerability {
  scan_id: number;
  count: number;
  plugin_family: string;
  plugin_id: number;
  plugin_name: string;
  severity: number;
  host_id: number;
  hostname: string;
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

export interface Host {
  host_index: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  severity: number;
  host_id: number;
  hostname: string;
}

export interface Asset {
  id: string;
  has_agent: boolean;
  last_seen: string;
  sources: Source[];
  ipv4: string[];
  ipv6: string[];
  fqdn: string[];
  netbios_name: string[];
  operating_system: string[];
  agent_name: string[];
  aws_ec2_name: string[];
  mac_address: string[];
}

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

interface Source {
  name: string;
  first_seen: string;
  last_seen: string;
}

export interface UsersResponse {
  users: User[];
}

export interface ScansResponse {
  folders: Folder[];
  scans: Scan[];
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
  hosts: Host[];
  vulnerabilities: VulnerabilitySummary[];
}

export interface AssetsResponse {
  assets: Asset[];
  total: number;
}

export interface ScanVulnerabilitiesResponse {
  vulnerabilities: ScanVulnerability[];
}

export type ContainersResponse = Container[];

export type ReportResponse = ContainerReport;

export interface TenableDataModel {
  users: User[];
  scans: ScanDetail[];
  assets: Asset[];
  scanVulnerabilities: Dictionary<ScanVulnerability[]>;
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
