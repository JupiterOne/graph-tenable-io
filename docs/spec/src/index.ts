import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import { accessSpec } from './access';
import { containerSpec } from './containers';
import { vulnerabilitySpec } from './vulnerabilities';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const executionHandler = () => {};

export const invocationConfig: IntegrationInvocationConfig = {
  integrationSteps: [
    {
      /**
       * ENDPOINT: n/a
       * PATTERN: Singleton
       */
      id: 'fetch-account',
      name: 'Fetch Account',
      entities: [
        {
          resourceName: 'Account',
          _class: 'Account',
          _type: 'tenable_account',
        },
      ],
      relationships: [],
      dependsOn: [],
      executionHandler,
    },
    ...accessSpec,
    ...containerSpec,
    ...vulnerabilitySpec,
  ],
};
