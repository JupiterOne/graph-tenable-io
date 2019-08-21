import fetchTenableData from "./fetchTenableData";
import { AssetSummary, ScanHost } from "./types";

export * from "./TenableClient";

export { fetchTenableData };

export interface TenableAssetCache {
  /**
   * Finds the `AssetSummary` for the host or throws `IntegrationError` when it
   * cannot be found to expose a problem in the integration.
   */
  findAsset: (host: ScanHost) => AssetSummary;
}
