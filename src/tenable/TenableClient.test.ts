import nock from "nock";

import { fetchTenableData } from "./index";
import TenableClient from "./TenableClient";
import { RecentScanDetail, RecentScanSummary } from "./types";

const ACCESS_KEY =
  process.env.TENABLE_LOCAL_EXECUTION_ACCESS_KEY || "test_access_token";
const SECRET_KEY =
  process.env.TENABLE_LOCAL_EXECUTION_SECRET_KEY || "test_secret_token";
const TENABLE_COM = "cloud.tenable.com";
const RETRY_MAX_ATTEMPTS = 2;

function prepareScope(def: nock.NockDefinition) {
  def.scope = `https://${TENABLE_COM}`;
}

function getClient() {
  return new TenableClient({
    logger: { trace: jest.fn(), warn: jest.fn() } as any,
    accessToken: ACCESS_KEY,
    secretToken: SECRET_KEY,
    retryMaxAttempts: RETRY_MAX_ATTEMPTS,
  });
}

describe("new TenableClient", () => {
  test("accepts 0 retryMaxAttempts", () => {
    const client = new TenableClient({
      logger: { trace: jest.fn() } as any,
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

  test("fetchVulnerabilities ok", async () => {
    const { nockDone } = await nock.back("vulnerabilities-ok.json", {
      before: prepareScope,
    });

    const vulnerabilities = await client.fetchScanHostVulnerabilities(6, 2);
    expect(vulnerabilities.length).not.toEqual(0);
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
