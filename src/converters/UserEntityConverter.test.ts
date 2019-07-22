import { User } from "../tenable/types";
import { createUserEntities } from "./UserEntityConverter";

test("convert user entity", () => {
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

  const entities = createUserEntities(users);

  expect(entities).toEqual([
    {
      _class: "User",
      _key: "tenable_user_2",
      _type: "tenable_user",
      containerUuid: "a01249a3-3547-4961-9d5d-9c74d296169d",
      email: "denis.arkhireev@dualbootpartners.com",
      enabled: true,
      id: 2,
      lastlogin: 1555420696094,
      loginFailCount: 0,
      loginFailTotal: 0,
      name: "Denis Arkhireev",
      permissions: 64,
      type: "local",
      userName: "denis.arkhireev@dualbootpartners.com",
      username: "denis.arkhireev@dualbootpartners.com",
      uuid: "671e65d5-4101-4e97-8448-f86272407b46",
      uuidId: "671e65d5-4101-4e97-8448-f86272407b46",
    },
  ]);
});
