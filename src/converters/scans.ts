import {
  SCAN_ENTITY_CLASS,
  SCAN_ENTITY_TYPE,
  ScanEntity,
} from "../jupiterone/entities";
import { RecentScanSummary } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";
import getEpochTimeInMilliseconds from "../utils/getEpochTimeInMilliseconds";

export function createScanEntity(data: RecentScanSummary): ScanEntity {
  return {
    _key: scanEntityKey(data.id),
    _type: SCAN_ENTITY_TYPE,
    _class: SCAN_ENTITY_CLASS,
    _rawData: [{ name: "default", rawData: data }],
    id: data.id,
    legacy: data.legacy,
    permissions: data.permissions,
    type: data.type,
    read: data.read,
    lastModificationDate: getEpochTimeInMilliseconds(
      data.last_modification_date,
    ),
    creationDate: getEpochTimeInMilliseconds(data.creation_date),
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
  return generateEntityKey(SCAN_ENTITY_TYPE, scanId);
}
