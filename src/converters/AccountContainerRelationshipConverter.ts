import {
  ACCOUNT_CONTAINER_RELATIONSHIP_CLASS,
  ACCOUNT_CONTAINER_RELATIONSHIP_TYPE,
  ACCOUNT_ENTITY_TYPE,
  AccountContainerRelationship,
  CONTAINER_ENTITY_TYPE,
} from "../jupiterone/entities";
import { Account, Container } from "../tenable";
import generateKey from "../utils/generateKey";

export function createAccountContainerRelationships(
  account: Account,
  containers: Container[],
): AccountContainerRelationship[] {
  const relationships: AccountContainerRelationship[] = containers.map(
    container => {
      const parentKey = generateKey(ACCOUNT_ENTITY_TYPE, account.id);
      const childKey = generateKey(CONTAINER_ENTITY_TYPE, container.id);
      const relationship: AccountContainerRelationship = {
        _class: ACCOUNT_CONTAINER_RELATIONSHIP_CLASS,
        _type: ACCOUNT_CONTAINER_RELATIONSHIP_TYPE,
        _fromEntityKey: parentKey,
        _key: `${parentKey}_has_${childKey}`,
        _toEntityKey: childKey,
      };
      return relationship;
    },
  );
  return relationships;
}
