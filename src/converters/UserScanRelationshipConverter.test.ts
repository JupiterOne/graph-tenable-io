import { User } from "../tenable/types";
import { createUserScanRelationships } from "./UserScanRelationshipConverter";

const scans: any[] = [
  {
    legacy: false,
    permissions: 128,
    type: "webapp",
    read: true,
    last_modification_date: 1555068471,
    creation_date: 1555066123,
    status: "completed",
    uuid: "32c22094-3343-4163-a3ac-3863926b96e9",
    shared: false,
    user_permissions: 128,
    owner: "denis.arkhireev@dualbootpartners.com",
    schedule_uuid:
      "template-2a48d3bb-1cd9-28a1-7742-c26c40ac09f7591cd108d64699c9",
    timezone: null,
    rrules: null,
    starttime: null,
    enabled: false,
    control: true,
    name: ".com",
    id: 12,
  },
  {
    legacy: false,
    permissions: 128,
    type: "ps",
    read: true,
    last_modification_date: 1555330669,
    creation_date: 1555329315,
    status: "completed",
    uuid: "598df0a7-8ec1-478f-b0e4-a3762c8372db",
    shared: false,
    user_permissions: 128,
    owner: "denis.arkhireev@dualbootpartners.com",
    schedule_uuid:
      "template-68d391a6-dd92-e1e0-4a9c-28e61716080660877649d32f60e1",
    timezone: null,
    rrules: null,
    starttime: null,
    enabled: false,
    control: true,
    name: "basic network scan",
    id: 14,
  },
  {
    legacy: false,
    permissions: 128,
    type: "webapp",
    read: true,
    last_modification_date: 1555066639,
    creation_date: 1555066072,
    status: "completed",
    uuid: "00190df0-6f12-4a04-80d8-a46edc310489",
    shared: false,
    user_permissions: 128,
    owner: "denis.arkhireev@dualbootpartners.com",
    schedule_uuid:
      "template-8c0959e2-2cdc-09c0-75a1-e349542d27074153e142624b9fcc",
    timezone: null,
    rrules: null,
    starttime: null,
    enabled: false,
    control: true,
    name: ".ru",
    id: 10,
  },
];

const users: User[] = [
  {
    uuid: "671e65d5-4101-4e97-8448-f86272407b46",
    id: 2,
    user_name: "denis.arkhireev@dualbootpartners.com",
    username: "denis.arkhireev@dualbootpartners.com",
    email: "denis.arkhireev@dualbootpartners.com",
    name: "Denis Arkhireev",
    type: "local",
    container_uuid: "a01249a3-3547-4961-9d5d-9c74d296169d",
    permissions: 64,
    login_fail_count: 0,
    login_fail_total: 0,
    enabled: true,
    lastlogin: 1555420696094,
    uuid_id: "671e65d5-4101-4e97-8448-f86272407b46",
  },
];

describe("convert user assessment relationships", () => {
  test("convert user assessment relationships with all data", () => {
    const relationships = createUserScanRelationships(scans, users);
    expect(relationships).toEqual([
      {
        _class: "OWNS",
        _fromEntityKey: "tenable_user_2",
        _key: "tenable_user_2_owns_tenable_scan_12",
        _toEntityKey: "tenable_scan_12",
        _type: "tenable_user_owns_scan",
      },
      {
        _class: "OWNS",
        _fromEntityKey: "tenable_user_2",
        _key: "tenable_user_2_owns_tenable_scan_14",
        _toEntityKey: "tenable_scan_14",
        _type: "tenable_user_owns_scan",
      },
      {
        _class: "OWNS",
        _fromEntityKey: "tenable_user_2",
        _key: "tenable_user_2_owns_tenable_scan_10",
        _toEntityKey: "tenable_scan_10",
        _type: "tenable_user_owns_scan",
      },
    ]);
  });

  test("convert user assessment relationships without user", () => {
    const relationships = createUserScanRelationships(scans, []);
    expect(relationships).toEqual([]);
  });
});
