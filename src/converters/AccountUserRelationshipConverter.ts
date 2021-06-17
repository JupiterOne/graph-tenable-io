import {
  ACCOUNT_USER_RELATIONSHIP_CLASS,
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  AccountUserRelationship,
  entities,
} from "../jupiterone";
import { User } from "../tenable/types";
import { Account } from "../types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";

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
      ACCOUNT_USER_RELATIONSHIP_CLASS,
      childKey,
    );

    const relationship: AccountUserRelationship = {
      _class: ACCOUNT_USER_RELATIONSHIP_CLASS,
      _fromEntityKey: parentKey,
      _key: relationKey,
      _type: ACCOUNT_USER_RELATIONSHIP_TYPE,
      _toEntityKey: childKey,
    };

    return [...acc, relationship];
  }, defaultValue);
}
