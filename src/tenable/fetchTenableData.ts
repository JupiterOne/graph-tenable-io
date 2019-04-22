import {
  Container,
  Dictionary,
  Finding,
  Malware,
  PotentiallyUnwantedProgram,
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
    malwares,
    findings,
    unwantedPrograms,
  } = await fetchReportsWithContainerVulnerabilities(containers, client);

  return {
    users,
    scans: scansWithFullInfo,
    assets,
    webAppVulnerabilities,
    containers,
    reports,
    malwares,
    findings,
    unwantedPrograms,
  };
}

async function fetchScansWithFullInfo(
  scans: Scan[],
  client: TenableClient,
): Promise<Scan[]> {
  const scansWithFullInfo = await Promise.all(
    scans.map(async scan => {
      const fullScanInfo: ScanDetail = await client.fetchScanById(scan.id);
      return {
        ...scan,
        scanDetail: fullScanInfo,
      };
    }),
  );
  return scansWithFullInfo;
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

      const vulnerabilityWithScanId = fetchedVulnerabilities.map(value => ({
        ...value,
        scan_id: scan.id,
      }));

      if (!webAppVulnerabilities[host.hostname]) {
        webAppVulnerabilities[host.hostname] = vulnerabilityWithScanId;
        return;
      }

      webAppVulnerabilities[host.hostname] = webAppVulnerabilities[
        host.hostname
      ].concat(vulnerabilityWithScanId);
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
  malwares: Dictionary<Malware[]>;
  findings: Dictionary<Finding[]>;
  unwantedPrograms: Dictionary<PotentiallyUnwantedProgram[]>;
}> {
  const malwares: Dictionary<Malware[]> = {};
  const findings: Dictionary<Finding[]> = {};
  const unwantedPrograms: Dictionary<PotentiallyUnwantedProgram[]> = {};
  const reports: Report[] = await Promise.all(
    containers.map(async item => {
      const report: Report = await client.fetchReportByImageDigest(item.digest);

      if (!report.sha256) {
        return report;
      }
      if (!malwares[report.sha256]) {
        malwares[report.sha256] = [];
      }
      if (!findings[report.sha256]) {
        findings[report.sha256] = [];
      }
      if (!unwantedPrograms[report.sha256]) {
        unwantedPrograms[report.sha256] = [];
      }

      malwares[report.sha256] = malwares[report.sha256].concat(report.malware);
      findings[report.sha256] = findings[report.sha256].concat(report.findings);
      unwantedPrograms[report.sha256] = unwantedPrograms[report.sha256].concat(
        report.potentially_unwanted_programs,
      );

      return report;
    }),
  );
  return { reports, malwares, findings, unwantedPrograms };
}
