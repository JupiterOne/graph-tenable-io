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

  await Promise.all(scansWithFullInfo.map(async scan => {
      if (!scan.scanDetail) {
        return;
      }
      await Promise.all(scan.scanDetail.hosts.map(async host => {
          vulnerabilities[host.hostname] = await client.fetchVulnerabilities(
            scan.id,
            host.host_id,
          );
        })
      );
    })
  );

  console.warn(vulnerabilities["dualboot.ru"]);

  return { users, scans: scansWithFullInfo, assets, vulnerabilities };
}
