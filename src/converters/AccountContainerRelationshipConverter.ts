import {
  ACCOUNT_CONTAINER_RELATIONSHIP_CLASS,
  ACCOUNT_CONTAINER_RELATIONSHIP_TYPE,
  AccountContainerRelationship,
  entities,
} from "../jupiterone/entities";
import { Container } from "../tenable/types";
import { Account } from "../types";
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
      const parentKey = generateEntityKey(entities.ACCOUNT._type, account.id);
      const childKey = generateEntityKey(
        entities.CONTAINER._type,
        container.id,
      );
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
