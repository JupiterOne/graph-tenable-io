import {
  APPLICATION_ENTITY_CLASS, APPLICATION_ENTITY_TYPE,
  ApplicationEntity,
} from "../jupiterone/entities";
import { Asset } from "../tenable";
import generateKey from "../utils/generateKey";

export function createApplicationEntities(data: Asset[]): ApplicationEntity[] {
  return data.map(item => {
    const applicationEntity: ApplicationEntity = {
      _key: generateKey(APPLICATION_ENTITY_TYPE, item.id),
      _type: APPLICATION_ENTITY_TYPE,
      _class: APPLICATION_ENTITY_CLASS,
      id: item.id,
      hasAgent: item.has_agent,
      lastSeen: item.last_seen,
      fqdn: item.fqdn.reduce((acc, value) => acc.concat(`, ${value}`)),
    };

    return applicationEntity;
  });
}
