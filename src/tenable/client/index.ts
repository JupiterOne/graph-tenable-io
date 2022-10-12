import fetch, { RequestInit, Response as NodeFetchResponse } from 'node-fetch';
import { platform as osPlatform, release as osRelease } from 'os';
import { version as tenableClientNodejsBuildVersion } from '../../../package.json';

import {
  AssetExport,
  AssetsExportStatusResponse,
  AssetsResponse,
  AssetVulnerabilityResponse,
  CancelExportResponse,
  ContainerImageDetails,
  ContainerImagesResponse,
  ContainerRepositoryResponse,
  ExportAssetsOptions,
  ExportAssetsResponse,
  ExportVulnerabilitiesOptions,
  ExportVulnerabilitiesResponse,
  Method,
  RecentScanSummary,
  ReportResponse,
  ScanHostVulnerability,
  ScanResponse,
  ScansResponse,
  ScanVulnerabilitiesResponse,
  UserPermissionsResponse,
  UsersResponse,
  VulnerabilitiesExportStatusResponse,
  VulnerabilityExport,
} from './types';

export * from './types';

export interface TenableRepsonse<T> extends NodeFetchResponse {
  json(): Promise<T>;
}

export function buildUserAgentHeader(options: {
  vendor: string;
  product: string;
  build: string;
}) {
  const { vendor, product, build } = options;
  // Tenable encourages this particular user-agent format. See http://stevemcgrath.io/post/2019-11-07-integration-ua-string-standard/
  const tenableClientNodejsUserAgent = `@jupiterone/graph-tenable-io/${tenableClientNodejsBuildVersion} (@jupiterone/graph-tenable-io/${tenableClientNodejsBuildVersion}; Node.js/${
    process.version
  }; ${osPlatform()}/${osRelease})`;
  return `Integration/1.0 (${vendor}; ${product}; Build/${build}) ${tenableClientNodejsUserAgent}`;
}

export default class TenableClient {
  private readonly headers: RequestInit['headers'];

  constructor(options: {
    accessKey: string;
    secretKey: string;
    vendor: string;
    product: string;
    build: string;
  }) {
    const { accessKey, secretKey } = options;
    this.headers = {
      'Content-type': 'application/json',
      Accept: 'application/json',
      'Accept-encoding': 'identity',
      'X-ApiKeys': `accessKey=${accessKey}; secretKey=${secretKey};`,
      'User-Agent': buildUserAgentHeader(options),
    };
  }

  public async fetchUserPermissions() {
    return this.request<UserPermissionsResponse>('/session', Method.GET);
  }

  public async fetchUsers() {
    return this.request<UsersResponse>('/users', Method.GET);
  }

  public async fetchScans() {
    return this.request<ScansResponse>('/scans', Method.GET);
  }

  public async fetchScanDetail(scan: RecentScanSummary) {
    return this.request<ScanResponse>(`/scans/${scan.id}`, Method.GET);
  }

  public async fetchAssetVulnerabilityInfo(
    assetUuid: string,
    vulnerability: ScanHostVulnerability,
  ) {
    return this.request<AssetVulnerabilityResponse>(
      `/workbenches/assets/${assetUuid}/vulnerabilities/${vulnerability.plugin_id}/info`,
      Method.GET,
    );
  }

  public async exportVulnerabilities(options: ExportVulnerabilitiesOptions) {
    return this.request<ExportVulnerabilitiesResponse>(
      '/vulns/export',
      Method.POST,
      options,
    );
  }

  public async cancelVulnerabilitiesExport(exportUuid: string) {
    return await this.request<CancelExportResponse>(
      `/vulns/export/${exportUuid}/cancel`,
      Method.POST,
    );
  }

  public async fetchVulnerabilitiesExportStatus(exportUuid: string) {
    return this.request<VulnerabilitiesExportStatusResponse>(
      `/vulns/export/${exportUuid}/status`,
      Method.GET,
    );
  }

  public async fetchVulnerabilitiesExportChunk(
    exportUuid: string,
    chunkId: number,
  ) {
    return this.request<VulnerabilityExport[]>(
      `/vulns/export/${exportUuid}/chunks/${chunkId}`,
      Method.GET,
    );
  }

  public async exportAssets(options: ExportAssetsOptions) {
    return this.request<ExportAssetsResponse>(
      '/assets/export',
      Method.POST,
      options,
    );
  }

  public async cancelAssetExport(exportUuid: string) {
    return this.request<CancelExportResponse>(
      `/assets/export/${exportUuid}/cancel`,
      Method.POST,
      {},
    );
  }

  public async fetchAssetsExportStatus(exportUuid: string) {
    return this.request<AssetsExportStatusResponse>(
      `/assets/export/${exportUuid}/status`,
      Method.GET,
    );
  }

  public async fetchAssetsExportChunk(exportUuid: string, chunkId: number) {
    return this.request<AssetExport[]>(
      `/assets/export/${exportUuid}/chunks/${chunkId}`,
      Method.GET,
    );
  }

  public async fetchScanHostVulnerabilities(scanId: number, hostId: number) {
    return this.request<ScanVulnerabilitiesResponse>(
      `/scans/${scanId}/hosts/${hostId}`,
      Method.GET,
    );
  }

  public async fetchAssets() {
    return this.request<AssetsResponse>('/assets', Method.GET);
  }

  public async fetchContainerRepositories(offset: number, limit: number) {
    return this.request<ContainerRepositoryResponse>(
      `/container-security/api/v2/repositories?offset=${offset}&limit=${limit}`,
      Method.GET,
    );
  }

  public async fetchContainerImages(offset: number, limit: number) {
    return this.request<ContainerImagesResponse>(
      `/container-security/api/v2/images?offset=${offset}&limit=${limit}`,
      Method.GET,
    );
  }

  public async fetchContainerImageDetails(
    repo: string,
    image: string,
    tag: string,
  ) {
    return this.request<ContainerImageDetails>(
      `/container-security/api/v2/images/${repo}/${image}/${tag}`,
      Method.GET,
    );
  }

  public async fetchContainerImageReport(
    repo: string,
    image: string,
    tag: string,
  ) {
    return await this.request<ReportResponse>(
      `/container-security/api/v2/reports/${repo}/${image}/${tag}`,
      Method.GET,
    );
  }

  private async request<T>(
    url: string,
    method: Method,
    body?: {},
  ): Promise<TenableRepsonse<T>> {
    const requestOptions: RequestInit = {
      method,
      headers: this.headers,
    };
    if (body) {
      requestOptions.body = JSON.stringify(body);
    }
    return fetch('https://cloud.tenable.com' + url, requestOptions);
  }
}
