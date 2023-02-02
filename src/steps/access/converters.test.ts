import { User } from '../../tenable/client';
import { Entities } from '../constants';
import { Account } from '../../types';
import { createAccountUserRelationship, createUserEntity } from './converters';

test('convert user entity', () => {
  const user: User = {
    uuid: '671e65d5-4101-4e97-8448-f86272407b46',
    id: 2,
    user_name: 'first.last@example.com',
    username: 'first.last@example.com',
    email: 'first.last@example.com',
    name: 'First Last',
    type: 'local',
    container_uuid: 'a01249a3-3547-4961-9d5d-9c74d296169d',
    permissions: 64,
    login_fail_count: 0,
    login_fail_total: 0,
    enabled: true,
    lastlogin: 1555420696094,
    uuid_id: '671e65d5-4101-4e97-8448-f86272407b46',
  };

  const userEntity = createUserEntity(user);

  expect(userEntity).toEqual({
    _class: Entities.USER._class,
    _key: 'tenable_user_2',
    _type: Entities.USER._type,
    containerUuid: 'a01249a3-3547-4961-9d5d-9c74d296169d',
    displayName: 'First Last',
    email: 'first.last@example.com',
    enabled: true,
    id: '2',
    lastlogin: 1555420696094,
    loginFailCount: 0,
    loginFailTotal: 0,
    name: 'First Last',
    permissions: 64,
    type: 'local',
    userName: 'first.last@example.com',
    username: 'first.last@example.com',
    uuid: '671e65d5-4101-4e97-8448-f86272407b46',
    uuidId: '671e65d5-4101-4e97-8448-f86272407b46',
    active: true,
    createdOn: undefined,
    _rawData: [
      {
        name: 'default',
        rawData: {
          container_uuid: 'a01249a3-3547-4961-9d5d-9c74d296169d',
          email: 'first.last@example.com',
          enabled: true,
          id: 2,
          lastlogin: 1555420696094,
          login_fail_count: 0,
          login_fail_total: 0,
          name: 'First Last',
          permissions: 64,
          type: 'local',
          user_name: 'first.last@example.com',
          username: 'first.last@example.com',
          uuid: '671e65d5-4101-4e97-8448-f86272407b46',
          uuid_id: '671e65d5-4101-4e97-8448-f86272407b46',
        },
      },
    ],
  });
});

test('convert account user relationships', () => {
  const account: Account = {
    id: 'TestId',
    name: 'TestName',
  };

  const user: User = {
    uuid: '671e65d5-4101-4e97-8448-f86272407b46',
    id: 2,
    user_name: 'first.last@example.com',
    username: 'first.last@example.com',
    email: 'first.last@example.com',
    name: 'First Last',
    type: 'local',
    container_uuid: 'a01249a3-3547-4961-9d5d-9c74d296169d',
    permissions: 64,
    login_fail_count: 0,
    login_fail_total: 0,
    enabled: true,
    lastlogin: 1555420696094,
    uuid_id: '671e65d5-4101-4e97-8448-f86272407b46',
  };

  const relationships = createAccountUserRelationship(account, user);

  expect(relationships).toEqual({
    _class: 'HAS',
    _fromEntityKey: 'tenable_account_TestId',
    _key: 'tenable_account_TestId_has_tenable_user_2',
    _toEntityKey: 'tenable_user_2',
    _type: 'tenable_account_has_user',
  });
});
