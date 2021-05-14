import {
  IntegrationError,
  IntegrationLogger,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { subMinutes } from "date-fns";
import nock from "nock";
import { createAssetExportCache } from "./createAssetExportCache";
import { createVulnerabilityExportCache } from "./createVulnerabilityExportCache";
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

describe("AssetExportCache", () => {
  let client: TenableClient;
  let logger: IntegrationLogger;

  beforeAll(() => {
    nock.back.fixtures = `${__dirname}/../../test/fixtures/`;
    process.env.CI
      ? nock.back.setMode("lockdown")
      : nock.back.setMode("record");
  });

  beforeEach(() => {
    client = getClient();
    logger = getIntegrationLogger();
  });

  test("create ok", async () => {
    const { nockDone } = await nock.back("export-assets-full-cycle.json", {
      before: prepareScope,
    });

    await createAssetExportCache(logger, client);
    nockDone();
  });

  test("create failed due to timeout", async () => {
    const { nockDone } = await nock.back("export-assets-full-cycle.json", {
      before: prepareScope,
    });
    const timeout = subMinutes(Date.now(), 30).valueOf();
    jest.spyOn(global.Date, "now").mockImplementationOnce(() => timeout);

    try {
      await createAssetExportCache(logger, client);
    } catch (e) {
      expect(e).toBeInstanceOf(IntegrationError);
    }
    nockDone();
  });

  test("findAssetExportsByUuid found asset", async () => {
    const { nockDone } = await nock.back("export-assets-full-cycle.json", {
      before: prepareScope,
    });

    const cache = await createAssetExportCache(logger, client);
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

    const cache = await createAssetExportCache(logger, client);
    const assetExport = cache.findAssetExportByUuid("fake");
    expect(assetExport).toBeUndefined();
    nockDone();
  });

  afterAll(() => {
    nock.restore();
  });
});

describe("VulnerabilityExportCache", () => {
  let client: TenableClient;
  let logger: IntegrationLogger;

  beforeAll(() => {
    nock.back.fixtures = `${__dirname}/../../test/fixtures/`;
    process.env.CI
      ? nock.back.setMode("lockdown")
      : nock.back.setMode("record");
  });

  beforeEach(() => {
    client = getClient();
    logger = getIntegrationLogger();
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-01-01").valueOf());
  });

  test("create ok", async () => {
    const { nockDone } = await nock.back(
      "export-vulnerabilities-full-cycle.json",
      {
        before: prepareScope,
      },
    );

    await createVulnerabilityExportCache(logger, client);

    nockDone();
  });

  test("create failed due to timeout", async () => {
    const { nockDone } = await nock.back(
      "export-vulnerabilities-full-cycle.json",
      {
        before: prepareScope,
      },
    );
    jest.clearAllMocks();

    const timeout = subMinutes(Date.now(), 30).valueOf();
    jest
      .spyOn(global.Date, "now")
      .mockImplementationOnce(() => new Date("2020-01-01").valueOf())
      .mockImplementationOnce(() => timeout);

    try {
      await createVulnerabilityExportCache(logger, client);
    } catch (e) {
      expect(e).toBeInstanceOf(IntegrationError);
    }
    nockDone();
  });

  test("findVulnerabilitiesExportByAssetUuid found vulnerabilities", async () => {
    const { nockDone } = await nock.back(
      "export-vulnerabilities-full-cycle.json",
      {
        before: prepareScope,
      },
    );

    const cache = await createVulnerabilityExportCache(logger, client);

    const lookupUuid = "48cabb0b-f0fe-4db8-9a96-4fec60e4d4f4";
    const vulnerabilityExports = cache.findVulnerabilitiesExportByAssetUuid(
      lookupUuid,
    );
    expect(vulnerabilityExports).not.toBeUndefined();
    expect(vulnerabilityExports?.length).not.toEqual(0);
    expect(vulnerabilityExports?.[0].asset.uuid).toEqual(lookupUuid);

    nockDone();
  });

  test("findVulnerabilitiesExportByAssetUuid did not find vulnerabilities", async () => {
    const { nockDone } = await nock.back(
      "export-vulnerabilities-full-cycle.json",
      {
        before: prepareScope,
      },
    );

    const cache = await createVulnerabilityExportCache(logger, client);

    const vulnerabilityExports = cache.findVulnerabilitiesExportByAssetUuid(
      "fake",
    );
    expect(vulnerabilityExports).toBeUndefined();
    nockDone();
  });

  test("findVulnerabilityExportByAssetPluginUuid found vulnerability", async () => {
    const { nockDone } = await nock.back(
      "export-vulnerabilities-full-cycle.json",
      {
        before: prepareScope,
      },
    );

    const cache = await createVulnerabilityExportCache(logger, client);

    const assetLookupUuid = "48cabb0b-f0fe-4db8-9a96-4fec60e4d4f4";
    const pluginLookupId = 39521;
    const vulnerabilityExport = cache.findVulnerabilityExportByAssetPluginUuid(
      assetLookupUuid,
      pluginLookupId,
    );
    expect(vulnerabilityExport).not.toBeUndefined();
    expect(vulnerabilityExport?.asset.uuid).toEqual(assetLookupUuid);
    expect(vulnerabilityExport?.plugin.id).toEqual(pluginLookupId);

    nockDone();
  });

  test("findVulnerabilityExportByAssetPluginUuid did not find vulnerability", async () => {
    const { nockDone } = await nock.back(
      "export-vulnerabilities-full-cycle.json",
      {
        before: prepareScope,
      },
    );

    const cache = await createVulnerabilityExportCache(logger, client);

    const assetLookupUuid = "48cabb0b-f0fe-4db8-9a96-4fec60e4d4f4";
    const vulnerabilityExport = cache.findVulnerabilityExportByAssetPluginUuid(
      assetLookupUuid,
      -1,
    );
    expect(vulnerabilityExport).toBeUndefined();
    nockDone();
  });

  test("findVulnerabilityExportByAssetPluginUuid did not find vulnerability", async () => {
    const { nockDone } = await nock.back(
      "export-vulnerabilities-full-cycle.json",
      {
        before: prepareScope,
      },
    );

    const cache = await createVulnerabilityExportCache(logger, client);
    const vulnerabilityExport = cache.findVulnerabilityExportByAssetPluginUuid(
      "fake",
      -1,
    );
    expect(vulnerabilityExport).toBeUndefined();
    nockDone();
  });

  afterAll(() => {
    nock.restore();
  });
});
