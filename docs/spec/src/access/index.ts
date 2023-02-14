import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../../src/config';
import { StepSpec } from '../types';

export const accessSpec: StepSpec<IntegrationConfig>[] = [
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/users
     * PATTERN: Fetch Entities
     */
    id: 'step-users',
    name: 'Fetch Users',
    entities: [
      {
        resourceName: 'User',
        _class: ['User'],
        _type: 'tenable_user',
      },
    ],
    relationships: [
      {
        _type: 'tenable_account_has_user',
        sourceType: 'tenable_account',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_user',
      },
    ],
    dependsOn: ['step-account'],
    implemented: true,
  },
];
