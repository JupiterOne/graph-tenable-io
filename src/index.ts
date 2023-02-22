import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig, instanceConfigFields } from './config';
import validateInvocation from './invocationValidator';
import { integrationSteps } from './steps';
import getStepStartStates from './getStepStartStates';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> =
  {
    instanceConfigFields,
    validateInvocation,
    integrationSteps,
    getStepStartStates,
  };
