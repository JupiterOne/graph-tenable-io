import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";
import { readFileSync } from "fs";
import initializeContext from "../initializeContext";
import fetchTenableData from "../tenable/fetchTenableData";
import { convert } from "./publishChanges";

function readFixture(fixtureName: string) {
  const raw = readFileSync(`${__dirname}/../../test/fixtures/${fixtureName}`);
  return JSON.parse(raw.toString());
}
const apiMocks = [
  {
    url: "/api/1/apps",
    name: "apps.json",
  },
  {
    url: "/api/1/users/50504993/apps",
    name: "personal_apps_50504993.json",
  },
  {
    url: "/api/1/users/50505384/apps",
    name: "personal_apps_50505384.json",
  },
  {
    url: "/api/1/users/50504993/otp_devices",
    name: "personal_devices_50504993.json",
  },
  {
    url: "/api/1/users/50505384/otp_devices",
    name: "personal_devices_50505384.json",
  },
  {
    url: "/api/1/roles",
    name: "roles.json",
  },
  {
    url: "/api/1/groups",
    name: "groups.json",
  },
  {
    url: "/api/1/users",
    name: "users.json",
  },
  {
    url: "/auth/oauth2/token",
    name: "token.json",
  },
];

jest.mock("node-fetch", () => {
  return jest.fn().mockImplementation((url: string) => {
    const fixture = apiMocks.find(mock => url.match(mock.url) !== null);

    return {
      json() {
        if (fixture) {
          return readFixture(fixture.name);
        }

        return {};
      },
    };
  });
});

test("convert", async () => {
  const options = {
    instance: {
      config: {
        clientId: "fakeClientId",
        clientSecret: "fakeClientSecret",
      },
      id: "account_xxx",
      name: "test-name",
    },
  };

  const context = createTestIntegrationExecutionContext(options);
  const { provider } = await initializeContext(context);

  const tenableData = await fetchTenableData(provider);
  const newData = convert(tenableData);

  expect(newData).toEqual(readFixture("result.json"));
});
