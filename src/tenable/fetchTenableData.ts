import TenableClient, {
  Dictionary,
  Scan,
  ScanDetail,
  TenableDataModel,
  Vulnerability,
} from "./TenableClient";

export default async function fetchTenableData(
  client: TenableClient,
): Promise<TenableDataModel> {
  const [users, scans, assets] = await Promise.all([
    client.fetchUsers(),
    client.fetchScans(),
    client.fetchAssets(),
  ]);

  const scansWithFullInfo: Scan[] = await Promise.all(
    scans.map(async scan => {
      const fullScanInfo: ScanDetail = await client.fetchScanById(scan.id);
      return {
        ...scan,
        scanDetail: fullScanInfo,
      };
    }),
  );

  const vulnerabilities: Dictionary<Vulnerability[]> = {};

  await Promise.all(
    scansWithFullInfo.map(async scan => {
      if (!scan.scanDetail) {
        return;
      }
      await Promise.all(
        scan.scanDetail.hosts.map(async host => {
          const fetchedVulnerabilities = await client.fetchVulnerabilities(
            scan.id,
            host.host_id,
          );
          if (!vulnerabilities[host.hostname]) {
            vulnerabilities[host.hostname] = fetchedVulnerabilities;
            return;
          }
          vulnerabilities[host.hostname].concat(fetchedVulnerabilities);
          return;
        }),
      );
    }),
  );

  return { users, scans: scansWithFullInfo, assets, vulnerabilities };
}
