import { IntegrationLogger } from '@jupiterone/integration-sdk-core';
import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import nock from 'nock';
import { config } from '../../test/config';
import {
  getTenableMatchRequestsBy,
  Recording,
  setupTenableRecording,
} from '../../test/recording';

import TenableClient from './TenableClient';
import { AssetExport, VulnerabilityExport } from './client';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

function getIntegrationLogger(): IntegrationLogger {
  return createMockIntegrationLogger();
}

const ACCESS_KEY =
  process.env.TENABLE_LOCAL_EXECUTION_ACCESS_KEY || 'test_access_token';
const SECRET_KEY =
  process.env.TENABLE_LOCAL_EXECUTION_SECRET_KEY || 'test_secret_token';
const TENABLE_COM = 'cloud.tenable.com';
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

describe.skip('new TenableClient', () => {
  test('accepts 0 retryMaxAttempts', () => {
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

describe.skip('TenableClient fetch errors', () => {
  test('fetch error', async () => {
    const scope = nock(`https://${TENABLE_COM}`).get(/.*/).reply(404);
    const client = getClient();
    await expect(client.fetchUsers()).rejects.toThrow(/404/);
    scope.done();
  });

  test('fetch 429 waits Retry-After time max times', async () => {
    const scope = nock(`https://${TENABLE_COM}`)
      .get('/users')
      .times(RETRY_MAX_ATTEMPTS - 1)
      .reply(429, 'Too Many Requests', {
        'Content-Type': 'text/html',
        'Retry-After': '1',
      })
      .get('/users')
      .reply(404);
    const client = getClient();
    await expect(client.fetchUsers()).rejects.toThrow(/404/);
    expect(scope.pendingMocks().length).toBe(0);
    scope.done();
  });

  test('fetch 429 without Retry-After', async () => {
    const scope = nock(`https://${TENABLE_COM}`)
      .get('/users')
      .times(1)
      .reply(429, 'Too Many Requests', {
        'Content-Type': 'text/html',
      })
      .get('/users')
      .reply(404);
    const client = getClient();
    await expect(client.fetchUsers()).rejects.toThrow(/404/);
    scope.done();
  });
});

describe.skip('TenableClient data fetch', () => {
  let client: TenableClient;

  beforeAll(() => {
    nock.back.fixtures = `${__dirname}/../../test/fixtures/`;
    process.env.CI
      ? nock.back.setMode('lockdown')
      : nock.back.setMode('record');
  });

  beforeEach(() => {
    client = getClient();
  });

  test('fetchUserPermissions ok', async () => {
    const { nockDone } = await nock.back('user-permissions-ok.json', {
      before: prepareScope,
    });

    const response = await client.fetchUserPermissions();
    expect(response).not.toEqual({});
    nockDone();
  });

  test('fetchUsers ok', async () => {
    const { nockDone } = await nock.back('users-ok.json', {
      before: prepareScope,
    });

    const response = await client.fetchUsers();
    expect(response.length).not.toEqual(0);
    nockDone();
  });

  afterAll(() => {
    nock.restore();
  });
});

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('iterateAssets', () => {
  test('should iterate all assets', async () => {
    recording = setupTenableRecording({
      directory: __dirname,
      name: 'iterateAssets-success',
      options: {
        matchRequestsBy: getTenableMatchRequestsBy(config),
      },
    });

    const client = new TenableClient({
      logger: getIntegrationLogger(),
      accessToken: config.accessKey,
      secretToken: config.secretKey,
    });

    jest.useFakeTimers('legacy'); // https://jestjs.io/blog/2021/05/25/jest-27#flipping-defaults
    const assets: AssetExport[] = [];
    const iterateAssetsPromise = client.iterateAssets((a) => {
      assets.push(a);
    });
    // allow sleep() to run to completion once
    await flushPromises();
    jest.advanceTimersByTime(60000);
    await flushPromises();
    await iterateAssetsPromise;
    expect(assets.length).toBeGreaterThan(0);
    jest.useRealTimers();
  });
});

describe('iterateVulnerabilities', () => {
  test('should iterate all vulnerabilities', async () => {
    recording = setupTenableRecording({
      directory: __dirname,
      name: 'iterateVulnerabilities-success',
      options: {
        matchRequestsBy: getTenableMatchRequestsBy(config),
      },
    });

    const client = new TenableClient({
      logger: getIntegrationLogger(),
      accessToken: config.accessKey,
      secretToken: config.secretKey,
    });

    jest.useFakeTimers('legacy'); // https://jestjs.io/blog/2021/05/25/jest-27#flipping-defaults
    const vulnerabilities: VulnerabilityExport[] = [];
    const iterateVulnerabilitiesPromise = client.iterateVulnerabilities((v) => {
      vulnerabilities.push(v);
    });

    // allow sleep() to run to completion once
    await flushPromises();
    jest.advanceTimersByTime(60000);
    await flushPromises();

    await iterateVulnerabilitiesPromise;
    // TODO create a vuln in Tenable and enable the following expect:
    // expect(vulnerabilities.length).toBeGreaterThan(0);
    jest.useRealTimers();
  });
});
