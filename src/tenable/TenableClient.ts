import {
  IntegrationError,
  IntegrationLogger,
} from "@jupiterone/jupiter-managed-integration-sdk";
import fetch, { RequestInit } from "node-fetch";
import {
  Asset,
  AssetsResponse,
  Container,
  ContainerReport,
  ContainersResponse,
  Method,
  ReportResponse,
  Scan,
  ScanDetail,
  ScanResponse,
  ScansResponse,
  ScanVulnerabilitiesResponse,
  ScanVulnerability,
  User,
  UserPermissionsResponse,
  UsersResponse,
} from "./types";

function length(resources?: any[]): number {
  return resources ? resources.length : 0;
}

export default class TenableClient {
  private readonly logger: IntegrationLogger;
  private readonly host: string = "https://cloud.tenable.com";
  private readonly accessToken: string;
  private readonly secretToken: string;

  constructor(
    logger: IntegrationLogger,
    accessToken: string,
    secretToken: string,
  ) {
    this.logger = logger;
    this.accessToken = accessToken;
    this.secretToken = secretToken;
  }

  public async fetchUserPermissions() {
    const response = await this.makeRequest<UserPermissionsResponse>(
      "/session",
      Method.GET,
      {},
    );
    this.logger.trace(
      { permissions: response.permissions },
      "Fetched Tenable user's permissions",
    );
    return response;
  }

  public async fetchUsers(): Promise<User[]> {
    const usersResponse = await this.makeRequest<UsersResponse>(
      "/users",
      Method.GET,
      {},
    );
    this.logger.trace(
      { users: length(usersResponse.users) },
      "Fetched Tenable users",
    );
    return usersResponse.users;
  }

  public async fetchScans(): Promise<Scan[]> {
    const scansResponse = await this.makeRequest<ScansResponse>(
      "/scans",
      Method.GET,
      {},
    );
    this.logger.trace(
      { users: length(scansResponse.scans) },
      "Fetched Tenable scans",
    );
    return scansResponse.scans;
  }

  public async fetchScanDetail(scan: Scan): Promise<ScanDetail> {
    try {
      const scanResponse = await this.makeRequest<ScanResponse>(
        `/scans/${scan.id}`,
        Method.GET,
        {},
      );

      const { info, hosts, vulnerabilities } = scanResponse;

      this.logger.trace(
        {
          scan: { id: scan.id, uuid: scan.uuid },
          hosts: length(hosts),
          vulnerabilities: length(vulnerabilities),
        },
        "Fetched Tenable scan details",
      );

      return {
        ...scan,
        hosts,
        info,
        vulnerabilities,
        detailsForbidden: false,
      };
    } catch (err) {
      if (err.statusCode === 403) {
        return { ...scan, detailsForbidden: true };
      } else {
        throw err;
      }
    }
  }

  public async fetchVulnerabilities(
    scanId: number,
    hostId: number,
  ): Promise<ScanVulnerability[]> {
    const vulnerabilitiesResponse = await this.makeRequest<
      ScanVulnerabilitiesResponse
    >(`/scans/${scanId}/hosts/${hostId}`, Method.GET, {});

    this.logger.trace(
      {
        scan: { id: scanId },
        host: { id: hostId },
        vulnerabilities: length(vulnerabilitiesResponse.vulnerabilities),
      },
      "Fetched Tenable scan host vulnerabilities",
    );

    return vulnerabilitiesResponse.vulnerabilities;
  }

  public async fetchAssets(): Promise<Asset[]> {
    const assetsResponse = await this.makeRequest<AssetsResponse>(
      "/assets",
      Method.GET,
      {},
    );

    this.logger.trace(
      { assets: length(assetsResponse.assets) },
      "Fetched Tenable assets",
    );

    return assetsResponse.assets;
  }

  public async fetchContainers(): Promise<Container[]> {
    const containersResponse = await this.makeRequest<ContainersResponse>(
      "/container-security/api/v1/container/list",
      Method.GET,
      {},
    );

    this.logger.trace(
      { containers: length(containersResponse) },
      "Fetched Tenable assets",
    );

    return containersResponse;
  }

  public async fetchReportByImageDigest(
    digestId: string,
  ): Promise<ContainerReport> {
    const reportResponse = await this.makeRequest<ReportResponse>(
      `/container-security/api/v1/reports/by_image_digest?image_digest=${digestId}`,
      Method.GET,
      {},
    );

    this.logger.trace(
      {
        digestId,
        malware: length(reportResponse.malware),
        findings: length(reportResponse.findings),
        unwantedPrograms: length(reportResponse.potentially_unwanted_programs),
      },
      "Fetched Tenable container report",
    );

    return reportResponse;
  }

  private async makeRequest<T>(
    url: string,
    method: Method,
    headers: {},
  ): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {
        "Content-type": "application/json",
        Accept: "application/json",
        "Accept-encoding": "identity",
        "X-ApiKeys": `accessKey=${this.accessToken}; secretKey=${this.secretToken};`,
        ...headers,
      },
    };

    this.logger.trace({ method, url }, "Fetching Tenable data...");

    const response = await fetch(this.host + url, options);

    if (response.status >= 400) {
      throw new IntegrationError({
        code: "TenableClientApiError",
        message: `${response.statusText}: ${method} ${url}`,
        statusCode: response.status,
      });
    } else {
      return response.json();
    }
  }
}
