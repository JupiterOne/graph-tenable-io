import { IntegrationError } from "@jupiterone/jupiter-managed-integration-sdk";

import { TenableAssetCache } from "./";
import TenableClient from "./TenableClient";
import { AssetSummary, ScanHost } from "./types";

export default async function createTenableAssetCache(
  client: TenableClient,
): Promise<TenableAssetCache> {
  const assets = await client.fetchAssets();
  return {
    findAsset: (host: ScanHost): AssetSummary => findHostAsset(assets, host),
  };
}

function findHostAsset(assets: AssetSummary[], host: ScanHost): AssetSummary {
  const asset = assets.find(e => {
    return (host.uuid && e.id === host.uuid) || e.fqdn.includes(host.hostname);
  });
  if (asset) {
    return asset;
  } else {
    // A match for the host could not be located in the collection of assets
    // provided by the client in it's current form. This asset cache may need to
    // be extended to search for an asset through the API instead of hoping to
    // find the asset in the max of 5000 assets returned without running a
    // query.
    /* istanbul ignore next */
    throw new IntegrationError(
      `Unexpected case of asset not found for scanned host: ${JSON.stringify(
        host,
      )}`,
    );
  }
}
