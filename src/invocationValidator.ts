import {
  IntegrationConfigLoadError,
  IntegrationExecutionContext,
  IntegrationValidationError,
} from "@jupiterone/integration-sdk-core";

import { TenableIntegrationConfig } from "./config";
import TenableClient from "./tenable/TenableClient";

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
  executionContext: IntegrationExecutionContext<TenableIntegrationConfig>,
) {
  const {
    logger,
    instance: { config },
  } = executionContext;
  if (!config.accessKey || !config.secretKey) {
    throw new IntegrationConfigLoadError(
      "config requires all of { accessKey, secretKey }",
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
