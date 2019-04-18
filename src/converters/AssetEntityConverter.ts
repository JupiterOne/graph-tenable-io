import {
  ASSET_ENTITY_CLASS,
  ASSET_ENTITY_TYPE,
  AssetEntity,
} from "../jupiterone/entities";
import { Asset } from "../tenable";
import generateKey from "../utils/generateKey";

export function createAssetEntities(data: Asset[]): AssetEntity[] {
  return data.map(item => {
    const applicationEntity: AssetEntity = {
      _key: generateKey(ASSET_ENTITY_TYPE, item.id),
      _type: ASSET_ENTITY_TYPE,
      _class: ASSET_ENTITY_CLASS,
      id: item.id,
      hasAgent: item.has_agent,
      lastSeen: item.last_seen,
      fqdn: item.fqdn.reduce((acc, value) => acc.concat(`, ${value}`)),
    };

    return applicationEntity;
  });
}
