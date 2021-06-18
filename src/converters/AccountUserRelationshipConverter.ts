import { RelationshipFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";
import { entities, relationships } from "../jupiterone";
import { User } from "../tenable/types";
import { Account } from "../types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";

type AccountUserRelationship = RelationshipFromIntegration;

export function createAccountUserRelationships(
  account: Account,
  users: User[],
): AccountUserRelationship[] {
  const defaultValue: AccountUserRelationship[] = [];

  return users.reduce((acc, user) => {
    const parentKey = generateEntityKey(entities.ACCOUNT._type, account.id);
    const childKey = generateEntityKey(entities.USER._type, user.id);
    const relationKey = generateRelationshipKey(
      parentKey,
      relationships.ACCOUNT_HAS_USER._class,
      childKey,
    );

    const relationship: AccountUserRelationship = {
      _class: relationships.ACCOUNT_HAS_USER._class,
      _fromEntityKey: parentKey,
      _key: relationKey,
      _type: relationships.ACCOUNT_HAS_USER._type,
      _toEntityKey: childKey,
    };

    return [...acc, relationship];
  }, defaultValue);
}
