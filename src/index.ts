import { IntegrationInvocationConfig } from "@jupiterone/integration-sdk-core";

import { TenableIntegrationConfig } from "./config";
import { entities, relationships } from "./constants";
import executionHandler from "./executionHandler";
import invocationValidator from "./invocationValidator";

export const invocationConfig: IntegrationInvocationConfig<TenableIntegrationConfig> = {
  instanceConfigFields: {
    accessKey: {
      type: "string",
    },
    secretKey: {
      type: "string",
      mask: true,
    },
  },
  validateInvocation: invocationValidator,
  integrationSteps: [
    {
      id: "synchronize",
      name: "Synchronize",
      entities: Object.values(entities),
      relationships: Object.values(relationships),
      executionHandler,
    },
  ],
};
