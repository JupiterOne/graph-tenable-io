import { version as graphTenablePackageVersion } from '../../package.json';
import Client, {
  ExportStatus,
  TenableRepsonse,
} from '@jupiterone/tenable-client-nodejs';

import {
  IntegrationError,
  IntegrationLogger,
  IntegrationProviderAPIError,
} from '@jupiterone/integration-sdk-core';
import * as attempt from '@lifeomic/attempt';

import {
  AssetExport,
  AssetsExportStatusResponse,
  AssetSummary,
  AssetVulnerabilityInfo,
  CancelExportResponse,
  Container,
  ContainerReport,
  ErrorBody,
  ExportAssetsOptions,
  ExportAssetsResponse,
  ExportVulnerabilitiesOptions,
  ExportVulnerabilitiesResponse,
  RecentScanDetail,
  RecentScanSummary,
  ScanHostVulnerability,
  User,
  VulnerabilitiesExportStatusResponse,
  VulnerabilityExport,
} from '@jupiterone/tenable-client-nodejs';
import isAfter from 'date-fns/isAfter';
import { sleep } from '@lifeomic/attempt';
import pMap from 'p-map';
import addMinutes from 'date-fns/addMinutes';

function length(resources?: any[]): number {
  return resources ? resources.length : 0;
}

