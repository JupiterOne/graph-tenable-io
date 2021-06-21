import { Relationship } from '@jupiterone/integration-sdk-core';
import { entities, relationships } from '../../constants';
import { RecentScanSummary, User } from '../../tenable/types';
import { generateEntityKey } from '../../utils/generateKey';
import getEpochTimeInMilliseconds from '../../utils/getEpochTimeInMilliseconds';

export function createScanEntity(data: RecentScanSummary) {
  return {
    _key: scanEntityKey(data.id),
    _type: entities.SCAN._type,
    _class: entities.SCAN._class,
    _rawData: [{ name: 'default', rawData: data }],
    id: data.id.toString(),
    legacy: data.legacy,
    permissions: data.permissions,
    type: data.type,
    read: data.read,
    lastModificationDate: getEpochTimeInMilliseconds(
      data.last_modification_date,
    ), // todo use parseTimePropertyValue
    creationDate: getEpochTimeInMilliseconds(data.creation_date), // todo use parseTimePropertyValue
    status: data.status,
    uuid: data.uuid,
    shared: data.shared,
    userPermissions: data.user_permissions,
    owner: data.owner,
    scheduleUuid: data.schedule_uuid,
    timezone: data.timezone,
    rrules: data.rrules,
    starttime: data.starttime,
    enabled: data.enabled,
    control: data.control,
    name: data.name,
  };
}

export function scanEntityKey(scanId: number): string {
  return generateEntityKey(entities.SCAN._type, scanId);
}

export function createUserScanRelationship(
  user: User,
  scan: RecentScanSummary,
): Relationship {
  const parentKey = generateEntityKey(entities.USER._type, user.id);
  const childKey = generateEntityKey(entities.SCAN._type, scan.id);
  const relationship: Relationship = {
    _class: relationships.USER_OWNS_SCAN._class,
    _type: relationships.USER_OWNS_SCAN._type,
    _fromEntityKey: parentKey,
    _key: `${parentKey}_owns_${childKey}`,
    _toEntityKey: childKey,
  };
  return relationship;
}
