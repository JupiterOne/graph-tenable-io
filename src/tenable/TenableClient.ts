import fetch, { RequestInit } from "node-fetch";

import {
  IntegrationError,
  IntegrationLogger,
} from "@jupiterone/jupiter-managed-integration-sdk";
import * as attempt from "@lifeomic/attempt";

import {
  AssetExport,
  AssetsExportStatusResponse,
  AssetsResponse,
  AssetSummary,
  AssetVulnerabilityInfo,
  AssetVulnerabilityResponse,
  Container,
  ContainerReport,
  ContainersResponse,
  ExportAssetsOptions,
  ExportAssetsResponse,
  ExportVulnerabilitiesOptions,
  ExportVulnerabilitiesResponse,
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
  VulnerabilitiesExportStatusResponse,
  VulnerabilityExport,
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
    );
    this.logger.info(
      { permissions: response.permissions },
      "Fetched Tenable user's permissions",
    );
    return response;
  }

  public async fetchUsers(): Promise<User[]> {
    const usersResponse = await this.makeRequest<UsersResponse>(
      "/users",
      Method.GET,
    );
    this.logger.info(
      { users: length(usersResponse.users) },
      "Fetched Tenable users",
    );
    return usersResponse.users;
  }

  public async fetchScans(): Promise<RecentScanSummary[]> {
    const scansResponse = await this.makeRequest<ScansResponse>(
      "/scans",
      Method.GET,
    );
    this.logger.info(
      { scans: length(scansResponse.scans) },
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
      );

      const { info, hosts, vulnerabilities } = scanResponse;

      this.logger.info(
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
      );

      this.logger.info(logData, "Fetched Tenable asset vulnerability info");

      return vulnerabilitiesResponse.info;
    } catch (err) {
      if (err.statusCode === 404) {
        this.logger.info(
          { ...logData, err },
          "Vulnerabilities details not found for asset",
        );
      } else if (err.statusCode === 500) {
        this.logger.warn(
          { ...logData, err },
          "Tenable API returned an internal service error for the asset vulnerabilities.",
        );
      } else {
        throw err;
      }
    }
  }

  public async exportVulnerabilities(
    options: ExportVulnerabilitiesOptions,
  ): Promise<ExportVulnerabilitiesResponse> {
    const exportResponse = await this.makeRequest<
      ExportVulnerabilitiesResponse
    >("/vulns/export", Method.POST, {}, options);

    this.logger.info(
      {
        options,
        exportResponse,
      },
      "Started Tenable vulnerabilities export",
    );

    return exportResponse;
  }

  public async fetchVulnerabilitiesExportStatus(
    exportUuid: string,
  ): Promise<VulnerabilitiesExportStatusResponse> {
    const exportStatusResponse = await this.makeRequest<
      VulnerabilitiesExportStatusResponse
    >(`/vulns/export/${exportUuid}/status`, Method.GET);

    this.logger.info(
      {
        exportUuid,
        exportStatusResponse,
      },
      "Fetched Tenable vulnerabilities export status",
    );

    return exportStatusResponse;
  }

  public async fetchVulnerabilitiesExportChunk(
    exportUuid: string,
    chunkId: number,
  ): Promise<VulnerabilityExport[]> {
    const vulnerabilitiesExportResponse = await this.makeRequest<
      VulnerabilityExport[]
    >(`/vulns/export/${exportUuid}/chunks/${chunkId}`, Method.GET);

    this.logger.info(
      {
        exportUuid,
        chunkId,
        vulnerabilitiesExportResponse: vulnerabilitiesExportResponse.length,
      },
      "Fetched Tenable vulnerabilities export chunk",
    );

    return vulnerabilitiesExportResponse;
  }

  public async exportAssets(
    options: ExportAssetsOptions,
  ): Promise<ExportAssetsResponse> {
    const exportResponse = await this.makeRequest<ExportAssetsResponse>(
      "/assets/export",
      Method.POST,
      {},
      options,
    );

    this.logger.info(
      {
        options,
        exportResponse,
      },
      "Started Tenable assets export",
    );

    return exportResponse;
  }

  public async fetchAssetsExportStatus(
    exportUuid: string,
  ): Promise<AssetsExportStatusResponse> {
    const exportStatusResponse = await this.makeRequest<
      AssetsExportStatusResponse
    >(`/assets/export/${exportUuid}/status`, Method.GET);

    this.logger.info(
      {
        exportUuid,
        exportStatusResponse,
      },
      "Fetched Tenable vulnerabilities export status",
    );

    return exportStatusResponse;
  }

  public async fetchAssetsExportChunk(
    exportUuid: string,
    chunkId: number,
  ): Promise<AssetExport[]> {
    const assetsExportResponse = await this.makeRequest<AssetExport[]>(
      `/assets/export/${exportUuid}/chunks/${chunkId}`,
      Method.GET,
    );

    this.logger.info(
      {
        exportUuid,
        chunkId,
        assetsExportResponse: assetsExportResponse.length,
      },
      "Fetched Tenable assets export chunk",
    );

    return assetsExportResponse;
  }

  public async fetchScanHostVulnerabilities(
    scanId: number,
    hostId: number,
  ): Promise<ScanHostVulnerability[]> {
    const logData = {
      scan: { id: scanId },
      host: { id: hostId },
    };
    try {
      const vulnerabilitiesResponse = await this.makeRequest<
        ScanVulnerabilitiesResponse
      >(`/scans/${scanId}/hosts/${hostId}`, Method.GET);

      this.logger.info(
        {
          ...logData,
          vulnerabilities: length(vulnerabilitiesResponse.vulnerabilities),
        },
        "Fetched Tenable scan host vulnerabilities",
      );
      return vulnerabilitiesResponse.vulnerabilities;
    } catch (err) {
      if (err.statusCode === 404) {
        this.logger.info(
          { ...logData, err },
          "Could not find information on host vulnerabilities",
        );
        return [];
      } else {
        throw err;
      }
    }
  }

  public async fetchAssets(): Promise<AssetSummary[]> {
    const assetsResponse = await this.makeRequest<AssetsResponse>(
      "/assets",
      Method.GET,
    );

    this.logger.info(
      { assets: length(assetsResponse.assets) },
      "Fetched Tenable assets",
    );

    return assetsResponse.assets;
  }

  public async fetchContainers(): Promise<Container[]> {
    const containersResponse = await this.makeRequest<ContainersResponse>(
      "/container-security/api/v1/container/list",
      Method.GET,
    );

    this.logger.info(
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
    );

    this.logger.info(
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
    headers: {} = {},
    body?: {},
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
    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    this.logger.debug({ method, url }, "Fetching Tenable data...");

    let retryDelay = 0;

    return attempt.retry(
      async () => {
        retryDelay = 0;
        const response = await fetch(this.host + url, requestOptions);

        if (response.status === 429) {
          const serverRetryDelay = response.headers.get("retry-after");
          this.logger.info(
            { serverRetryDelay, url },
            "Received 429 response from endpoint; waiting to retry.",
          );
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
          if (err.statusCode === 500 && context.attemptsRemaining > 2) {
            context.attemptsRemaining = 2;
          }
          this.logger.info(
            {
              url,
              err,
              retryDelay,
              attemptNum: context.attemptNum,
              attemptsRemaining: context.attemptsRemaining,
            },
            "Encountered retryable API response. Retrying.",
          );
        },
      },
    );
  }
}
