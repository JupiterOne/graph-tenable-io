import { AssetExportCache } from '.';
import TenableClient from './TenableClient';
import { AssetExport } from '@jupiterone/tenable-client-nodejs';

import { IntegrationLogger } from '@jupiterone/integration-sdk-core';

export async function createAssetExportCache(
  logger: IntegrationLogger,
  client: TenableClient,
): Promise<AssetExportCache> {
  const assetExports = await getAssetsUsingExport(client);
  const assetExportMap = new Map<string, AssetExport>();

  logger.info({ assetExports: assetExports.length }, 'Fetched asset exports');

  for (const assetExport of assetExports) {
    assetExportMap.set(assetExport.id, assetExport);
  }

  return {
    findAssetExportByUuid: (uuid: string): AssetExport | undefined =>
      assetExportMap.get(uuid),
  };
}

async function getAssetsUsingExport(client: TenableClient) {
  const assetExports: AssetExport[] = [];
  await client.iterateAssets((a) => {
    assetExports.push(a);
  });
  return assetExports;
}
