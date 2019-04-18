import {
  ASSET_ENTITY_TYPE,
  SCAN_ENTITY_TYPE,
  SCAN_HAS_ASSET_RELATIONSHIP_CLASS,
  SCAN_HAS_ASSET_RELATIONSHIP_TYPE,
  ScanAssetRelationship,
} from "../jupiterone/entities";
import { Asset, Scan, ScanDetail } from "../tenable";
import generateKey from "../utils/generateKey";

const defaultValue: ScanAssetRelationship[] = [];

export function createScanAssetRelationships(
  scans: Scan[],
  assets: Asset[],
): ScanAssetRelationship[] {
  const relationships: ScanAssetRelationship[] = scans.reduce((acc, scan) => {
    if (!scan.scanDetail) {
      return acc;
    }

    const relationshipsForOneScan = createRelationshipsForOneScan(
      scan.id,
      scan.scanDetail,
      assets,
    );

    return acc.concat(relationshipsForOneScan);
  }, defaultValue);

  return relationships;
}

function createRelationshipsForOneScan(
  scanId: number,
  scanDetail: ScanDetail,
  assets: Asset[],
) {
  const relationships = scanDetail.hosts.reduce((acc, host) => {
    const asset = findAsset(assets, host.hostname);

    if (!asset) {
      return acc;
    }

    const parentKey = generateKey(SCAN_ENTITY_TYPE, scanId);
    const childKey = generateKey(ASSET_ENTITY_TYPE, asset.id);
    const relationship: ScanAssetRelationship = {
      _class: SCAN_HAS_ASSET_RELATIONSHIP_CLASS,
      _type: SCAN_HAS_ASSET_RELATIONSHIP_TYPE,
      _fromEntityKey: parentKey,
      _key: `${parentKey}_has_${childKey}`,
      _toEntityKey: childKey,
    };
    return acc.concat(relationship);
  }, defaultValue);

  return relationships;
}

function findAsset(assets: Asset[], assetName: string) {
  return assets.find(asset => !!asset.fqdn.find(item => item === assetName));
}
