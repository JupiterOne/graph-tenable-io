import {
  ASSET_ENTITY_TYPE,
  SCAN_ENTITY_TYPE,
  SCAN_HAS_ASSET_RELATIONSHIP_CLASS,
  SCAN_HAS_ASSET_RELATIONSHIP_TYPE,
  ScanAssetRelationship,
} from "../jupiterone/entities";
import { Asset, Scan, ScanDetail } from "../types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";

const defaultValue: ScanAssetRelationship[] = [];

export function createScanAssetRelationships(
  scans: Scan[],
  assets: Asset[],
): ScanAssetRelationship[] {
  const relationships: ScanAssetRelationship[] = scans.reduce((acc, scan) => {
    if (isHost(scan)) {
      return acc;
    }

    const relationshipsForOneScan = createRelationshipsForOneScan(
      scan.id,
      scan.scanDetail!,
      assets,
    );

    return acc.concat(relationshipsForOneScan);
  }, defaultValue);

  return relationships;
}

function isHost(scan: Scan) {
  return !(scan.scanDetail && scan.scanDetail.hosts);
}

function createRelationshipsForOneScan(
  scanId: number,
  scanDetail: ScanDetail,
  assets: Asset[],
): ScanAssetRelationship[] {
  const relationships = scanDetail.hosts.reduce((acc, host) => {
    const asset = findAsset(assets, host.hostname);

    if (!asset) {
      return acc;
    }

    const parentKey = generateEntityKey(SCAN_ENTITY_TYPE, scanId);
    const childKey = generateEntityKey(ASSET_ENTITY_TYPE, asset.id);
    const relationKey = generateRelationshipKey(
      parentKey,
      SCAN_HAS_ASSET_RELATIONSHIP_CLASS,
      childKey,
    );

    const relationship: ScanAssetRelationship = {
      _class: SCAN_HAS_ASSET_RELATIONSHIP_CLASS,
      _type: SCAN_HAS_ASSET_RELATIONSHIP_TYPE,
      _fromEntityKey: parentKey,
      _key: relationKey,
      _toEntityKey: childKey,
    };
    return acc.concat(relationship);
  }, defaultValue);

  return relationships;
}

function findAsset(assets: Asset[], assetName: string): Asset | undefined {
  return assets.find(asset => !!asset.fqdn.find(item => item === assetName));
}
