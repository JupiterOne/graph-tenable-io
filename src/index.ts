import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import { TenableIntegrationConfig } from './config';
import { entities, relationships, StepIds } from './constants';
import executionHandler from './executionHandler';
import invocationValidator from './invocationValidator';
import { accountStep } from './steps/account';
import { containerSteps } from './steps/containers';
import { scanSteps } from './steps/scans';
import { userStep } from './steps/users';

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
    integrationSteps: [
      accountStep,
      ...containerSteps,
      ...scanSteps,
      userStep,
      {
        id: 'synchronize',
        name: 'Synchronize',
        entities: [
          entities.CONTAINER_FINDING,
          entities.CONTAINER_MALWARE,
          entities.CONTAINER_UNWANTED_PROGRAM,
          entities.VULNERABILITY,
          entities.VULN_FINDING,
        ],
        relationships: [
          relationships.REPORT_IDENTIFIED_FINDING,
          relationships.REPORT_IDENTIFIED_MALWARE,
          relationships.CONTAINER_REPORT_IDENTIFIED_UNWANTED_PROGRAM,
          relationships.SCAN_IDENTIFIED_FINDING,
          relationships.SCAN_IDENTIFIED_VULNERABILITY,
          relationships.FINDING_IS_VULNERABILITY,
        ],
        dependsOn: [
          StepIds.ACCOUNT,
          StepIds.SCANS,
          StepIds.USERS,
          StepIds.CONTAINERS,
        ],
        executionHandler,
      },
    ],
  };
