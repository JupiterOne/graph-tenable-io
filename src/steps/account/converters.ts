import { Entities } from '../../constants';
import { Account } from '../../types';

import { generateEntityKey } from '../../utils/generateKey';

export function createAccountEntity(account: Account) {
  return {
    _class: Entities.ACCOUNT._class,
    _key: generateEntityKey(Entities.ACCOUNT._type, account.id),
    _type: Entities.ACCOUNT._type,
    displayName: account.name,
    name: account.name,
  };
}
