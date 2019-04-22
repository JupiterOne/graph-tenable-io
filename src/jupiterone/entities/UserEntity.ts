import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export const USER_ENTITY_TYPE = "tenable_user";
export const USER_ENTITY_CLASS = "User";

export interface UserEntity extends EntityFromIntegration {
  id: number;
  uuid: string;
  userName: string;
  username: string;
  email: string;
  name: string;
  type: string;
  containerUuid: string;
  permissions: number;
  loginFailCount: number;
  loginFailTotal: number;
  enabled: boolean;
  lastlogin: number;
  uuidId: string;
}
