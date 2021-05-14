import nock from "nock";

import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";

import executionHandler from "./executionHandler";
import * as Entities from "./jupiterone/entities";

const tenableConfig = {
  accessKey:
    process.env.TENABLE_LOCAL_EXECUTION_ACCESS_KEY || "test_access_token",
  secretKey:
    process.env.TENABLE_LOCAL_EXECUTION_SECRET_KEY || "test_secret_key",
};

describe("executionHandler", () => {
  function prepareScope(def: nock.NockDefinition) {
    def.scope = "https://cloud.tenable.com";
  }

  beforeAll(() => {
    nock.back.fixtures = `${__dirname}/../test/fixtures/`;
    process.env.CI
      ? nock.back.setMode("lockdown")
      : nock.back.setMode("record");
  });

  test("INGEST action with no data", async () => {
    const { nockDone } = await nock.back(
      "execution-handler-no-graph-data.json",
      {
        before: prepareScope,
      },
    );

    const invocationContext = createTestIntegrationExecutionContext({
      instance: {
        config: tenableConfig,
      },
    });

    const { persister } = invocationContext.clients.getClients();
    jest.spyOn(persister, "processEntities");
    jest.spyOn(persister, "processRelationships");
    jest.spyOn(persister, "publishEntityOperations");
    jest.spyOn(persister, "publishRelationshipOperations");
    jest.spyOn(persister, "publishPersisterOperations");
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2003-01-01").valueOf());

    await executionHandler(invocationContext);

    nockDone();

    const entitiesProcessedAsSingleSet = [
      Entities.ACCOUNT_ENTITY_TYPE,
      Entities.SCAN_ENTITY_TYPE,
      Entities.USER_ENTITY_TYPE,
      Entities.CONTAINER_ENTITY_TYPE,
      Entities.CONTAINER_REPORT_ENTITY_TYPE,
      Entities.CONTAINER_MALWARE_ENTITY_TYPE,
      Entities.CONTAINER_FINDING_ENTITY_TYPE,
      Entities.CONTAINER_UNWANTED_PROGRAM_ENTITY_TYPE,
    ];

    const entitiesProcessedAsScanSet = [
      Entities.VULNERABILITY_FINDING_ENTITY_TYPE,
    ];

    const relationshipsProcessedAsSingleSet = [
      Entities.ACCOUNT_USER_RELATIONSHIP_TYPE,
      Entities.USER_OWNS_SCAN_RELATIONSHIP_TYPE,
      Entities.ACCOUNT_CONTAINER_RELATIONSHIP_TYPE,
      Entities.CONTAINER_REPORT_RELATIONSHIP_TYPE,
      Entities.CONTAINER_REPORT_UNWANTED_PROGRAM_RELATIONSHIP_TYPE,
      Entities.REPORT_MALWARE_RELATIONSHIP_TYPE,
      Entities.REPORT_FINDING_RELATIONSHIP_TYPE,
    ];

    const relationshipsProcessedAsScanSet = [
      Entities.SCAN_VULNERABILITY_RELATIONSHIP_TYPE,
      Entities.SCAN_FINDING_RELATIONSHIP_TYPE,
      Entities.VULNERABILITY_FINDING_RELATIONSHIP_TYPE,
    ];

    const deprecatedEntityTypes = [
      "tenable_asset",
      "tenable_report",
      "tenable_finding",
      "tenable_malware",
      "tenable_unwanted_program",
      "tenable_webapp_vulnerability",
    ];

    const deprecatedRelationshipsWithoutUuid = [
      "tenable_scan_identified_vulnerability",
      "tenable_scan_identified_finding",
    ];

    const numScansWithHosts = 3;

    const processEntitiesCount =
      entitiesProcessedAsSingleSet.length +
      numScansWithHosts * entitiesProcessedAsScanSet.length +
      deprecatedEntityTypes.length;

    const processRelationshipsCount =
      relationshipsProcessedAsSingleSet.length +
      numScansWithHosts * relationshipsProcessedAsScanSet.length +
      deprecatedRelationshipsWithoutUuid.length;

    expect(persister.processEntities).toHaveBeenCalledTimes(
      processEntitiesCount,
    );

    expect(persister.processRelationships).toHaveBeenCalledTimes(
      processRelationshipsCount,
    );

    // TODO check the operations published instead of the call count
    expect(persister.publishEntityOperations).toHaveBeenCalledTimes(13);
    expect(persister.publishPersisterOperations).toHaveBeenCalledTimes(5);
  }, 60000);
});
