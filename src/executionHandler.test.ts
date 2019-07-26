import {
  IntegrationActionName,
  IntegrationExecutionContext,
} from "@jupiterone/jupiter-managed-integration-sdk";

import executionHandler from "./executionHandler";
import initializeContext from "./initializeContext";

jest.mock("./initializeContext");

const executionContext: any = {
  graph: {
    findEntitiesByType: jest.fn().mockResolvedValue([]),
    findRelationshipsByType: jest.fn().mockResolvedValue([]),
  },
  persister: {
    processEntities: jest.fn().mockReturnValue([]),
    processRelationships: jest.fn().mockReturnValue([]),
    publishEntityOperations: jest.fn().mockResolvedValue({}),
    publishPersisterOperations: jest.fn().mockResolvedValue({}),
  },
  provider: {
    fetchUsers: jest.fn().mockReturnValue([]),
    fetchScans: jest.fn().mockReturnValue([]),
    fetchAssets: jest.fn().mockReturnValue([]),
    fetchScanDetail: jest.fn().mockReturnValue({}),
    fetchContainers: jest.fn().mockReturnValue([]),
    fetchReportByImageDigest: jest.fn().mockReturnValue({}),
  },
  account: {
    id: "TestId",
    name: "TestName",
  },
  logger: {
    info: jest.fn(),
  },
};

(initializeContext as jest.Mock).mockReturnValue(executionContext);

test("executionHandler INGEST action", async () => {
  const invocationContext = {
    instance: {
      config: {},
    },
    event: {
      action: {
        name: IntegrationActionName.INGEST,
      },
    },
  } as IntegrationExecutionContext;
  await executionHandler(invocationContext);

  expect(initializeContext).toHaveBeenCalledWith(invocationContext);
  expect(executionContext.provider.fetchUsers).toHaveBeenCalledTimes(1);
  expect(executionContext.provider.fetchScans).toHaveBeenCalledTimes(1);
  expect(executionContext.provider.fetchAssets).toHaveBeenCalledTimes(1);
  expect(executionContext.provider.fetchContainers).toHaveBeenCalledTimes(1);
  expect(
    executionContext.provider.fetchReportByImageDigest,
  ).toHaveBeenCalledTimes(0);
  expect(executionContext.persister.processEntities).toHaveBeenCalledTimes(16);
  expect(
    executionContext.persister.publishEntityOperations,
  ).toHaveBeenCalledTimes(5);
  expect(
    executionContext.persister.publishPersisterOperations,
  ).toHaveBeenCalledTimes(1);
});

test("executionHandler unhandled action", async () => {
  const invocationContext = {
    instance: {
      config: {},
    },
    event: {
      action: {
        name: IntegrationActionName.CREATE_ENTITY,
      },
    },
  } as IntegrationExecutionContext;

  await executionHandler(invocationContext);

  expect(executionContext.provider.fetchUsers).not.toHaveBeenCalled();
  expect(executionContext.provider.fetchScans).not.toHaveBeenCalled();
  expect(executionContext.provider.fetchAssets).not.toHaveBeenCalled();
  expect(executionContext.persister.processEntities).not.toHaveBeenCalled();
  expect(
    executionContext.persister.processRelationships,
  ).not.toHaveBeenCalled();
  expect(
    executionContext.persister.publishPersisterOperations,
  ).not.toHaveBeenCalled();
});
