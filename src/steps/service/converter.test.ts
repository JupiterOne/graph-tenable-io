import { Entities } from '../constants';
import { Service } from '../../tenable/client';
import { Account } from '../../types';
import {
  createAccountServiceRelationship,
  createServiceEntity,
  getServiceKey,
} from './converters';

const service: Service = {
  name: 'Tenable Scanner',
};

test('convert service entity', () => {
  expect(createServiceEntity(service)).toEqual({
    _key: getServiceKey(service),
    _type: Entities.SERVICE._type,
    _class: Entities.SERVICE._class,
    _rawData: [{ name: 'default', rawData: service }],
    name: 'Tenable Scanner',
    displayName: 'Tenable Scanner',
    category: ['software', 'other'],
    function: ['SAST'],
  });
});

test('convert account service relationship', () => {
  const account: Account = {
    id: 'TestId',
    name: 'TestName',
  };

  const relationship = createAccountServiceRelationship(account, service);

  expect(relationship).toEqual({
    _class: 'PROVIDES',
    _fromEntityKey: 'tenable_account_TestId',
    _key: 'tenable_account_TestId|provides|tenable_scanner:Tenable Scanner',
    _toEntityKey: 'tenable_scanner:Tenable Scanner',
    _type: 'tenable_account_provides_scanner',
  });
});
