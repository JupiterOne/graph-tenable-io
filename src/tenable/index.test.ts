import { IntegrationLogger } from "@jupiterone/jupiter-managed-integration-sdk";
import nock from "nock";
import createTenableAssetExportCache from "./createTenableAssetExportCache";
import TenableClient from "./TenableClient";

function getIntegrationLogger(): IntegrationLogger {
  return {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    child: () => getIntegrationLogger(),
  };
}

const ACCESS_KEY =
  process.env.TENABLE_LOCAL_EXECUTION_ACCESS_KEY || "test_access_token";
const SECRET_KEY =
  process.env.TENABLE_LOCAL_EXECUTION_SECRET_KEY || "test_secret_token";
const TENABLE_COM = "cloud.tenable.com";
const RETRY_MAX_ATTEMPTS = 4;

function prepareScope(def: nock.NockDefinition) {
  def.scope = `https://${TENABLE_COM}`;
}

function getClient() {
  return new TenableClient({
    logger: getIntegrationLogger(),
    accessToken: ACCESS_KEY,
    secretToken: SECRET_KEY,
    retryMaxAttempts: RETRY_MAX_ATTEMPTS,
  });
}

describe("TenableAssetExportCache", () => {
  let client: TenableClient;

  beforeAll(() => {
    nock.back.fixtures = `${__dirname}/../../test/fixtures/`;
    process.env.CI
      ? nock.back.setMode("lockdown")
      : nock.back.setMode("record");
  });

  beforeEach(() => {
    client = getClient();
  });

  test("createTenableAssetExportCache ok", async () => {
    const { nockDone } = await nock.back("export-assets-full-cycle.json", {
      before: prepareScope,
    });

    await createTenableAssetExportCache(client);

    nockDone();
  });

  test("findAssetExportsByUuid found asset", async () => {
    const { nockDone } = await nock.back("export-assets-full-cycle.json", {
      before: prepareScope,
    });

    const cache = await createTenableAssetExportCache(client);

    const lookupUuid = "48cabb0b-f0fe-4db8-9a96-4fec60e4d4f4";
    const assetExport = cache.findAssetExportByUuid(lookupUuid);
    expect(assetExport).not.toBeUndefined();
    expect(assetExport?.id).toEqual(lookupUuid);

    nockDone();
  });

  test("findAssetExportsByUuid did not find asset", async () => {
    const { nockDone } = await nock.back("export-assets-full-cycle.json", {
      before: prepareScope,
    });

    const cache = await createTenableAssetExportCache(client);

    const assetExport = cache.findAssetExportByUuid("fake");
    expect(assetExport).toBeUndefined();
    nockDone();
  });

  afterAll(() => {
    nock.restore();
  });
});
