import { TenableIntegrationConfig } from '../../../src/config';
import { accessSpec } from './access';
import { containerSpec } from './containers';
import { IntegrationSpecConfig } from './types';
import { vulnerabilitySpec } from './vulnerabilities';

export const invocationConfig: IntegrationSpecConfig<TenableIntegrationConfig> =
  {
    integrationSteps: [
      {
        /**
         * ENDPOINT: n/a
         * PATTERN: Singleton
         */
        id: 'step-account',
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
        implemented: true,
      },
      ...accessSpec,
      ...containerSpec,
      ...vulnerabilitySpec,
    ],
  };
