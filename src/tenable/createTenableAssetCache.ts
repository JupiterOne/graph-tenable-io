import { TenableAssetCache } from "./";
import TenableClient from "./TenableClient";
import { AssetSummary, ScanHost } from "./types";

export default async function createTenableAssetCache(
  client: TenableClient,
): Promise<TenableAssetCache> {
  const assets = await client.fetchAssets();
  return {
    /**
     * Finds the `AssetSummary` for the host, or `undefined` when not found.
     *
     * NOTE: This asset cache may need to be extended to search for an asset
     * through the API instead of hoping to find the asset in the max of 5000
     * assets returned without running a query.
     */
    findAsset: (host: ScanHost): AssetSummary | undefined =>
      findHostAsset(assets, host),
  };
}

function findHostAsset(
  assets: AssetSummary[],
  host: ScanHost,
): AssetSummary | undefined {
  return assets.find(e => {
    return (host.uuid && e.id === host.uuid) || e.fqdn.includes(host.hostname);
  });
}
