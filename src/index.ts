import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './config';
import invocationValidator from './invocationValidator';
import { accountStep } from './steps/account';
import { containerSteps } from './steps/containers';
import { scanSteps } from './steps/vulnerabilities';
import { userStep } from './steps/access';
import { serviceSteps } from './steps/service';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> =
  {
    validateInvocation: invocationValidator,
    integrationSteps: [
      accountStep,
      ...serviceSteps,
      ...containerSteps,
      ...scanSteps,
      userStep,
    ],
  };
