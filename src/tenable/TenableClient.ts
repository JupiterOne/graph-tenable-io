import { version as graphTenablePackageVersion } from '../../package.json';
import Client, {
  Agent,
  ContainerImage,
  ContainerRepository,
  ExportStatus,
  Scanner,
  TenableResponse,
} from './client';

import {
  IntegrationError,
  IntegrationLogger,
  IntegrationProviderAPIError,
} from '@jupiterone/integration-sdk-core';
import * as attempt from '@lifeomic/attempt';

import {
  AssetExport,
  AssetsExportStatusResponse,
  CancelExportResponse,
  ContainerReport,
  ErrorBody,
  ExportAssetsOptions,
  ExportAssetsResponse,
  ExportVulnerabilitiesOptions,
  ExportVulnerabilitiesResponse,
  User,
  VulnerabilitiesExportStatusResponse,
  VulnerabilityExport,
} from './client';
import { sleep } from '@lifeomic/attempt';
import pMap from 'p-map';
import { addMinutes, getUnixTime, isAfter, sub } from 'date-fns';
import { paginated } from '../utils/pagination';

function length(resources?: any[]): number {
  return resources ? resources.length : 0;
}

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

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
      product: 'graph-tenable-io',
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

  private async exportVulnerabilities(
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

  private async cancelVulnerabilitiesExport(
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

  private async fetchVulnerabilitiesExportStatus(
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

  private async fetchVulnerabilitiesExportChunk(
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

  public async iterateVulnerabilities(
    callback: (vuln: VulnerabilityExport) => void | Promise<void>,
    options?: {
      timeoutInMinutes?: number;
      exportVulnerabilitiesOptions?: ExportVulnerabilitiesOptions;
    },
  ) {
    const exportVulnerabilitiesOptions =
      options?.exportVulnerabilitiesOptions || {
        num_assets: 50,
        filters: {
          since: getUnixTime(sub(Date.now(), { days: 35 })),
          state: ['open', 'reopened', 'fixed'],
        },
      };
    const timeoutInMinutes = options?.timeoutInMinutes || 180;
    const { export_uuid: exportUuid } = await this.exportVulnerabilities(
      exportVulnerabilitiesOptions,
    );
    let { status, chunks_available: chunksAvailable } =
      await this.fetchVulnerabilitiesExportStatus(exportUuid);
    const timeLimit = addMinutes(Date.now(), timeoutInMinutes);
    while ([ExportStatus.Processing, ExportStatus.Queued].includes(status)) {
      if (isAfter(Date.now(), timeLimit)) {
        await this.cancelVulnerabilitiesExport(exportUuid);
        throw new IntegrationError({
          code: 'TenableClientApiError',
          message: `Vulnerability export ${exportUuid} failed to finish processing in time limit`,
        });
      }

      ({ status, chunks_available: chunksAvailable } =
        await this.fetchVulnerabilitiesExportStatus(exportUuid));
      await sleep(60_000); // Sleep 60 seconds between status checks.
    }

    await pMap(
      chunksAvailable,
      async (chunkId) => {
        const vulns = await this.fetchVulnerabilitiesExportChunk(
          exportUuid,
          chunkId,
        );
        for (const vuln of vulns) {
          await callback(vuln);
        }
      },
      { concurrency: 3 },
    );
    return { exportUuid };
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
    const timeoutInMinutes = options?.timeoutInMinutes || 180;
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
      await sleep(60_000); // Sleep 60 seconds between status checks.
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

  public async iterateContainerRepositories(
    callback: ResourceIteratee<ContainerRepository>,
  ) {
    await paginated(async (offset, limit) => {
      const {
        items,
        pagination: { total },
      } = await this.retryRequest(() =>
        this.client.fetchContainerRepositories(offset, limit),
      );

      for (const repository of items) {
        await callback(repository);
      }

      return total;
    });
  }

  public async iterateContainerImages(
    callback: ResourceIteratee<ContainerImage>,
  ) {
    await paginated(async (offset, limit) => {
      const {
        items,
        pagination: { total },
      } = await this.retryRequest(() =>
        this.client.fetchContainerImages(offset, limit),
      );

      for (const image of items) {
        const { repoName, name: imageName, tag } = image;
        const imageDetails = await this.retryRequest(() =>
          this.client.fetchContainerImageDetails(repoName, imageName, tag),
        );
        await callback({ ...image, ...imageDetails });
      }

      return total;
    });
  }

  public async fetchContainerImageReport(
    repo: string,
    image: string,
    tag: string,
  ): Promise<ContainerReport> {
    const reportResponse = await this.retryRequest(() =>
      this.client.fetchContainerImageReport(repo, image, tag),
    );

    this.logger.info(
      {
        repo,
        image,
        tag,
        malware: length(reportResponse.malware),
        findings: length(reportResponse.findings),
        unwantedPrograms: length(reportResponse.potentially_unwanted_programs),
      },
      'Fetched Tenable container report',
    );

    return reportResponse;
  }

  public async iterateScanners(callback: ResourceIteratee<Scanner>) {
    const { scanners } = await this.retryRequest(() =>
      this.client.fetchScanners(),
    );

    for (const scanner of scanners) {
      await callback(scanner);
    }
  }

  public async iterateAgents(
    scannerId: number,
    callback: ResourceIteratee<Agent>,
  ) {
    await paginated(async (offset, limit) => {
      const {
        agents,
        pagination: { total },
      } = await this.retryRequest(() =>
        this.client.fetchAgents(scannerId, offset, limit),
      );

      for (const agent of agents) {
        await callback(agent);
      }

      return total;
    });
  }

  private async retryRequest<T>(request: () => Promise<TenableResponse<T>>) {
    let retryDelay = 0;

    return attempt.retry(
      async () => {
        retryDelay = 3000;
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
          try {
            const errorBody: ErrorBody = await response.json();
            const message = errorBody.message;
            this.logger.info(
              { errMessage: message },
              'Encountered error from API',
            );
          } catch (e) {
            // pass
          }
          throw new IntegrationProviderAPIError({
            code: 'TenableClientApiError',
            status: response.status,
            endpoint: response.url,
            statusText: response.statusText,
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
          if (![429, 500, 502, 504].includes(err.status)) {
            context.abort();
            return;
          }
          if (err.status === 500 && context.attemptsRemaining > 2) {
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
