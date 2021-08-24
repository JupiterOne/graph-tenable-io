import {
  IntegrationStepExecutionContext,
  RelationshipClass,
  Step,
} from '@jupiterone/integration-sdk-core';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const executionHandler = () => {};

export const accessSpec: Step<IntegrationStepExecutionContext>[] = [
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/users
     * PATTERN: Fetch Entities
     */
    id: 'fetch-users',
    name: 'Fetch Users',
    entities: [
      {
        resourceName: 'User',
        _class: 'User',
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
    dependsOn: ['fetch-account'],
    executionHandler,
  },
];
