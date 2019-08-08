import {
  ASSET_ENTITY_TYPE,
  SCAN_ENTITY_TYPE,
  SCAN_HAS_ASSET_RELATIONSHIP_CLASS,
  SCAN_HAS_ASSET_RELATIONSHIP_TYPE,
  ScanAssetRelationship,
} from "../jupiterone/entities";
import { Asset, Host, Scan, ScanDetail } from "../tenable/types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";

export function createScanAssetRelationships(
  scans: ScanDetail[],
  assets: Asset[],
): ScanAssetRelationship[] {
  const relationships: ScanAssetRelationship[] = [];

  for (const scan of scans) {
    if (scan.hosts) {
      relationships.push(
        ...createScanHostAssetRelationships(scan, scan.hosts, assets),
      );
    }
  }

  return relationships;
}

function createScanHostAssetRelationships(
  scan: ScanDetail,
  hosts: Host[],
  assets: Asset[],
): ScanAssetRelationship[] {
  const relationships: ScanAssetRelationship[] = [];
  for (const host of hosts) {
    const asset = findAsset(assets, host.hostname);
    if (asset) {
      relationships.push(createScanHostAssetRelationship(scan, host, asset));
    }
  }
  return relationships;
}

function createScanHostAssetRelationship(scan: Scan, host: Host, asset: Asset) {
  const parentKey = generateEntityKey(SCAN_ENTITY_TYPE, scan.id);
  const childKey = generateEntityKey(ASSET_ENTITY_TYPE, asset.id);
  const relationKey = generateRelationshipKey(
    parentKey,
    SCAN_HAS_ASSET_RELATIONSHIP_CLASS,
    childKey,
  );

  return {
    _class: SCAN_HAS_ASSET_RELATIONSHIP_CLASS,
    _type: SCAN_HAS_ASSET_RELATIONSHIP_TYPE,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
}

function findAsset(assets: Asset[], assetName: string): Asset | undefined {
  return assets.find(asset => !!asset.fqdn.find(item => item === assetName));
}
