import fetchTenableData from "./fetchTenableData";
import {
  AssetExport,
  AssetSummary,
  ScanHost,
  VulnerabilityExport,
} from "./types";

export * from "./TenableClient";

export { fetchTenableData };

export interface TenableAssetCache {
  /**
   * Finds the `AssetSummary` for the host, or `undefined` when not found.
   */
  findAsset: (host: ScanHost) => AssetSummary | undefined;
}

export interface AssetExportCache {
  findAssetExportByUuid: (uuid: string) => AssetExport | undefined;
}

export interface VulnerabilityExportCache {
  findVulnerabilitiesExportByAssetUuid: (
    uuid: string,
  ) => VulnerabilityExport[] | undefined;
}
