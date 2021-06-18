import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";
import { entities } from "../constants";
import { User } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";

interface UserEntity extends EntityFromIntegration {
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

export function createUserEntities(data: User[]): UserEntity[] {
  return data.map(user => {
    const userEntity: UserEntity = {
      _key: generateEntityKey(entities.USER._type, user.id),
      _type: entities.USER._type,
      _class: entities.USER._class,
      id: user.id,
      uuid: user.uuid,
      userName: user.user_name,
      username: user.username,
      email: user.email,
      name: user.name,
      type: user.type,
      containerUuid: user.container_uuid,
      permissions: user.permissions,
      loginFailCount: user.login_fail_count,
      loginFailTotal: user.login_fail_total,
      enabled: user.enabled,
      lastlogin: user.lastlogin,
      uuidId: user.uuid_id,
    };
    return userEntity;
  });
}
