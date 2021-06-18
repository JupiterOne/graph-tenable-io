import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import { TenableIntegrationConfig } from './config';
import { entities, relationships, StepIds } from './constants';
import executionHandler from './executionHandler';
import invocationValidator from './invocationValidator';
import { accountStep } from './steps/account';

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
      {
        id: 'synchronize',
        name: 'Synchronize',
        entities: [
          entities.CONTAINER,
          entities.CONTAINER_REPORT,
          entities.CONTAINER_FINDING,
          entities.CONTAINER_MALWARE,
          entities.CONTAINER_UNWANTED_PROGRAM,
          entities.SCAN,
          entities.USER,
          entities.VULNERABILITY,
          entities.VULN_FINDING,
        ],
        relationships: [
          relationships.ACCOUNT_HAS_USER,
          relationships.ACCOUNT_HAS_CONTAINER,
          relationships.CONTAINER_HAS_REPORT,
          relationships.REPORT_IDENTIFIED_FINDING,
          relationships.REPORT_IDENTIFIED_MALWARE,
          relationships.CONTAINER_REPORT_IDENTIFIED_UNWANTED_PROGRAM,
          relationships.USER_OWNS_SCAN,
          relationships.SCAN_IDENTIFIED_FINDING,
          relationships.SCAN_IDENTIFIED_VULNERABILITY,
          relationships.FINDING_IS_VULNERABILITY,
        ],
        dependsOn: [StepIds.ACCOUNT],
        executionHandler,
      },
    ],
  };
