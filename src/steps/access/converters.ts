import {
  createIntegrationEntity,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { Entities, Relationships } from '../constants';
import { User } from '../../tenable/client';
import { Account } from '../../types';
import {
  generateEntityKey,
  generateRelationshipKey,
} from '../../utils/generateKey';

export function createUserEntity(user: User) {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _key: generateEntityKey(Entities.USER._type, user.id),
        _type: Entities.USER._type,
        _class: Entities.USER._class,
        id: user.id.toString(),
        uuid: user.uuid,
        userName: user.user_name,
        username: user.username,
        email: user.email,
        displayName: user.name,
        name: user.name,
        type: user.type,
        containerUuid: user.container_uuid,
        permissions: user.permissions,
        loginFailCount: user.login_fail_count,
        loginFailTotal: user.login_fail_total,
        enabled: user.enabled,
        lastlogin: user.lastlogin,
        uuidId: user.uuid_id,
      },
    },
  });
}

export function createAccountUserRelationship(
  account: Account,
  user: User,
): Relationship {
  const parentKey = generateEntityKey(Entities.ACCOUNT._type, account.id);
  const childKey = generateEntityKey(Entities.USER._type, user.id);
  const relationKey = generateRelationshipKey(
    parentKey,
    Relationships.ACCOUNT_HAS_USER._class,
    childKey,
  );

  const relationship: Relationship = {
    _class: Relationships.ACCOUNT_HAS_USER._class,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _type: Relationships.ACCOUNT_HAS_USER._type,
    _toEntityKey: childKey,
  };
  return relationship;
}
