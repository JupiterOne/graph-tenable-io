import {
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk";
import executionHandler from "./executionHandler";
import initializeContext from "./initializeContext";

jest.mock("./initializeContext");

test("executionHandler", async () => {
  const executionContext: any = {
    graph: {
      findEntitiesByType: jest.fn().mockResolvedValue([]),
      findRelationshipsByType: jest.fn().mockResolvedValue([]),
    },
    persister: {
      processEntities: jest.fn().mockReturnValue([]),
      processRelationships: jest.fn().mockReturnValue([]),
      publishPersisterOperations: jest.fn().mockResolvedValue({}),
    },
    provider: {
      authenticate: jest.fn().mockReturnValue({}),
      fetchUsers: jest.fn().mockReturnValue([
        {
          activated_at: "2019-02-22T08:13:55.787Z",
          created_at: "2019-02-22T08:12:56.300Z",
          email: "first.user@user.local",
          username: null,
          firstname: "FirstName",
          group_id: null,
          id: 50504993,
          invalid_login_attempts: null,
          invitation_sent_at: "2019-02-22T08:12:56.268Z",
          last_login: "2019-02-25T08:04:08.748Z",
          lastname: "LastName",
          locked_until: null,
          comment: null,
          openid_name: "first.user",
          locale_code: null,
          preferred_locale_code: null,
          password_changed_at: "2019-02-22T08:13:55.945Z",
          phone: null,
          status: 1,
          updated_at: "2019-02-25T08:05:58.162Z",
          distinguished_name: null,
          external_id: null,
          directory_id: null,
          member_of: null,
          samaccountname: null,
          userprincipalname: null,
          manager_ad_id: null,
          manager_user_id: null,
          role_id: [252104],
          company: null,
          department: null,
          title: null,
          state: 1,
          trusted_idp_id: null,
        },
      ]),
      fetchGroups: jest.fn().mockReturnValue([]),
      fetchRoles: jest.fn().mockReturnValue([]),
      fetchApps: jest.fn().mockReturnValue([
        {
          id: 32491897,
          connector_id: 176,
          name: "Dropbox",
          extension: true,
          icon:
            "https://s3.amazonaws.com/onelogin-assets/images/icons/dropbox.png",
          visible: true,
          provisioning: true,
        },
      ]),
      fetchUserApps: jest.fn().mockReturnValue([]),
      fetchUserDevices: jest.fn().mockReturnValue([]),
    },
    account: {
      id: "",
      name: "",
    },
  };

  (initializeContext as jest.Mock).mockReturnValue(executionContext);

  const invocationContext = {
    instance: {
      config: {},
      id: "id",
      name: "name",
    },
  } as IntegrationExecutionContext<IntegrationInvocationEvent>;
  await executionHandler(invocationContext);

  expect(initializeContext).toHaveBeenCalledWith(invocationContext);
  expect(executionContext.provider.fetchUsers).toHaveBeenCalledTimes(1);
  expect(executionContext.provider.fetchGroups).toHaveBeenCalledTimes(1);
  expect(executionContext.provider.fetchGroups).toHaveBeenCalledTimes(1);
  expect(executionContext.provider.fetchApps).toHaveBeenCalledTimes(1);
  expect(executionContext.provider.fetchUserApps).toHaveBeenCalledTimes(1);
  expect(executionContext.persister.processEntities).toHaveBeenCalledTimes(9);
  expect(
    executionContext.persister.publishPersisterOperations,
  ).toHaveBeenCalledTimes(2);
});
