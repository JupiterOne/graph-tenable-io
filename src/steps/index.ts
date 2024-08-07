import { accountStep } from './account';
import { containerSteps } from './containers';
import { scanSteps } from './vulnerabilities';
import { complianceFindingSteps } from './compliance-finding';
import { userStep } from './access';
import { serviceSteps } from './service';
import { scannerStep } from './scanners';
import { agentsSteps } from './agents';
import { IntegrationStep } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../config';

export const integrationSteps: IntegrationStep<IntegrationConfig>[] = [
  accountStep,
  ...serviceSteps,
  ...containerSteps,
  ...scanSteps,
  userStep,
  scannerStep,
  ...agentsSteps,
  ...complianceFindingSteps,
];
