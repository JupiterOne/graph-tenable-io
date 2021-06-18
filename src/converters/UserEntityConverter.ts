import { entities } from "../constants";
import { User } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";

export function createUserEntities(data: User[]) {
  return data.map(user => {
    const userEntity = {
      _key: generateEntityKey(entities.USER._type, user.id),
      _type: entities.USER._type,
      _class: entities.USER._class,
      id: user.id.toString(),
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
