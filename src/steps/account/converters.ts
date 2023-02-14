import { createIntegrationEntity } from '@jupiterone/integration-sdk-core';
import { Entities } from '../constants';
import { Account } from '../../types';

import { generateEntityKey } from '../../utils/generateKey';

export function createAccountEntity(account: Account) {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _class: Entities.ACCOUNT._class,
        _key: generateEntityKey(Entities.ACCOUNT._type, account.id),
        _type: Entities.ACCOUNT._type,
        displayName: account.name,
        name: account.name,
      },
    },
  });
}
