import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";
import { entities } from "../constants";
import { Account } from "../types";

import { generateEntityKey } from "../utils/generateKey";

interface AccountEntity extends EntityFromIntegration {
  name: string;
}
export function createAccountEntity(account: Account): AccountEntity {
  return {
    _class: entities.ACCOUNT._class,
    _key: generateEntityKey(entities.ACCOUNT._type, account.id),
    _type: entities.ACCOUNT._type,
    displayName: account.name,
    name: account.name,
  };
}
