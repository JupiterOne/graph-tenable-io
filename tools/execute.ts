/* tslint:disable:no-console */
import { executeIntegrationLocal } from "@jupiterone/jupiter-managed-integration-sdk";
import { stepFunctionsInvocationConfig } from "../src/index";

const integrationConfig = {
  accessKey: process.env.TENABLE_LOCAL_EXECUTION_ACCESS_KEY,
  secretKey: process.env.TENABLE_LOCAL_EXECUTION_SECRET_KEY,
};

const invocationArgs = {
  // providerPrivateKey: process.env.PROVIDER_LOCAL_EXECUTION_PRIVATE_KEY
};

executeIntegrationLocal(
  integrationConfig,
  stepFunctionsInvocationConfig,
  invocationArgs,
).catch(err => {
  console.error(err);
  process.exit(1);
});
