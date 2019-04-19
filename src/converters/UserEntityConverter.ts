import {
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  UserEntity,
} from "../jupiterone/entities";
import { User } from "../tenable";
import generateKey from "../utils/generateKey";

export function createUserEntities(data: User[]): UserEntity[] {
  return data.map(user => {
    const userEntity: UserEntity = {
      _key: generateKey(USER_ENTITY_TYPE, user.id),
      _type: USER_ENTITY_TYPE,
      _class: USER_ENTITY_CLASS,
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
