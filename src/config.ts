import {
  IntegrationInstanceConfig,
  IntegrationInstanceConfigFieldMap,
} from '@jupiterone/integration-sdk-core';

export interface IntegrationConfig extends IntegrationInstanceConfig {
  accessKey: string;
  secretKey: string;
  vulnerabilityApiTimeoutInMinutes?: number;
  complianceApiTimeoutInMinutes?: number;
  assetApiTimeoutInMinutes?: number;
  vulnerabilitySeverities?: string;
  vulnerabilityStates?: string;
  complianceLastSeen?: string;
  complianceState?: string;
  complianceResult?: string;
  complianceNumFindings?: number;
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
  vulnerabilitySeverities: {
    type: 'string',
  },
  vulnerabilityStates: {
    type: 'string',
  },
  complianceLastSeen: {
    type: 'string',
  },
  complianceApiTimeoutInMinutes: {
    type: 'string',
  },
  complianceState: {
    type: 'string',
  },
  complianceResult: {
    type: 'string',
  },
  complianceNumFindings: {
    type: 'string',
  },
};
