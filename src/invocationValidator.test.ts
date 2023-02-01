import {
  IntegrationConfigLoadError,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';
import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from './config';
import validateInvocation from './invocationValidator';

test('should reject when `accessKey` not supplied', async () => {
  const executionContext = createMockExecutionContext<IntegrationConfig>({
    instanceConfig: {
      accessKey: undefined as unknown as string,
      secretKey: 'YYY',
    },
  });

  try {
    await validateInvocation(executionContext as any);
  } catch (e) {
    expect(e.message).toEqual(
      'config requires all of { accessKey, secretKey }',
    );
    expect(e).toBeInstanceOf(IntegrationConfigLoadError);
  }

  expect.assertions(2);
});

test('should reject when `secretKey` not supplied', async () => {
  const executionContext = createMockExecutionContext<IntegrationConfig>({
    instanceConfig: {
      accessKey: 'XXX',
      secretKey: undefined as unknown as string,
    },
  });

  try {
    await validateInvocation(executionContext);
  } catch (e) {
    expect(e.message).toEqual(
      'config requires all of { accessKey, secretKey }',
    );
    expect(e).toBeInstanceOf(IntegrationConfigLoadError);
  }

  expect.assertions(2);
});

test.skip('auth error', async () => {
  const executionContext = createMockExecutionContext<IntegrationConfig>({
    instanceConfig: {
      accessKey: 'XXX',
      secretKey: 'YYY',
    },
  });

  try {
    await validateInvocation(executionContext);
  } catch (e) {
    expect(e.message).toEqual(
      'Unauthorized: https://cloud.tenable.com/session',
    );
    expect(e).toBeInstanceOf(IntegrationValidationError);
  }

  expect.assertions(2);
});

test('should throw if assetApiTimeoutInMinutes below minimum', async () => {
  const executionContext = createMockExecutionContext<IntegrationConfig>({
    instanceConfig: {
      accessKey: 'XXX',
      secretKey: 'YYY',
      assetApiTimeoutInMinutes: -1,
    },
  });

  try {
    await validateInvocation(executionContext);
  } catch (e) {
    expect(e.message).toEqual(
      "'assetApiTimeoutInMinutes' config value is invalid (val=-1, min=0, max=1410)",
    );
    expect(e).toBeInstanceOf(IntegrationConfigLoadError);
  }

  expect.assertions(2);
});

test('should throw if assetApiTimeoutInMinutes above maximum', async () => {
  const executionContext = createMockExecutionContext<IntegrationConfig>({
    instanceConfig: {
      accessKey: 'XXX',
      secretKey: 'YYY',
      assetApiTimeoutInMinutes: 1440,
    },
  });

  try {
    await validateInvocation(executionContext);
  } catch (e) {
    expect(e.message).toEqual(
      "'assetApiTimeoutInMinutes' config value is invalid (val=1440, min=0, max=1410)",
    );
    expect(e).toBeInstanceOf(IntegrationConfigLoadError);
  }

  expect.assertions(2);
});
