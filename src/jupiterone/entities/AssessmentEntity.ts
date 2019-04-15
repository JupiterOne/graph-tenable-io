import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export const ASSESSMENT_ENTITY_TYPE = "tenable_scan";
export const ASSESSMENT_ENTITY_CLASS = "Assessment";

export interface AssessmentEntity extends EntityFromIntegration {
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
  timezone: string;
  rrules: string;
  starttime: string;
  enabled: boolean;
  control: boolean;
  name: string;
}
