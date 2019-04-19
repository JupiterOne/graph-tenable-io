import {
  Container,
  ContainerVulnerability,
  Dictionary,
  Report,
  Scan,
  ScanDetail,
  TenableDataModel,
  WebAppVulnerability,
} from "../types";
import TenableClient from "./TenableClient";

export default async function fetchTenableData(
  client: TenableClient,
): Promise<TenableDataModel> {
  const [users, scans, assets, containers] = await Promise.all([
    client.fetchUsers(),
    client.fetchScans(),
    client.fetchAssets(),
    client.fetchContainers(),
  ]);

  const scansWithFullInfo: Scan[] = await fetchScansWithFullInfo(scans, client);

  const webAppVulnerabilities: Dictionary<
    WebAppVulnerability[]
  > = await fillWebAppVulnerabilities(scansWithFullInfo, client);

  const {
    reports,
    containerVulnerabilities,
  } = await fetchReportsWithContainerVulnerabilities(containers, client);

  return {
    users,
    scans: scansWithFullInfo,
    assets,
    webAppVulnerabilities,
    containers,
    reports,
    containerVulnerabilities,
  };
}

async function fetchScansWithFullInfo(
  scans: Scan[],
  client: TenableClient,
): Promise<Scan[]> {
  return await Promise.all(
    scans.map(async scan => {
      const fullScanInfo: ScanDetail = await client.fetchScanById(scan.id);
      return {
        ...scan,
        scanDetail: fullScanInfo,
      };
    }),
  );
}

async function fillWebAppVulnerabilities(
  scans: Scan[],
  client: TenableClient,
): Promise<Dictionary<WebAppVulnerability[]>> {
  const webAppVulnerabilities: Dictionary<WebAppVulnerability[]> = {};
  await scans.forEach(async scan => {
    if (!scan.scanDetail || !scan.scanDetail.hosts) {
      return;
    }
    await scan.scanDetail.hosts.forEach(async host => {
      const fetchedVulnerabilities = await client.fetchVulnerabilities(
        scan.id,
        host.host_id,
      );

      if (!webAppVulnerabilities[host.hostname]) {
        webAppVulnerabilities[host.hostname] = fetchedVulnerabilities;
        return;
      }

      webAppVulnerabilities[host.hostname] = webAppVulnerabilities[
        host.hostname
      ].concat(fetchedVulnerabilities);
      return;
    });
  });
  return webAppVulnerabilities;
}

async function fetchReportsWithContainerVulnerabilities(
  containers: Container[],
  client: TenableClient,
): Promise<{
  reports: Report[];
  containerVulnerabilities: Dictionary<ContainerVulnerability[]>;
}> {
  const containerVulnerabilities: Dictionary<ContainerVulnerability[]> = {};
  const reports: Report[] = await Promise.all(
    containers.map(async item => {
      const report: Report = await client.fetchReportByImageDigest(item.digest);

      if (!report.sha256) {
        return report;
      }

      if (!containerVulnerabilities[report.sha256]) {
        containerVulnerabilities[report.sha256] = [];
      }

      containerVulnerabilities[report.sha256] = containerVulnerabilities[
        report.sha256
      ].concat(report.malware);
      containerVulnerabilities[report.sha256] = containerVulnerabilities[
        report.sha256
      ].concat(report.findings);
      containerVulnerabilities[report.sha256] = containerVulnerabilities[
        report.sha256
      ].concat(report.potentially_unwanted_programs);

      return report;
    }),
  );
  return { reports, containerVulnerabilities };
}
