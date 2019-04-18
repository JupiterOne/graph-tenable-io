import TenableClient, {
  ContainerVulnerability,
  Dictionary,
  Report,
  Scan,
  ScanDetail,
  TenableDataModel,
  WebAppVulnerability,
} from "./TenableClient";

export default async function fetchTenableData(
  client: TenableClient,
): Promise<TenableDataModel> {
  const [users, scans, assets, containers] = await Promise.all([
    client.fetchUsers(),
    client.fetchScans(),
    client.fetchAssets(),
    client.fetchContainers(),
  ]);

  const webAppVulnerabilities: Dictionary<WebAppVulnerability[]> = {};
  const containerVulnerabilities: Dictionary<ContainerVulnerability[]> = {};

  const scansWithFullInfo: Scan[] = await Promise.all(
    scans.map(async scan => {
      const fullScanInfo: ScanDetail = await client.fetchScanById(scan.id);
      return {
        ...scan,
        scanDetail: fullScanInfo,
      };
    }),
  );

  await Promise.all(
    scansWithFullInfo.map(async scan => {
      if (!scan.scanDetail || !scan.scanDetail.hosts) {
        return;
      }
      await Promise.all(
        scan.scanDetail.hosts.map(async host => {
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
        }),
      );
    }),
  );

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
