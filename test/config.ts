import * as dotenv from 'dotenv';
import * as path from 'path';
import { IntegrationConfig } from '../src/config';
import { StepTestConfig } from '@jupiterone/integration-sdk-testing';
import { invocationConfig } from '../src';
import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}

export function buildStepTestConfig(stepId: string): StepTestConfig {
  return {
    stepId,
    instanceConfig: config,
    invocationConfig: invocationConfig as IntegrationInvocationConfig,
  };
}

export const config: IntegrationConfig = {
  accessKey: process.env.ACCESS_KEY || 'accessKey',
  secretKey: process.env.SECRET_KEY || 'secretKey',
};
