import {
  IntegrationInstanceConfig,
  IntegrationInstanceConfigFieldMap,
} from '@jupiterone/integration-sdk-core';

export interface IntegrationConfig extends IntegrationInstanceConfig {
  accessKey: string;
  secretKey: string;
  vulnerabilityApiTimeoutInMinutes?: number;
  assetApiTimeoutInMinutes?: number;
}

export const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  accessKey: {
    type: 'string',
  },
  secretKey: {
    type: 'string',
    mask: true,
  },
  assetApiTimeoutInMinutes: {
    type: 'string',
  },
  vulnerabilityApiTimeoutInMinutes: {
    type: 'string',
  },
};
