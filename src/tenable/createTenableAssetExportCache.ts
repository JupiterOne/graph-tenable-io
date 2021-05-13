import { TenableAssetExportCache } from "./";
import TenableClient from "./TenableClient";
import { AssetExport, ExportAssetsOptions, ExportStatus } from "./types";

export default async function createTenableAssetExportCache(
  client: TenableClient,
): Promise<TenableAssetExportCache> {
  const options: ExportAssetsOptions = {
    chunk_size: 100,
  };
  const { export_uuid: exportUuid } = await client.exportAssets(options);
  let exportStatusResp = await client.fetchAssetsExportStatus(exportUuid);
  while (
    [ExportStatus.Processing, ExportStatus.Queued].includes(
      exportStatusResp.status,
    )
  ) {
    exportStatusResp = await client.fetchAssetsExportStatus(exportUuid);
  }

  const chunkReqs = exportStatusResp.chunks_available.map(chunkId => {
    return client.fetchAssetsExportChunk(exportUuid, chunkId);
  });
  const assetExports = await Promise.all(chunkReqs).then(responses =>
    responses.reduce((prev, cur) => {
      return prev.concat(cur);
    }, []),
  );

  const assetExportMap = new Map<string, AssetExport>();
  for (const assetExport of assetExports) {
    assetExportMap.set(assetExport.id, assetExport);
  }

  return {
    findAssetExportByUuid: (uuid: string): AssetExport | undefined =>
      assetExportMap.get(uuid),
  };
}
