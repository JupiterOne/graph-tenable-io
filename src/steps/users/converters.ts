import { Relationship } from '@jupiterone/integration-sdk-core';
import { entities, relationships } from '../../constants';
import { User } from '../../tenable/types';
import { Account } from '../../types';
import {
  generateEntityKey,
  generateRelationshipKey,
} from '../../utils/generateKey';

export function createUserEntity(user: User) {
  return {
    _key: generateEntityKey(entities.USER._type, user.id),
    _type: entities.USER._type,
    _class: entities.USER._class,
    id: user.id.toString(),
    uuid: user.uuid,
    userName: user.user_name,
    username: user.username,
    email: user.email,
    name: user.name,
    type: user.type,
    containerUuid: user.container_uuid,
    permissions: user.permissions,
    loginFailCount: user.login_fail_count,
    loginFailTotal: user.login_fail_total,
    enabled: user.enabled,
    lastlogin: user.lastlogin,
    uuidId: user.uuid_id,
  };
}

export function createAccountUserRelationship(
  account: Account,
  user: User,
): Relationship {
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
  return relationship;
}
