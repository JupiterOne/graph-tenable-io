import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { TenableIntegrationConfig } from '../../../../src/config';
import { StepSpec } from '../types';

export const serviceSpec: StepSpec<TenableIntegrationConfig>[] = [
  {
    /**
     * ENDPOINT: <n/a>
     * PATTERN: Singleton
     */
    id: 'step-service',
    name: 'Fetch Service Details',
    entities: [
      {
        resourceName: 'Service',
        _class: ['Service'],
        _type: 'tenable_scanner',
      },
    ],
    relationships: [
      {
        _type: 'tenable_account_provides_scanner',
        sourceType: 'tenable_account',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_scanner',
      },
    ],
    dependsOn: ['step-account'],
    implemented: true,
  },
];
