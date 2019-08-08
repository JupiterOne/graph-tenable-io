import nock from "nock";

import { fetchTenableData } from "./index";
import TenableClient from "./TenableClient";
import { Scan, ScanDetail } from "./types";

const ACCESS_KEY =
  process.env.TENABLE_LOCAL_EXECUTION_ACCESS_KEY || "test_access_token";
const SECRET_KEY =
  process.env.TENABLE_LOCAL_EXECUTION_SECRET_KEY || "test_secret_token";
const TENABLE_COM = "cloud.tenable.com";

function prepareScope(def: nock.NockDefinition) {
  def.scope = `https://${TENABLE_COM}`;
}

// See docs/tenable-cloud/fixture-data.md
describe("TenableClient fetch ok data", () => {
  beforeAll(() => {
    nock.back.fixtures = `${__dirname}/../../test/fixtures/`;
    process.env.CI
      ? nock.back.setMode("lockdown")
      : nock.back.setMode("record");
  });

  function getClient() {
    return new TenableClient(
      { trace: jest.fn() } as any,
      ACCESS_KEY,
      SECRET_KEY,
    );
  }

  test("fetch error", async () => {
    nock(`https://${TENABLE_COM}`)
      .get("/users")
      .reply(404);
    const client = getClient();
    await expect(client.fetchUsers()).rejects.toThrow();
  });

  test("fetchUserPermissions ok", async () => {
    const { nockDone } = await nock.back("user-permissions-ok.json", {
      before: prepareScope,
    });
    const client = getClient();
    const response = await client.fetchUserPermissions();
    expect(response).not.toEqual({});
    nockDone();
  });

  test("fetchUsers ok", async () => {
    const { nockDone } = await nock.back("users-ok.json", {
      before: prepareScope,
    });
    const client = getClient();
    const response = await client.fetchUsers();
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  test("fetchScans ok", async () => {
    const { nockDone } = await nock.back("scans-ok.json", {
      before: prepareScope,
    });
    const client = getClient();
    const response = await client.fetchScans();
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  test("fetchAssets ok", async () => {
    const { nockDone } = await nock.back("assets-ok.json", {
      before: prepareScope,
    });
    const client = getClient();
    const response = await client.fetchAssets();
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  test("fetchScanDetail ok", async () => {
    const client = getClient();

    const { nockDone } = await nock.back("scan-ok.json", {
      before: prepareScope,
    });
    const scan = await client.fetchScanDetail({ id: 6 } as Scan);
    nockDone();

    expect(scan).toMatchObject({
      detailsForbidden: false,
    });
  });

  test("fetchScanDetail never executed", async () => {
    const client = getClient();

    const { nockDone } = await nock.back("scan-never-executed.json", {
      before: prepareScope,
    });
    const scan = await client.fetchScanDetail({ id: 14 } as Scan);
    nockDone();

    expect(scan).toMatchObject({
      detailsForbidden: false,
      hosts: undefined,
      vulnerabilities: undefined,
    } as ScanDetail);
  });

  test("fetchScanDetail forbidden", async () => {
    const client = getClient();

    const { nockDone } = await nock.back("scan-forbidden.json", {
      before: prepareScope,
    });
    const scan = await client.fetchScanDetail({ id: 12 } as Scan);
    nockDone();

    expect(scan).toMatchObject({
      detailsForbidden: true,
    });
  });

  test("fetchScanDetail unknown error", async () => {
    nock(`https://${TENABLE_COM}`)
      .get("/scans/199")
      .reply(401);
    const client = getClient();
    await expect(client.fetchScanDetail({ id: 199 } as Scan)).rejects.toThrow();
  });

  test("fetchVulnerabilities ok", async () => {
    const client = getClient();

    const { nockDone } = await nock.back("vulnerabilities-ok.json", {
      before: prepareScope,
    });
    const vulnerabilities = await client.fetchVulnerabilities(6, 2);
    nockDone();

    expect(vulnerabilities.length).not.toEqual(0);
  });

  test("fetchContainers ok", async () => {
    const { nockDone } = await nock.back("containers-ok.json", {
      before: prepareScope,
    });
    const client = await getClient();
    const response = await client.fetchContainers();
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  test("fetchReportByImageDigest image with vulnerabilties", async () => {
    const { nockDone } = await nock.back("container-report-vulns.json", {
      before: prepareScope,
    });
    const client = getClient();
    const response = await client.fetchReportByImageDigest(
      "sha256:5887b9b394294f66c2f8ef1b4bdddbdd7fcc4512df5ee470c5e74f6e8ed603c6",
    );
    nockDone();
    expect(response).not.toEqual({});
  });

  test("fetchReportByImageDigest image with no vulnerabilties", async () => {
    const { nockDone } = await nock.back("container-report-no-vulns.json", {
      before: prepareScope,
    });
    const client = getClient();
    const response = await client.fetchReportByImageDigest(
      "sha256:1edb77942782fc99d6b1ad53c78dd602ae5ee4f26e49edb49555faf749574ae9",
    );
    nockDone();
    expect(response).not.toEqual({});
  });

  test("fetchTenableData ok", async () => {
    const { nockDone } = await nock.back("all-data-ok.json", {
      before: prepareScope,
    });
    const client = getClient();
    const response = await fetchTenableData(client);
    nockDone();
    expect(response.users.length).not.toEqual(0);
    expect(response.scans.length).not.toEqual(0);
    expect(response.assets.length).not.toEqual(0);
    expect(response.containers.length).not.toEqual(0);
    expect(response.containerReports.length).not.toEqual(0);
    expect(response.scanVulnerabilities).not.toEqual({});
    expect(response.containerFindings).not.toEqual({});
    expect(response.containerMalwares).not.toEqual({});
    expect(response.containerUnwantedPrograms).not.toEqual({});
  }, 10000);

  afterAll(() => {
    nock.restore();
  });
});
