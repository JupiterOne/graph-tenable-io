import nock from "nock";
import { fetchTenableData } from "./index";
import TenableClient from "./TenableClient";
import { Scan } from "./types";

const ACCESS_KEY =
  process.env.TENABLE_LOCAL_EXECUTION_ACCESS_KEY || "test_access_token";
const SECRET_KEY =
  process.env.TENABLE_LOCAL_EXECUTION_SECRET_KEY || "test_secret_token";
const CLUSTER = "cloud.tenable.com";

function prepareScope(def: nock.NockDefinition) {
  def.scope = `https://${CLUSTER}`;
}

describe("TenableClient fetch ok data", () => {
  beforeAll(() => {
    nock.back.fixtures = `${__dirname}/../../test/fixtures/`;
    process.env.CI
      ? nock.back.setMode("lockdown")
      : nock.back.setMode("record");
  });

  async function getClient() {
    return new TenableClient(ACCESS_KEY, SECRET_KEY);
  }

  test("fetchUsers ok", async () => {
    const { nockDone } = await nock.back("users-ok.json", {
      before: prepareScope,
    });
    const client = await getClient();
    const response = await client.fetchUsers();
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  test("fetchScans ok", async () => {
    const { nockDone } = await nock.back("scans-ok.json", {
      before: prepareScope,
    });
    const client = await getClient();
    const response = await client.fetchScans();
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  test("fetchAssets ok", async () => {
    const { nockDone } = await nock.back("assets-ok.json", {
      before: prepareScope,
    });
    const client = await getClient();
    const response = await client.fetchAssets();
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  test("fetchScan ok", async () => {
    const client = await getClient();

    const { nockDone } = await nock.back("scan-ok.json", {
      before: prepareScope,
    });
    const scan = await client.fetchScanDetail({ id: 12 } as Scan);
    nockDone();

    expect(scan).not.toEqual({});
  });

  test("fetchVulnerabilities ok", async () => {
    const client = await getClient();

    const { nockDone } = await nock.back("vulnerabilities-ok.json", {
      before: prepareScope,
    });
    const vulnerabilities = await client.fetchVulnerabilities(12, 1);
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

  test("fetchReports ok", async () => {
    const { nockDone } = await nock.back("reports-ok.json", {
      before: prepareScope,
    });
    const client = await getClient();
    const response = await client.fetchReportByImageDigest(
      "sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc",
    );
    nockDone();
    expect(response).not.toEqual({});
  });

  test("fetchTenableData ok", async () => {
    const { nockDone } = await nock.back("all-data-ok.json", {
      before: prepareScope,
    });
    const client = await getClient();
    const response = await fetchTenableData(client);
    nockDone();
    expect(response.users.length).not.toEqual(0);
    expect(response.scans.length).not.toEqual(0);
    expect(response.assets.length).not.toEqual(0);
    expect(response.containers.length).not.toEqual(0);
    expect(response.reports.length).not.toEqual(0);
    expect(response.webAppVulnerabilities).not.toEqual({});
    expect(response.findings).not.toEqual({});
    expect(response.malwares).not.toEqual({});
    expect(response.unwantedPrograms).not.toEqual({});
  });

  afterAll(() => {
    nock.restore();
  });
});
