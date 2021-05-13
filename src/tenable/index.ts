import fetchTenableData from "./fetchTenableData";
import { AssetExport, AssetSummary, ScanHost } from "./types";

export * from "./TenableClient";

export { fetchTenableData };

export interface TenableAssetCache {
  /**
   * Finds the `AssetSummary` for the host, or `undefined` when not found.
   */
  findAsset: (host: ScanHost) => AssetSummary | undefined;
}

export interface TenableAssetExportCache {
  findAssetExportByUuid: (uuid: string) => AssetExport | undefined;
}
