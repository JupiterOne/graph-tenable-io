import {
  ASSET_ENTITY_TYPE,
  SCAN_ENTITY_TYPE,
  SCAN_HAS_ASSET_RELATIONSHIP_CLASS,
  SCAN_HAS_ASSET_RELATIONSHIP_TYPE,
  ScanAssetRelationship,
} from "../jupiterone/entities";
import { Asset, ScanDetail } from "../tenable/types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";

const defaultValue: ScanAssetRelationship[] = [];

export function createScanAssetRelationships(
  scans: ScanDetail[],
  assets: Asset[],
): ScanAssetRelationship[] {
  const relationships: ScanAssetRelationship[] = scans.reduce((acc, scan) => {
    const hostRelationships = createScanHostAssetRelationships(scan, assets);

    return acc.concat(hostRelationships);
  }, defaultValue);

  return relationships;
}

function createScanHostAssetRelationships(
  scanDetail: ScanDetail,
  assets: Asset[],
): ScanAssetRelationship[] {
  const relationships = scanDetail.hosts.reduce((acc, host) => {
    const asset = findAsset(assets, host.hostname);

    if (!asset) {
      return acc;
    }

    const parentKey = generateEntityKey(SCAN_ENTITY_TYPE, scanDetail.id);
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
