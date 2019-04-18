import fetch, { RequestInit } from "node-fetch";

export interface Dictionary<T> {
  [key: string]: T;
}

export interface Account {
  id: string;
  name: string;
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
  scanDetail?: ScanDetail;
}

export interface ScanDetail {
  info: ScanInfo;
  hosts: Host[];
  vulnerabilities: WebAppVulnerability[];
}

export interface WebAppVulnerability {
  count: number;
  plugin_family: string;
  plugin_id: number;
  plugin_name: string;
  severity: number;
}

interface ScanInfo {
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
  shared: string;
  object_id: number;
  hostcount: number;
  uuid: string;
  status: string;
  scan_type: string;
  targets: string;
  alt_targets_used: boolean;
  "pci-can-upload": boolean;
  scan_start: number;
  timestamp: number;
  haskb: boolean;
  hasaudittrail: boolean;
  scanner_start: string;
}

interface Host {
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
  | Malware
  | Finding
  | PotentiallyUnwantedProgram;

export interface Report {
  malware: Malware[];
  sha256: string;
  os: string;
  risk_score: number;
  findings: Finding[];
  os_version: string;
  created_at: string;
  platform: string;
  image_name: string;
  updated_at: string;
  digest: string;
  tag: string;
  potentially_unwanted_programs: PotentiallyUnwantedProgram[];
  docker_image_id: string;
  os_architecture: string;
}

export interface Malware {
  infectedFile: string;
  fileTypeDescriptor: string;
  md5: string;
  sha256: string;
}

export interface Finding {
  nvdFinding: {
    reference_id: string;
    cve: string;
    published_date: string;
    modified_date: string;
    description: string;
    cvss_score: string;
    access_vector: string;
    access_complexity: string;
    auth: string;
    availability_impact: string;
    confidentiality_impact: string;
    integrity_impact: string;
    cwe: string;
    remediation: string;
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

export interface PotentiallyUnwantedProgram {
  file: string;
  md5: string;
  sha256: string;
}

interface Source {
  name: string;
  first_seen: string;
  last_seen: string;
}

interface UsersResponse {
  users: User[];
}

interface ScansResponse {
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

interface ScanResponse {
  info: ScanInfo;
  hosts: Host[];
  vulnerabilities: WebAppVulnerability[];
}

interface AssetsResponse {
  assets: Asset[];
  total: number;
}

interface WebAppVulnerabilityResponse {
  vulnerabilities: WebAppVulnerability[];
}

type ContainersResponse = Container[];

type ReportResponse = Report;

export interface TenableDataModel {
  users: User[];
  scans: Scan[];
  assets: Asset[];
  webAppVulnerabilities: Dictionary<WebAppVulnerability[]>;
  containers: Container[];
  reports: Report[];
  containerVulnerabilities: Dictionary<ContainerVulnerability[]>;
}

enum Method {
  GET = "get",
  POST = "post",
}

export default class TenableClient {
  private readonly host: string = "https://cloud.tenable.com";
  private readonly accessToken: string;
  private readonly secretToken: string;

  constructor(accessToken: string, secretToken: string) {
    this.accessToken = accessToken;
    this.secretToken = secretToken;
  }

  public async fetchUsers(): Promise<User[]> {
    const usersResponse = (await this.makeRequest(
      "/users",
      Method.GET,
      {},
    )) as UsersResponse;
    return usersResponse.users;
  }

  public async fetchScans(): Promise<Scan[]> {
    const scansResponse = (await this.makeRequest(
      "/scans",
      Method.GET,
      {},
    )) as ScansResponse;
    return scansResponse.scans;
  }

  public async fetchScanById(id: number): Promise<ScanDetail> {
    const scanResponse = (await this.makeRequest(
      `/scans/${id}`,
      Method.GET,
      {},
    )) as ScanResponse;
    const { hosts, info, vulnerabilities } = scanResponse;
    return { hosts, info, vulnerabilities };
  }

  public async fetchVulnerabilities(
    scanId: number,
    hostId: number,
  ): Promise<WebAppVulnerability[]> {
    const vulnerabilitiesResponse = (await this.makeRequest(
      `/scans/${scanId}/hosts/${hostId}`,
      Method.GET,
      {},
    )) as WebAppVulnerabilityResponse;
    return vulnerabilitiesResponse.vulnerabilities;
  }

  public async fetchAssets(): Promise<Asset[]> {
    const assetsResponse = (await this.makeRequest(
      "/assets",
      Method.GET,
      {},
    )) as AssetsResponse;
    return assetsResponse.assets;
  }

  public async fetchContainers(): Promise<Container[]> {
    const containerResponse = (await this.makeRequest(
      "/container-security/api/v1/container/list",
      Method.GET,
      {},
    )) as ContainersResponse;
    return containerResponse;
  }

  public async fetchReportByImageDigest(digestId: string): Promise<Report> {
    const reportResponse = (await this.makeRequest(
      `/container-security/api/v1/reports/by_image_digest?image_digest=${digestId}`,
      Method.GET,
      {},
    )) as ReportResponse;
    return reportResponse;
  }

  private async makeRequest(
    url: string,
    method: Method,
    headers: {},
  ): Promise<
    | UsersResponse
    | ScansResponse
    | AssetsResponse
    | ScanResponse
    | ContainersResponse
    | ReportResponse
  > {
    const options: RequestInit = {
      method,
      headers: {
        "Content-type": "application/json",
        Accept: "application/json",
        "Accept-encoding": "identity",
        "X-ApiKeys": `accessKey=${this.accessToken}; secretKey=${
          this.secretToken
        };`,
        ...headers,
      },
    };

    const response = await fetch(this.host + url, options);

    return response.json();
  }
}
