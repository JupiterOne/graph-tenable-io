import { ScanEntity } from "../jupiterone";
import { RecentScanSummary } from "../tenable/types";
import { createScanEntity } from "./scans";

describe("createScanEntity", () => {
  test("converts all expected properties", () => {
    const scan = {
      legacy: false,
      folder_id: 10,
      type: "webapp",
      read: false,
      last_modification_date: 1563469604,
      creation_date: 1563469024,
      status: "completed",
      uuid: "f8528b96-cb70-42cc-9211-183752c9ddf8",
      shared: true,
      permissions: 16,
      user_permissions: 64,
      owner: "orgadmin@example.com",
      schedule_uuid:
        "template-13140847-98e1-871f-532e-e52ea73e16f3f942c2bd02ee4ff1",
      enabled: false,
      control: true,
      name: "scan-name",
      id: 8,
    } as RecentScanSummary;

    expect(createScanEntity(scan)).toEqual({
      _class: ["Assessment", "Service"],
      _key: "tenable_scan_8",
      _type: "tenable_scan",
      _rawData: [{ name: "default", rawData: scan }],
      id: 8,
      legacy: false,
      permissions: 16,
      type: "webapp",
      read: false,
      lastModificationDate: 1563469604000,
      creationDate: 1563469024000,
      status: "completed",
      uuid: "f8528b96-cb70-42cc-9211-183752c9ddf8",
      shared: true,
      userPermissions: 64,
      owner: "orgadmin@example.com",
      scheduleUuid:
        "template-13140847-98e1-871f-532e-e52ea73e16f3f942c2bd02ee4ff1",
      timezone: undefined,
      rrules: undefined,
      starttime: undefined,
      enabled: false,
      control: true,
      name: "scan-name",
    } as ScanEntity);
  });
});
