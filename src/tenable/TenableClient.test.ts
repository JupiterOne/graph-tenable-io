import { IntegrationLogger } from "@jupiterone/jupiter-managed-integration-sdk";
import nock from "nock";
import { config } from "../../test/config";
import {
  getTenableMatchRequestsBy,
  Recording,
  setupTenableRecording,
} from "../../test/recording";

import { fetchTenableData } from "./index";
import TenableClient from "./TenableClient";
import {
  ExportAssetsOptions,
  ExportVulnerabilitiesOptions,
  RecentScanDetail,
  RecentScanSummary,
  ScanHostVulnerability,
  VulnerabilityState,
} from "./types";

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

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

describe("new TenableClient", () => {
  test("accepts 0 retryMaxAttempts", () => {
    const client = new TenableClient({
      logger: getIntegrationLogger(),
      accessToken: ACCESS_KEY,
      secretToken: SECRET_KEY,
      retryMaxAttempts: 0,
    });

    expect((client as any).retryMaxAttempts).toEqual(0);
  });
});

// See docs/tenable-cloud/fixture-data.md

describe("TenableClient fetch errors", () => {
  test("fetch error", async () => {
    const scope = nock(`https://${TENABLE_COM}`)
      .get(/.*/)
      .reply(404);
    const client = getClient();
    await expect(client.fetchUsers()).rejects.toThrow(/404/);
    scope.done();
  });

  test("fetch 429 waits Retry-After time max times", async () => {
    const scope = nock(`https://${TENABLE_COM}`)
      .get("/users")
      .times(RETRY_MAX_ATTEMPTS - 1)
      .reply(429, "Too Many Requests", {
        "Content-Type": "text/html",
        "Retry-After": "1",
      })
      .get("/users")
      .reply(404);
    const client = getClient();
    await expect(client.fetchUsers()).rejects.toThrow(/404/);
    expect(scope.pendingMocks().length).toBe(0);
    scope.done();
  });

  test("immediately retry 504 up to the max amount", async () => {
    const scanId = 123;
    const hostId = 1234;
    const vulnerabilities = ["no bueno"];
    const scope = nock(`https://${TENABLE_COM}`)
      .get(`/scans/${scanId}/hosts/${hostId}`)
      .times(RETRY_MAX_ATTEMPTS - 1)
      .reply(504)
      .get(`/scans/${scanId}/hosts/${hostId}`)
      .reply(200, { vulnerabilities });
    const client = getClient();
    expect(await client.fetchScanHostVulnerabilities(scanId, hostId)).toEqual(
      vulnerabilities,
    );
    expect(scope.pendingMocks().length).toBe(0);
    scope.done();
  });

  test("immediately retry 500 but short circuit to only 3 attempts", async () => {
    const scope = nock(`https://${TENABLE_COM}`)
      .get(
        "/workbenches/assets/2aa49a6b-f17b-4b43-8953-58e2012f2fb3/vulnerabilities/10386/info",
      )
      .times(RETRY_MAX_ATTEMPTS - 1)
      .reply(500);
    const client = getClient();
    const info = await client.fetchAssetVulnerabilityInfo(
      "2aa49a6b-f17b-4b43-8953-58e2012f2fb3",
      { plugin_id: 10386 } as ScanHostVulnerability,
    );
    expect(info).toBeUndefined();
    expect(scope.pendingMocks().length).toBe(0);
    scope.done();
  });

  test("fetch 429 without Retry-After", async () => {
    const scope = nock(`https://${TENABLE_COM}`)
      .get("/users")
      .times(1)
      .reply(429, "Too Many Requests", {
        "Content-Type": "text/html",
      })
      .get("/users")
      .reply(404);
    const client = getClient();
    await expect(client.fetchUsers()).rejects.toThrow(/404/);
    scope.done();
  });

  test("fetchScanDetail unknown error", async () => {
    const scope = nock(`https://${TENABLE_COM}`)
      .get("/scans/199")
      .reply(401);
    const client = getClient();
    await expect(
      client.fetchScanDetail({ id: 199 } as RecentScanSummary),
    ).rejects.toThrow(/401/);
    scope.done();
  });

  test("fetchScanHostVulnerabilities unknown error", async () => {
    const scope = nock(`https://${TENABLE_COM}`)
      .get("/scans/6/hosts/2")
      .times(RETRY_MAX_ATTEMPTS - 1)
      .reply(500);
    const client = getClient();
    await expect(client.fetchScanHostVulnerabilities(6, 2)).rejects.toThrow(
      /500/,
    );
    scope.done();
  });

  test("fetchScanDetail unknown error", async () => {
    const scope = nock(`https://${TENABLE_COM}`)
      .get(
        "/workbenches/assets/2aa49a6b-f17b-4b43-8953-58e2012f2fb3/vulnerabilities/10386/info",
      )
      .reply(401);
    const client = getClient();
    await expect(
      client.fetchAssetVulnerabilityInfo(
        "2aa49a6b-f17b-4b43-8953-58e2012f2fb3",
        { plugin_id: 10386 } as ScanHostVulnerability,
      ),
    ).rejects.toThrow(/401/);
    scope.done();
  });
});

