import fetch, { RequestInit } from "node-fetch";

import {
  IntegrationError,
  IntegrationLogger,
} from "@jupiterone/jupiter-managed-integration-sdk";
import * as attempt from "@lifeomic/attempt";

import {
  AssetsResponse,
  AssetSummary,
  AssetVulnerabilityInfo,
  AssetVulnerabilityResponse,
  Container,
  ContainerReport,
  ContainersResponse,
  Method,
  RecentScanDetail,
  RecentScanSummary,
  ReportResponse,
  ScanHostVulnerability,
  ScanResponse,
  ScansResponse,
  ScanVulnerabilitiesResponse,
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
  private readonly retryMaxAttempts: number;

  constructor({
    logger,
    accessToken,
    secretToken,
    retryMaxAttempts,
  }: {
    logger: IntegrationLogger;
    accessToken: string;
    secretToken: string;
    retryMaxAttempts?: number;
  }) {
    this.logger = logger;
    this.accessToken = accessToken;
    this.secretToken = secretToken;
    this.retryMaxAttempts =
      retryMaxAttempts === undefined ? 10 : retryMaxAttempts;
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

  public async fetchScans(): Promise<RecentScanSummary[]> {
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

  public async fetchScanDetail(
    scan: RecentScanSummary,
  ): Promise<RecentScanDetail | undefined> {
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
      };
    } catch (err) {
      // This seems to occur when a scan is listed but for whatever reason is no
      // longer accessible, even to an `Administrator`.
      if (err.statusCode === 403) {
        this.logger.warn(
          { err, scan: { uuid: scan.uuid, id: scan.id } },
          "Scan details forbidden",
        );
      } else {
        throw err;
      }
    }
  }

  public async fetchAssetVulnerabilityInfo(
    assetUuid: string,
    vulnerability: ScanHostVulnerability,
  ): Promise<AssetVulnerabilityInfo | undefined> {
    const logData = {
      assetId: assetUuid,
      pluginId: vulnerability.plugin_id,
    };
    try {
      const vulnerabilitiesResponse = await this.makeRequest<
        AssetVulnerabilityResponse
      >(
        `/workbenches/assets/${assetUuid}/vulnerabilities/${vulnerability.plugin_id}/info`,
        Method.GET,
        {},
      );

      this.logger.trace(logData, "Fetched Tenable asset vulnerability info");

      return vulnerabilitiesResponse.info;
    } catch (err) {
      if (err.statusCode === 404) {
        this.logger.info(
          { ...logData, err },
          "Vulnerabilities details not found for asset",
        );
      } else {
        throw err;
      }
    }
  }

  public async fetchScanHostVulnerabilities(
    scanId: number,
    hostId: number,
  ): Promise<ScanHostVulnerability[]> {
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

  public async fetchAssets(): Promise<AssetSummary[]> {
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
    const requestOptions: RequestInit = {
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

    let retryDelay = 0;

    return attempt.retry(
      async () => {
        const response = await fetch(this.host + url, requestOptions);

        if (response.status === 429) {
          const serverRetryDelay = response.headers.get("retry-after");
          if (serverRetryDelay) {
            retryDelay = Number.parseInt(serverRetryDelay, 10) * 1000;
          }
        }

        if (response.status >= 400) {
          throw new IntegrationError({
            code: "TenableClientApiError",
            message: `${response.statusText}: ${method} ${url}`,
            statusCode: response.status,
          });
        } else {
          return response.json();
        }
      },
      {
        maxAttempts: this.retryMaxAttempts,
        calculateDelay: () => {
          return retryDelay;
        },
        handleError: (err, context) => {
          if (![429, 500, 504].includes(err.statusCode)) {
            context.abort();
          }
        },
      },
    );
  }
}
