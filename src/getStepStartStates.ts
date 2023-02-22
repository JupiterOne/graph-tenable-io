import {
  IntegrationExecutionContext,
  StepStartStates,
  IntegrationStep,
  DisabledStepReason,
} from '@jupiterone/integration-sdk-core';
import { integrationSteps } from './steps';
import { StepIds } from './steps/constants';

import { IntegrationConfig } from './config';
import TenableClient from './tenable/TenableClient';

const SCAN_MANAGER_ROLE = 40;

function getDefaultStepStartStates(
  steps: IntegrationStep<IntegrationConfig>[],
): StepStartStates {
  return steps.reduce(
    (states: StepStartStates, step: IntegrationStep<IntegrationConfig>) => ({
      ...states,
      [step.id]: { disabled: false },
    }),
    {},
  );
}

function hasScanManagerRole(permission: number) {
  return permission >= SCAN_MANAGER_ROLE;
}

export default async function getStepStartStates(
  executionContext: IntegrationExecutionContext<IntegrationConfig>,
): Promise<StepStartStates> {
  const {
    logger,
    instance: { config },
  } = executionContext;
  const provider = new TenableClient({
    logger,
    accessToken: config.accessKey,
    secretToken: config.secretKey,
  });

  const defaultStates = getDefaultStepStartStates(integrationSteps);

  try {
    const permissionsResponse = await provider.fetchUserPermissions();
    const hasScanPermission = hasScanManagerRole(
      permissionsResponse.permissions,
    );

    return {
      ...defaultStates,
      [StepIds.SCANNER_IDS]: {
        disabled: !hasScanPermission,
        disabledReason: DisabledStepReason.PERMISSION,
      },
      [StepIds.AGENTS]: {
        disabled: !hasScanPermission,
        disabledReason: DisabledStepReason.PERMISSION,
      },
    };
  } catch (err) {
    return defaultStates;
  }
}
