import {
  IntegrationConfigLoadError,
  IntegrationExecutionContext,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './config';
import TenableClient from './tenable/TenableClient';
import { toNum } from './utils/dataType';

const ONE_DAY_MINUTES = 1440;
const MAXIMUM_API_TIMEOUT_IN_MINUTES = ONE_DAY_MINUTES - 30;

function isValidApiTimeoutInMinutes(timeout?: number) {
  if (timeout === undefined) return true;
  return timeout >= 0 && timeout <= MAXIMUM_API_TIMEOUT_IN_MINUTES;
}

/**
 * Performs validation of the execution before the execution handler function is
 * invoked.
 *
 * At a minimum, integrations should ensure that the
 * `executionContext.instance.config` is valid. Integrations that require
 * additional information in `executionContext.invocationArgs` should also
 * validate those properties. It is also helpful to perform authentication with
 * the provider to ensure that credentials are valid.
 *
 * The function will be awaited to support connecting to the provider for this
 * purpose.
 *
 * @param executionContext
 */
export default async function invocationValidator(
  executionContext: IntegrationExecutionContext<IntegrationConfig>,
) {
  const {
    logger,
    instance: { config },
  } = executionContext;
  if (!config.accessKey || !config.secretKey) {
    throw new IntegrationConfigLoadError(
      'config requires all of { accessKey, secretKey }',
    );
  }

  // Mutate the value of `config.assetApiTimeoutInMinutes`, so that each of
  // the integration steps will have the properly parsed value.
  const assetApiTimeoutInMinutes =
    (executionContext.instance.config.assetApiTimeoutInMinutes = toNum(
      config.assetApiTimeoutInMinutes,
    ));

  if (!isValidApiTimeoutInMinutes(assetApiTimeoutInMinutes)) {
    throw new IntegrationConfigLoadError(
      `'assetApiTimeoutInMinutes' config value is invalid (val=${assetApiTimeoutInMinutes}, min=0, max=${MAXIMUM_API_TIMEOUT_IN_MINUTES})`,
    );
  }

  // Mutate the value of `config.assetApiTimeoutInMinutes`, so that each of
  // the integration steps will have the properly parsed value.
  const vulnerabilityApiTimeoutInMinutes =
    (executionContext.instance.config.vulnerabilityApiTimeoutInMinutes = toNum(
      config.vulnerabilityApiTimeoutInMinutes,
    ));

  if (!isValidApiTimeoutInMinutes(vulnerabilityApiTimeoutInMinutes)) {
    throw new IntegrationConfigLoadError(
      `'vulnerabilityApiTimeoutInMinutes' config value is invalid (val=${vulnerabilityApiTimeoutInMinutes}, min=0, max=${MAXIMUM_API_TIMEOUT_IN_MINUTES})`,
    );
  }

  const provider = new TenableClient({
    logger,
    accessToken: config.accessKey,
    secretToken: config.secretKey,
  });

  try {
    await provider.fetchUserPermissions();
  } catch (err) {
    throw new IntegrationValidationError(err.message);
  }
}
