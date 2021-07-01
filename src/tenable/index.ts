import {
  AssetExport,
  VulnerabilityExport,
} from '@jupiterone/tenable-client-nodejs';

export * from './TenableClient';

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
