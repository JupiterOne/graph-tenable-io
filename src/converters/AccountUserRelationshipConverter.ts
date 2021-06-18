import { Relationship } from "@jupiterone/integration-sdk-core";
import { entities, relationships } from "../constants";
import { User } from "../tenable/types";
import { Account } from "../types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";

export function createAccountUserRelationships(
  account: Account,
  users: User[],
) {
  const defaultValue: Relationship[] = [];

  return users.reduce((acc, user) => {
    const parentKey = generateEntityKey(entities.ACCOUNT._type, account.id);
    const childKey = generateEntityKey(entities.USER._type, user.id);
    const relationKey = generateRelationshipKey(
      parentKey,
      relationships.ACCOUNT_HAS_USER._class,
      childKey,
    );

    const relationship: Relationship = {
      _class: relationships.ACCOUNT_HAS_USER._class,
      _fromEntityKey: parentKey,
      _key: relationKey,
      _type: relationships.ACCOUNT_HAS_USER._type,
      _toEntityKey: childKey,
    };

    return [...acc, relationship];
  }, defaultValue);
}
