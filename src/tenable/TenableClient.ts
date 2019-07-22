import fetch, { RequestInit } from "node-fetch";
import {
  Asset,
  AssetsResponse,
  Container,
  ContainersResponse,
  Method,
  Report,
  ReportResponse,
  Scan,
  ScanDetail,
  ScanResponse,
  ScansResponse,
  ScanVulnerabilitiesResponse,
  ScanVulnerability,
  User,
  UsersResponse,
} from "./types";

export default class TenableClient {
  private readonly host: string = "https://cloud.tenable.com";
  private readonly accessToken: string;
  private readonly secretToken: string;

  constructor(accessToken: string, secretToken: string) {
    this.accessToken = accessToken;
    this.secretToken = secretToken;
  }

  public async fetchUsers(): Promise<User[]> {
    const usersResponse = await this.makeRequest<UsersResponse>(
      "/users",
      Method.GET,
      {},
    );
    return usersResponse.users;
  }

  public async fetchScans(): Promise<Scan[]> {
    const scansResponse = await this.makeRequest<ScansResponse>(
      "/scans",
      Method.GET,
      {},
    );
    return scansResponse.scans;
  }

  public async fetchScanDetail(scan: Scan): Promise<ScanDetail> {
    const scanResponse = await this.makeRequest<ScanResponse>(
      `/scans/${scan.id}`,
      Method.GET,
      {},
    );
    const { hosts, info, vulnerabilities } = scanResponse;
    return { ...scan, hosts: hosts || [], info, vulnerabilities };
  }

  public async fetchVulnerabilities(
    scanId: number,
    hostId: number,
  ): Promise<ScanVulnerability[]> {
    const vulnerabilitiesResponse = await this.makeRequest<
      ScanVulnerabilitiesResponse
    >(`/scans/${scanId}/hosts/${hostId}`, Method.GET, {});
    return vulnerabilitiesResponse.vulnerabilities;
  }

  public async fetchAssets(): Promise<Asset[]> {
    const assetsResponse = await this.makeRequest<AssetsResponse>(
      "/assets",
      Method.GET,
      {},
    );
    return assetsResponse.assets;
  }

  public async fetchContainers(): Promise<Container[]> {
    const containerResponse = await this.makeRequest<ContainersResponse>(
      "/container-security/api/v1/container/list",
      Method.GET,
      {},
    );
    return containerResponse;
  }

  public async fetchReportByImageDigest(digestId: string): Promise<Report> {
    const reportResponse = await this.makeRequest<ReportResponse>(
      `/container-security/api/v1/reports/by_image_digest?image_digest=${digestId}`,
      Method.GET,
      {},
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

    const response = await fetch(this.host + url, options);

    return response.json();
  }
}
