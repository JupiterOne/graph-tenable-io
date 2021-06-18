import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";
import { entities } from "../constants";
import { RecentScanSummary } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";
import getEpochTimeInMilliseconds from "../utils/getEpochTimeInMilliseconds";

interface ScanEntity extends EntityFromIntegration {
  id: number;
  legacy: boolean;
  permissions: number;
  type: string;
  read: boolean;
  lastModificationDate: number;
  creationDate: number;
  status: string;
  uuid: string;
  shared: boolean;
  userPermissions: number;
  owner: string;
  scheduleUuid: string;
  timezone: string | undefined;
  rrules: string | undefined;
  starttime: string | undefined;
  enabled: boolean;
  control: boolean;
  name: string;
}

export function createScanEntity(data: RecentScanSummary): ScanEntity {
  return {
    _key: scanEntityKey(data.id),
    _type: entities.SCAN._type,
    _class: entities.SCAN._class,
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
  return generateEntityKey(entities.SCAN._type, scanId);
}
