import { RelationshipFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";
import { entities, relationships } from "../constants";
import { Container } from "../tenable/types";
import { Account } from "../types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";

type AccountContainerRelationship = RelationshipFromIntegration;

export function createAccountContainerRelationships(
  account: Account,
  containers: Container[],
): AccountContainerRelationship[] {
  const accountContainerRelationships: AccountContainerRelationship[] = containers.map(
    container => {
      const parentKey = generateEntityKey(entities.ACCOUNT._type, account.id);
      const childKey = generateEntityKey(
        entities.CONTAINER._type,
        container.id,
      );
      const relationKey = generateRelationshipKey(
        parentKey,
        relationships.ACCOUNT_HAS_CONTAINER._class,
        childKey,
      );
      const relationship: AccountContainerRelationship = {
        _class: relationships.ACCOUNT_HAS_CONTAINER._class,
        _type: relationships.ACCOUNT_HAS_CONTAINER._type,
        _fromEntityKey: parentKey,
        _key: relationKey,
        _toEntityKey: childKey,
      };
      return relationship;
    },
  );
  return accountContainerRelationships;
}
