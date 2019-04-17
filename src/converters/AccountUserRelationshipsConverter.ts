import { Account, User } from "../tenable";

import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_USER_RELATIONSHIP_CLASS,
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  AccountUserRelationship,
  USER_ENTITY_TYPE,
} from "../jupiterone";

import generateKey from "../utils/generateKey";

export function createAccountUserRelationships(
  account: Account,
  users: User[],
) {
  const defaultValue: AccountUserRelationship[] = [];

  return users.reduce((acc, user) => {
    const parentKey = generateKey(ACCOUNT_ENTITY_TYPE, account.id);
    const childKey = generateKey(USER_ENTITY_TYPE, user.id);

    const relationship: AccountUserRelationship = {
      _class: ACCOUNT_USER_RELATIONSHIP_CLASS,
      _fromEntityKey: parentKey,
      _key: `${parentKey}_has_${childKey}`,
      _type: ACCOUNT_USER_RELATIONSHIP_TYPE,
      _toEntityKey: childKey,
    };

    return [...acc, relationship];
  }, defaultValue);
}
