import {
  ACCOUNT_CONTAINER_RELATIONSHIP_CLASS,
  ACCOUNT_CONTAINER_RELATIONSHIP_TYPE,
  ACCOUNT_ENTITY_TYPE,
  AccountContainerRelationship,
  CONTAINER_ENTITY_TYPE,
} from "../jupiterone/entities";
import { Account, Container } from "../types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";

export function createAccountContainerRelationships(
  account: Account,
  containers: Container[],
): AccountContainerRelationship[] {
  const relationships: AccountContainerRelationship[] = containers.map(
    container => {
      const parentKey = generateEntityKey(ACCOUNT_ENTITY_TYPE, account.id);
      const childKey = generateEntityKey(CONTAINER_ENTITY_TYPE, container.id);
      const relationKey = generateRelationshipKey(
        parentKey,
        ACCOUNT_CONTAINER_RELATIONSHIP_CLASS,
        childKey,
      );
      const relationship: AccountContainerRelationship = {
        _class: ACCOUNT_CONTAINER_RELATIONSHIP_CLASS,
        _type: ACCOUNT_CONTAINER_RELATIONSHIP_TYPE,
        _fromEntityKey: parentKey,
        _key: relationKey,
        _toEntityKey: childKey,
      };
      return relationship;
    },
  );
  return relationships;
}
