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
      fetchUsers: jest.fn().mockReturnValue([]),
      fetchScans: jest.fn().mockReturnValue([]),
      fetchAssets: jest.fn().mockReturnValue([]),
    },
    account: {
      id: "TestId",
      name: "TestName",
    },
  };

  (initializeContext as jest.Mock).mockReturnValue(executionContext);

  const invocationContext = {
    instance: {
      config: {},
    },
  } as IntegrationExecutionContext<IntegrationInvocationEvent>;
  await executionHandler(invocationContext);

  expect(initializeContext).toHaveBeenCalledWith(invocationContext);
  expect(executionContext.provider.fetchUsers).toHaveBeenCalledTimes(1);
  expect(executionContext.provider.fetchScans).toHaveBeenCalledTimes(1);
  expect(executionContext.provider.fetchAssets).toHaveBeenCalledTimes(1);
  expect(executionContext.persister.processEntities).toHaveBeenCalledTimes(5);
  expect(
    executionContext.persister.publishPersisterOperations,
  ).toHaveBeenCalledTimes(1);
});