describe("TenableClient data fetch", () => {
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

  test("fetchUserPermissions ok", async () => {
    const { nockDone } = await nock.back("user-permissions-ok.json", {
      before: prepareScope,
    });

    const response = await client.fetchUserPermissions();
    expect(response).not.toEqual({});
    nockDone();
  });

  test("fetchUsers ok", async () => {
    const { nockDone } = await nock.back("users-ok.json", {
      before: prepareScope,
    });

    const response = await client.fetchUsers();
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  test("fetchScans ok", async () => {
    const { nockDone } = await nock.back("scans-ok.json", {
      before: prepareScope,
    });

    const response = await client.fetchScans();
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  test("fetchAssets ok", async () => {
    const { nockDone } = await nock.back("assets-ok.json", {
      before: prepareScope,
    });
    const response = await client.fetchAssets();
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  test("fetchScanDetail ok", async () => {
    const { nockDone } = await nock.back("scan-ok.json", {
      before: prepareScope,
    });

    const scan = await client.fetchScanDetail({ id: 6 } as RecentScanSummary);
    expect(scan).toMatchObject({
      info: expect.any(Object),
      hosts: expect.any(Array),
      vulnerabilities: expect.any(Array),
    });
    nockDone();
  });

  test("fetchScanDetail never executed", async () => {
    const { nockDone } = await nock.back("scan-never-executed.json", {
      before: prepareScope,
    });

    const scan = await client.fetchScanDetail({ id: 14 } as RecentScanSummary);
    expect(scan).toMatchObject({
      info: expect.any(Object),
      hosts: undefined,
      vulnerabilities: undefined,
    } as RecentScanDetail);
    nockDone();
  });

  test("fetchScanDetail forbidden", async () => {
    const { nockDone } = await nock.back("scan-forbidden.json", {
      before: prepareScope,
    });

    const scan = await client.fetchScanDetail({ id: 12 } as RecentScanSummary);
    expect(scan).toBeUndefined();
    nockDone();
  });

  test("fetchScanHostVulnerabilities ok", async () => {
    const { nockDone } = await nock.back("vulnerabilities-ok.json", {
      before: prepareScope,
    });

    const vulnerabilities = await client.fetchScanHostVulnerabilities(6, 2);
    expect(vulnerabilities.length).not.toEqual(0);
    nockDone();
  });

  test("fetchScanHostVulnerabilities 404", async () => {
    const { nockDone } = await nock.back("vulnerabilities-not-found.json", {
      before: prepareScope,
    });

    const vulnerabilities = await client.fetchScanHostVulnerabilities(19, 2000);
    expect(vulnerabilities.length).toEqual(0);
    nockDone();
  });

  test("fetchAssetVulnerabilityInfo ok", async () => {
    const { nockDone } = await nock.back("asset-vulnerability-info-ok.json", {
      before: prepareScope,
    });

    const info = await client.fetchAssetVulnerabilityInfo(
      "2aa49a6b-f17b-4b43-8953-58e2012f2fb3",
      { plugin_id: 10386 } as ScanHostVulnerability,
    );
    expect(info).toMatchObject({
      plugin_details: expect.any(Object),
    });
    nockDone();
  });

  test("fetchAssetVulnerabilityInfo 404", async () => {
    const { nockDone } = await nock.back(
      "asset-vulnerability-info-not-found.json",
      {
        before: prepareScope,
      },
    );

    const info = await client.fetchAssetVulnerabilityInfo(
      "2aa49a6b-f17b-4b43-8953-58e2012f2fb3",
      { plugin_id: 11111 } as ScanHostVulnerability,
    );
    expect(info).toBeUndefined();
    nockDone();
  });

  test("fetchContainers ok", async () => {
    const { nockDone } = await nock.back("containers-ok.json", {
      before: prepareScope,
    });

    const response = await client.fetchContainers();
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  test("fetchReportByImageDigest image with vulnerabilities", async () => {
    const { nockDone } = await nock.back("container-report-vulns.json", {
      before: prepareScope,
    });

    const response = await client.fetchReportByImageDigest(
      "sha256:5887b9b394294f66c2f8ef1b4bdddbdd7fcc4512df5ee470c5e74f6e8ed603c6",
    );
    expect(response).not.toEqual({});
    nockDone();
  });

  test("fetchReportByImageDigest image with no vulnerabilities", async () => {
    const { nockDone } = await nock.back("container-report-no-vulns.json", {
      before: prepareScope,
    });

    const response = await client.fetchReportByImageDigest(
      "sha256:1edb77942782fc99d6b1ad53c78dd602ae5ee4f26e49edb49555faf749574ae9",
    );
    expect(response).not.toEqual({});
    nockDone();
  });

  test("exportVulnerabilities ok", async () => {
    const { nockDone } = await nock.back("export-vulnerabilities-ok.json", {
      before: prepareScope,
    });

    const options: ExportVulnerabilitiesOptions = {
      num_assets: 50,
      filters: {
        first_found: 1009861200,
        state: [
          VulnerabilityState.Open,
          VulnerabilityState.Reopened,
          VulnerabilityState.Fixed,
        ],
      },
    };
    const response = await client.exportVulnerabilities(options);
    expect(response).not.toEqual({});
    nockDone();
  });

  test("fetchVulnerabilitiesExportStatus ok", async () => {
    const { nockDone } = await nock.back(
      "vulnerabilities-export-status-ok.json",
      {
        before: prepareScope,
      },
    );

    const response = await client.fetchVulnerabilitiesExportStatus(
      "ea907e2b-6cf0-45d2-99d0-8037158eb896",
    );
    expect(response).not.toEqual({});
    nockDone();
  });

  test("fetchVulnerabilitiesExportChunk ok", async () => {
    const { nockDone } = await nock.back(
      "vulnerabilities-export-chunk-ok.json",
      {
        before: prepareScope,
      },
    );

    const response = await client.fetchVulnerabilitiesExportChunk(
      "ea907e2b-6cf0-45d2-99d0-8037158eb896",
      1,
    );
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  test("exportAssets ok", async () => {
    const { nockDone } = await nock.back("export-assets-ok.json", {
      before: prepareScope,
    });

    const options: ExportAssetsOptions = {
      chunk_size: 100,
    };
    const response = await client.exportAssets(options);
    expect(response).not.toEqual({});
    nockDone();
  });

  test("fetchAssetsExportStatus ok", async () => {
    const { nockDone } = await nock.back("assets-export-status-ok.json", {
      before: prepareScope,
    });

    const response = await client.fetchAssetsExportStatus(
      "5dc52d4e-82d1-4988-8231-98dbe6ce62cd",
    );
    expect(response).not.toEqual({});
    nockDone();
  });

  test("fetchAssetsExportChunk ok", async () => {
    const { nockDone } = await nock.back("assets-export-chunk-ok.json", {
      before: prepareScope,
    });

    const response = await client.fetchAssetsExportChunk(
      "5dc52d4e-82d1-4988-8231-98dbe6ce62cd",
      1,
    );
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  test("fetchTenableData ok", async () => {
    const { nockDone } = await nock.back("all-data-ok.json", {
      before: prepareScope,
    });

    const response = await fetchTenableData(client);
    expect(response.containers.length).not.toEqual(0);
    expect(response.containerReports.length).not.toEqual(0);
    expect(response.containerFindings).not.toEqual({});
    expect(response.containerMalwares).not.toEqual({});
    expect(response.containerUnwantedPrograms).not.toEqual({});
    nockDone();
  }, 10000);

  afterAll(() => {
    nock.restore();
  });
});

describe("cancelAssetExport", () => {
  test("success", async () => {
    recording = setupTenableRecording({
      directory: __dirname,
      name: "cancelAssetExport",
      options: {
        matchRequestsBy: getTenableMatchRequestsBy(config),
      },
    });

    const client = new TenableClient({
      logger: getIntegrationLogger(),
      accessToken: config.accessKey,
      secretToken: config.secretKey,
    });

    const { export_uuid } = await client.exportAssets({ chunk_size: 100 });

    const response = await client.cancelAssetExport(export_uuid);

    expect(response.response.status).toBe("CANCELLED");
  });
});