export default class TenableClient {
  private readonly logger: IntegrationLogger;
  private readonly retryMaxAttempts: number;
  private readonly client: Client;

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
    this.client = new Client({
      accessKey: accessToken,
      secretKey: secretToken,
      vendor: 'JupiterOne',
      product: 'graph-tenable-cloud',
      build: graphTenablePackageVersion,
    });
    this.logger = logger;
    this.retryMaxAttempts =
      retryMaxAttempts === undefined ? 10 : retryMaxAttempts;
  }

  public async fetchUserPermissions() {
    const response = await this.retryRequest(() =>
      this.client.fetchUserPermissions(),
    );
    this.logger.info(
      { permissions: response.permissions },
      "Fetched Tenable user's permissions",
    );
    return response;
  }

  public async fetchUsers(): Promise<User[]> {
    const usersResponse = await this.retryRequest(() =>
      this.client.fetchUsers(),
    );
    this.logger.info(
      { users: length(usersResponse.users) },
      'Fetched Tenable users',
    );
    return usersResponse.users;
  }

  public async fetchScans(): Promise<RecentScanSummary[]> {
    const scansResponse = await this.retryRequest(() =>
      this.client.fetchScans(),
    );
    this.logger.info(
      { scans: length(scansResponse.scans) },
      'Fetched Tenable scans',
    );
    return scansResponse.scans;
  }

  public async fetchScanDetail(
    scan: RecentScanSummary,
  ): Promise<RecentScanDetail | undefined> {
    try {
      const scanResponse = await this.retryRequest(() =>
        this.client.fetchScanDetail(scan),
      );

      const { info, hosts, vulnerabilities } = scanResponse;

      this.logger.info(
        {
          scan: { id: scan.id, uuid: scan.uuid },
          hosts: length(hosts),
          vulnerabilities: length(vulnerabilities),
        },
        'Fetched Tenable scan details',
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
          'Scan details forbidden',
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
      const vulnerabilitiesResponse = await this.retryRequest(() =>
        this.client.fetchAssetVulnerabilityInfo(assetUuid, vulnerability),
      );

      this.logger.info(logData, 'Fetched Tenable asset vulnerability info');

      return vulnerabilitiesResponse.info;
    } catch (err) {
      if (err.statusCode === 404) {
        this.logger.info(
          { ...logData, err },
          'Vulnerabilities details not found for asset',
        );
      } else if (err.statusCode === 500) {
        this.logger.warn(
          { ...logData, err },
          'Tenable API returned an internal service error for the asset vulnerabilities.',
        );
      } else {
        throw err;
      }
    }
  }

  public async exportVulnerabilities(
    options: ExportVulnerabilitiesOptions,
  ): Promise<ExportVulnerabilitiesResponse> {
    const exportResponse = await this.retryRequest(() =>
      this.client.exportVulnerabilities(options),
    );

    this.logger.info(
      {
        options,
        exportResponse,
      },
      'Started Tenable vulnerabilities export',
    );

    return exportResponse;
  }

  public async cancelVulnerabilitiesExport(
    exportUuid: string,
  ): Promise<CancelExportResponse> {
    const cancelExportResponse = await this.retryRequest(() =>
      this.client.cancelVulnerabilitiesExport(exportUuid),
    );

    this.logger.info(
      {
        cancelExportResponse,
      },
      'Cancelled Tenable vulns export',
    );

    return cancelExportResponse;
  }

  public async fetchVulnerabilitiesExportStatus(
    exportUuid: string,
  ): Promise<VulnerabilitiesExportStatusResponse> {
    const exportStatusResponse = await this.retryRequest(() =>
      this.client.fetchVulnerabilitiesExportStatus(exportUuid),
    );

    this.logger.info(
      {
        exportUuid,
        exportStatusResponse,
      },
      'Fetched Tenable vulnerabilities export status',
    );

    return exportStatusResponse;
  }

  public async fetchVulnerabilitiesExportChunk(
    exportUuid: string,
    chunkId: number,
  ): Promise<VulnerabilityExport[]> {
    const vulnerabilitiesExportResponse = await this.retryRequest(() =>
      this.client.fetchVulnerabilitiesExportChunk(exportUuid, chunkId),
    );

    this.logger.info(
      {
        exportUuid,
        chunkId,
        vulnerabilitiesExportResponse: vulnerabilitiesExportResponse.length,
      },
      'Fetched Tenable vulnerabilities export chunk',
    );

    return vulnerabilitiesExportResponse;
  }

  private async exportAssets(
    options: ExportAssetsOptions,
  ): Promise<ExportAssetsResponse> {
    const exportResponse = await this.retryRequest(() =>
      this.client.exportAssets(options),
    );

    this.logger.info(
      {
        options,
        exportResponse,
      },
      'Started Tenable assets export',
    );

    return exportResponse;
  }

  private async cancelAssetExport(
    exportUuid: string,
  ): Promise<CancelExportResponse> {
    const cancelExportResponse = await this.retryRequest(() =>
      this.client.cancelAssetExport(exportUuid),
    );

    this.logger.info(
      {
        cancelExportResponse,
      },
      'Cancelled Tenable assets export',
    );

    return cancelExportResponse;
  }

  private async fetchAssetsExportStatus(
    exportUuid: string,
  ): Promise<AssetsExportStatusResponse> {
    const exportStatusResponse = await this.retryRequest(() =>
      this.client.fetchAssetsExportStatus(exportUuid),
    );

    this.logger.info(
      {
        exportUuid,
        exportStatusResponse,
      },
      'Fetched Tenable asset export status',
    );

    return exportStatusResponse;
  }

  private async fetchAssetsExportChunk(
    exportUuid: string,
    chunkId: number,
  ): Promise<AssetExport[]> {
    const assetsExportResponse = await this.retryRequest(() =>
      this.client.fetchAssetsExportChunk(exportUuid, chunkId),
    );

    this.logger.info(
      {
        exportUuid,
        chunkId,
        assetsExportResponse: assetsExportResponse.length,
      },
      'Fetched Tenable assets export chunk',
    );

    return assetsExportResponse;
  }

  public async iterateAssets(
    callback: (asset: AssetExport) => void | Promise<void>,
    options?: {
      timeoutInMinutes?: number;
      chunkSize?: number;
    },
  ) {
    const chunkSize = options?.chunkSize || 100;
    const timeoutInMinutes = options?.timeoutInMinutes || 30;
    const { export_uuid: exportUuid } = await this.exportAssets({
      chunk_size: chunkSize,
    });
    let { status, chunks_available: chunksAvailable } =
      await this.fetchAssetsExportStatus(exportUuid);

    const timeLimit = addMinutes(Date.now(), timeoutInMinutes);
    while ([ExportStatus.Processing, ExportStatus.Queued].includes(status)) {
      if (isAfter(Date.now(), timeLimit)) {
        await this.cancelAssetExport(exportUuid);
        throw new IntegrationError({
          code: 'TenableClientApiError',
          message: `Asset export ${exportUuid} failed to finish processing in time limit`,
        });
      }

      ({ status, chunks_available: chunksAvailable } =
        await this.fetchAssetsExportStatus(exportUuid));
      await sleep(5_000); // Sleep 5 seconds between status checks.
    }

    await pMap(
      chunksAvailable,
      async (chunkId) => {
        const assets = await this.fetchAssetsExportChunk(exportUuid, chunkId);
        for (const asset of assets) {
          await callback(asset);
        }
      },
      { concurrency: 3 },
    );
    return { exportUuid };
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
      const vulnerabilitiesResponse = await this.retryRequest(() =>
        this.client.fetchScanHostVulnerabilities(scanId, hostId),
      );

      this.logger.info(
        {
          ...logData,
          vulnerabilities: length(vulnerabilitiesResponse.vulnerabilities),
        },
        'Fetched Tenable scan host vulnerabilities',
      );
      return vulnerabilitiesResponse.vulnerabilities;
    } catch (err) {
      if (err.statusCode === 404) {
        this.logger.info(
          { ...logData, err },
          'Could not find information on host vulnerabilities',
        );
        return [];
      } else {
        throw err;
      }
    }
  }

  public async fetchAssets(): Promise<AssetSummary[]> {
    const assetsResponse = await this.retryRequest(() =>
      this.client.fetchAssets(),
    );

    this.logger.info(
      { assets: length(assetsResponse.assets) },
      'Fetched Tenable assets',
    );

    return assetsResponse.assets;
  }

  public async fetchContainers(): Promise<Container[]> {
    const containersResponse = await this.retryRequest(() =>
      this.client.fetchContainers(),
    );

    this.logger.info(
      { containers: length(containersResponse) },
      'Fetched Tenable assets',
    );

    return containersResponse;
  }

  public async fetchReportByImageDigest(
    digestId: string,
  ): Promise<ContainerReport> {
    const reportResponse = await this.retryRequest(() =>
      this.client.fetchReportByImageDigest(digestId),
    );

    this.logger.info(
      {
        digestId,
        malware: length(reportResponse.malware),
        findings: length(reportResponse.findings),
        unwantedPrograms: length(reportResponse.potentially_unwanted_programs),
      },
      'Fetched Tenable container report',
    );

    return reportResponse;
  }

  private async retryRequest<T>(request: () => Promise<TenableRepsonse<T>>) {
    let retryDelay = 0;

    return attempt.retry(
      async () => {
        retryDelay = 0;
        const response = await request();

        if (response.status === 429) {
          const serverRetryDelay = response.headers.get('retry-after');
          this.logger.info(
            { serverRetryDelay, url: response.url },
            'Received 429 response from endpoint; waiting to retry.',
          );
          if (serverRetryDelay) {
            retryDelay = Number.parseInt(serverRetryDelay, 10) * 1000;
          }
        }

        if (response.status >= 400) {
          let message: string | undefined;
          try {
            const errorBody: ErrorBody = await response.json();
            message = errorBody.message;
          } catch (e) {
            // pass
          }
          throw new IntegrationProviderAPIError({
            code: 'TenableClientApiError',
            message: message || `${response.statusText}: ${response.url}`,
            status: response.status,
            endpoint: response.url,
            statusText: message!,
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
              err,
              retryDelay,
              attemptNum: context.attemptNum,
              attemptsRemaining: context.attemptsRemaining,
            },
            'Encountered retryable API response. Retrying.',
          );
        },
      },
    );
  }
}
