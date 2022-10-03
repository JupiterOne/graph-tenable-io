import { generateRelationshipKey } from '@jupiterone/integration-sdk-core';
import { Entities, Relationships } from '../../constants';
import { Service } from '../../tenable/client';
import { Account } from '../../types';
import { generateEntityKey } from '../../utils/generateKey';

export function getServiceKey(service: Service) {
  return `tenable_scanner:${service.name}`;
}

export function createServiceEntity(service: Service) {
  return {
    _key: getServiceKey(service),
    _type: Entities.SERVICE._type,
    _class: Entities.SERVICE._class,
    _rawData: [{ name: 'default', rawData: service }],
    name: service.name,
    displayName: service.name,
    category: ['software', 'other'],
    function: ['SAST'],
  };
}

export function createAccountServiceRelationship(
  account: Account,
  service: Service,
) {
  const parentKey = generateEntityKey(Entities.ACCOUNT._type, account.id);
  const childKey = getServiceKey(service);

  const relationKey = generateRelationshipKey(
    Relationships.ACCOUNT_PROVIDES_SERVICE._class,
    parentKey,
    childKey,
  );

  const relationship = {
    _class: Relationships.ACCOUNT_PROVIDES_SERVICE._class,
    _type: Relationships.ACCOUNT_PROVIDES_SERVICE._type,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
  return relationship;
}
