import TenableClient from "./TenableClient";
import {
  Container,
  ContainerFinding,
  ContainerMalware,
  ContainerUnwantedProgram,
  Dictionary,
  Report,
  Scan,
  ScanDetail,
  TenableDataModel,
  WebAppVulnerability,
} from "./types";

export default async function fetchTenableData(
  client: TenableClient,
): Promise<TenableDataModel> {
  const [users, scans, assets, containers] = await Promise.all([
    client.fetchUsers(),
    client.fetchScans(),
    client.fetchAssets(),
    client.fetchContainers(),
  ]);

  const scansWithDetails = await fetchScansWithDetails(scans, client);

  const webAppVulnerabilities: Dictionary<
    WebAppVulnerability[]
  > = await fillWebAppVulnerabilities(scansWithDetails, client);

  const {
    reports,
    malwares,
    findings,
    unwantedPrograms,
  } = await fetchReportsWithContainerVulnerabilities(containers, client);

  return {
    users,
    scans: scansWithDetails,
    assets,
    webAppVulnerabilities,
    containers,
    reports,
    malwares,
    findings,
    unwantedPrograms,
  };
}

async function fetchScansWithDetails(
  scans: Scan[],
  client: TenableClient,
): Promise<ScanDetail[]> {
  const scansWithDetails = await Promise.all(
    scans.map(scan => client.fetchScanDetail(scan)),
  );
  return scansWithDetails;
}

async function fillWebAppVulnerabilities(
  scans: ScanDetail[],
  client: TenableClient,
): Promise<Dictionary<WebAppVulnerability[]>> {
  const webAppVulnerabilities: Dictionary<WebAppVulnerability[]> = {};
  await scans.forEach(async scan => {
    await scan.hosts.forEach(async host => {
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
  malwares: Dictionary<ContainerMalware[]>;
  findings: Dictionary<ContainerFinding[]>;
  unwantedPrograms: Dictionary<ContainerUnwantedProgram[]>;
}> {
  const malwares: Dictionary<ContainerMalware[]> = {};
  const findings: Dictionary<ContainerFinding[]> = {};
  const unwantedPrograms: Dictionary<ContainerUnwantedProgram[]> = {};
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
