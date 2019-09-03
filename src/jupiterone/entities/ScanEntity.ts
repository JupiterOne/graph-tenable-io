import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export const SCAN_ENTITY_TYPE = "tenable_scan";
export const SCAN_ENTITY_CLASS = ["Assessment", "Service"];

export interface ScanEntity extends EntityFromIntegration {
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
