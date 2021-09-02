import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import { TenableIntegrationConfig } from './config';
import invocationValidator from './invocationValidator';
import { accountStep } from './steps/account';
import { containerSteps } from './steps/containers';
import { scanSteps } from './steps/vulnerabilities';
import { userStep } from './steps/access';

export const invocationConfig: IntegrationInvocationConfig<TenableIntegrationConfig> =
  {
    instanceConfigFields: {
      accessKey: {
        type: 'string',
      },
      secretKey: {
        type: 'string',
        mask: true,
      },
    },
    validateInvocation: invocationValidator,
    integrationSteps: [accountStep, ...containerSteps, ...scanSteps, userStep],
  };
