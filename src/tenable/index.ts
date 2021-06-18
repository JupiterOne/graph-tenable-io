import { AssetExport, VulnerabilityExport } from "./types";

export * from "./TenableClient";

export interface AssetExportCache {
  findAssetExportByUuid: (uuid: string) => AssetExport | undefined;
}

export interface VulnerabilityExportCache {
  findVulnerabilitiesExportByAssetUuid: (
    uuid: string,
  ) => VulnerabilityExport[] | undefined;
  findVulnerabilityExportByAssetPluginUuid: (
    assetUuid: string,
    pluginId: number,
  ) => VulnerabilityExport | undefined;
}
