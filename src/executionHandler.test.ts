import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";
import * as attempt from "@lifeomic/attempt";
import nock from "nock";

import executionHandler from "./executionHandler";
import {
  ACCOUNT_CONTAINER_RELATIONSHIP_TYPE,
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  CONTAINER_REPORT_RELATIONSHIP_TYPE,
  CONTAINER_REPORT_UNWANTED_PROGRAM_RELATIONSHIP_TYPE,
  entities,
  REPORT_FINDING_RELATIONSHIP_TYPE,
  REPORT_MALWARE_RELATIONSHIP_TYPE,
  SCAN_FINDING_RELATIONSHIP_TYPE,
  SCAN_VULNERABILITY_RELATIONSHIP_TYPE,
  USER_OWNS_SCAN_RELATIONSHIP_TYPE,
  VULNERABILITY_FINDING_RELATIONSHIP_TYPE,
} from "./jupiterone/entities";

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
    jest.spyOn(attempt, "sleep").mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(resolve, 0);
        }),
    );
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
      entities.ACCOUNT._type,
      entities.SCAN._type,
      entities.USER._type,
      entities.CONTAINER._type,
      entities.CONTAINER_REPORT._type,
      entities.CONTAINER_MALWARE._type,
      entities.CONTAINER_FINDING._type,
      entities.CONTAINER_UNWANTED_PROGRAM._type,
    ];

    const entitiesProcessedAsScanSet = [entities.VULN_FINDING._type];

    const relationshipsProcessedAsSingleSet = [
      ACCOUNT_USER_RELATIONSHIP_TYPE,
      USER_OWNS_SCAN_RELATIONSHIP_TYPE,
      ACCOUNT_CONTAINER_RELATIONSHIP_TYPE,
      CONTAINER_REPORT_RELATIONSHIP_TYPE,
      CONTAINER_REPORT_UNWANTED_PROGRAM_RELATIONSHIP_TYPE,
      REPORT_MALWARE_RELATIONSHIP_TYPE,
      REPORT_FINDING_RELATIONSHIP_TYPE,
    ];

    const relationshipsProcessedAsScanSet = [
      SCAN_VULNERABILITY_RELATIONSHIP_TYPE,
      SCAN_FINDING_RELATIONSHIP_TYPE,
      VULNERABILITY_FINDING_RELATIONSHIP_TYPE,
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
