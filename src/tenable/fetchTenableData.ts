import TenableClient from "./TenableClient";
import {
  Container,
  ContainerFinding,
  ContainerMalware,
  ContainerReport,
  ContainerUnwantedProgram,
  Dictionary,
  Scan,
  ScanDetail,
  ScanVulnerability,
  TenableDataModel,
} from "./types";

export default async function fetchTenableData(
  client: TenableClient,
): Promise<TenableDataModel> {
  const [users, scanSummaries, assets, containers] = await Promise.all([
    client.fetchUsers(),
    client.fetchScans(),
    client.fetchAssets(),
    client.fetchContainers(),
  ]);

  const scans = await fetchScanDetails(scanSummaries, client);

  const scanVulnerabilities: Dictionary<
    ScanVulnerability[]
  > = await fetchScanVulnerabilities(scans, client);

  const {
    reports: containerReports,
    malwares: containerMalwares,
    findings: containerFindings,
    unwantedPrograms: containerUnwantedPrograms,
  } = await fetchReportsWithContainerVulnerabilities(containers, client);

  return {
    users,
    scans,
    assets,
    scanVulnerabilities,
    containers,
    containerReports,
    containerMalwares,
    containerFindings,
    containerUnwantedPrograms,
  };
}

async function fetchScanDetails(
  scans: Scan[],
  client: TenableClient,
): Promise<ScanDetail[]> {
  return Promise.all(scans.map(scan => client.fetchScanDetail(scan)));
}

async function fetchScanVulnerabilities(
  scans: ScanDetail[],
  client: TenableClient,
): Promise<Dictionary<ScanVulnerability[]>> {
  const scanVulnerabilities: Dictionary<ScanVulnerability[]> = {};
  const hostFetches = [];

  for (const scan of scans) {
    for (const host of scan.hosts) {
      hostFetches.push(
        (async () => {
          let vulnerabilitiesWithScanId = scanVulnerabilities[host.hostname];
          if (!vulnerabilitiesWithScanId) {
            vulnerabilitiesWithScanId = [];
            scanVulnerabilities[host.hostname] = vulnerabilitiesWithScanId;
          }

          const fetchedVulnerabilities = await client.fetchVulnerabilities(
            scan.id,
            host.host_id,
          );

          vulnerabilitiesWithScanId.push(
            ...fetchedVulnerabilities.map(value => ({
              ...value,
              scan_id: scan.id,
            })),
          );
        })(),
      );
    }
  }

  await Promise.all(hostFetches);

  return scanVulnerabilities;
}

async function fetchReportsWithContainerVulnerabilities(
  containers: Container[],
  client: TenableClient,
): Promise<{
  reports: ContainerReport[];
  malwares: Dictionary<ContainerMalware[]>;
  findings: Dictionary<ContainerFinding[]>;
  unwantedPrograms: Dictionary<ContainerUnwantedProgram[]>;
}> {
  const malwares: Dictionary<ContainerMalware[]> = {};
  const findings: Dictionary<ContainerFinding[]> = {};
  const unwantedPrograms: Dictionary<ContainerUnwantedProgram[]> = {};
  const reports: ContainerReport[] = await Promise.all(
    containers.map(async item => {
      const report: ContainerReport = await client.fetchReportByImageDigest(
        item.digest,
      );

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
