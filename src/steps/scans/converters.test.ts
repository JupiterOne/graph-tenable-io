import { RecentScanSummary, ScanStatus, User } from '../../tenable/types';
import { createScanEntity, createUserScanRelationship } from './converters';

describe('createScanEntity', () => {
  test('converts all expected properties', () => {
    const scan = {
      legacy: false,
      folder_id: 10,
      type: 'webapp',
      read: false,
      last_modification_date: 1563469604,
      creation_date: 1563469024,
      status: 'completed',
      uuid: 'f8528b96-cb70-42cc-9211-183752c9ddf8',
      shared: true,
      permissions: 16,
      user_permissions: 64,
      owner: 'orgadmin@example.com',
      schedule_uuid:
        'template-13140847-98e1-871f-532e-e52ea73e16f3f942c2bd02ee4ff1',
      enabled: false,
      control: true,
      name: 'scan-name',
      id: 8,
    } as RecentScanSummary;

    expect(createScanEntity(scan)).toEqual({
      _class: ['Assessment', 'Service'],
      _key: 'tenable_scan_8',
      _type: 'tenable_scan',
      _rawData: [{ name: 'default', rawData: scan }],
      id: '8',
      legacy: false,
      permissions: 16,
      type: 'webapp',
      read: false,
      lastModificationDate: 1563469604000,
      creationDate: 1563469024000,
      status: 'completed',
      uuid: 'f8528b96-cb70-42cc-9211-183752c9ddf8',
      shared: true,
      userPermissions: 64,
      owner: 'orgadmin@example.com',
      scheduleUuid:
        'template-13140847-98e1-871f-532e-e52ea73e16f3f942c2bd02ee4ff1',
      timezone: undefined,
      rrules: undefined,
      starttime: undefined,
      enabled: false,
      control: true,
      name: 'scan-name',
    });
  });
});

describe('convert user assessment relationships', () => {
  const scan: RecentScanSummary = {
    legacy: false,
    permissions: 128,
    type: 'webapp',
    read: true,
    last_modification_date: 1555068471,
    creation_date: 1555066123,
    status: ScanStatus.Completed,
    uuid: '32c22094-3343-4163-a3ac-3863926b96e9',
    shared: false,
    user_permissions: 128,
    owner: 'denis.arkhireev@dualbootpartners.com',
    schedule_uuid:
      'template-2a48d3bb-1cd9-28a1-7742-c26c40ac09f7591cd108d64699c9',
    enabled: false,
    control: true,
    name: '.com',
    id: 12,
  };

  const user: User = {
    uuid: '671e65d5-4101-4e97-8448-f86272407b46',
    id: 2,
    user_name: 'denis.arkhireev@dualbootpartners.com',
    username: 'denis.arkhireev@dualbootpartners.com',
    email: 'denis.arkhireev@dualbootpartners.com',
    name: 'Denis Arkhireev',
    type: 'local',
    container_uuid: 'a01249a3-3547-4961-9d5d-9c74d296169d',
    permissions: 64,
    login_fail_count: 0,
    login_fail_total: 0,
    enabled: true,
    lastlogin: 1555420696094,
    uuid_id: '671e65d5-4101-4e97-8448-f86272407b46',
  };

  test('convert user assessment relationships with all data', () => {
    const relationships = createUserScanRelationship(user, scan);
    expect(relationships).toEqual({
      _class: 'OWNS',
      _fromEntityKey: 'tenable_user_2',
      _key: 'tenable_user_2_owns_tenable_scan_12',
      _toEntityKey: 'tenable_scan_12',
      _type: 'tenable_user_owns_scan',
    });
  });
});
