import {
  IntegrationStepExecutionContext,
  RelationshipClass,
  Step,
} from '@jupiterone/integration-sdk-core';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const executionHandler = () => {};

export const containerSpec: Step<IntegrationStepExecutionContext>[] = [
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/container-security/api/v1/container/list
     * PATTERN: Fetch Entities
     */
    id: 'fetch-containers',
    name: 'Fetch Containers',
    entities: [
      {
        resourceName: 'Container',
        _class: 'Image',
        _type: 'tenable_container',
      },
    ],
    relationships: [
      {
        _type: 'tenable_account_has_container',
        sourceType: 'tenable_account',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_container',
      },
    ],
    dependsOn: ['fetch-account'],
    executionHandler,
  },
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/container-security/api/v1/reports/by_image_digest?image_digest=${digestId}
     * PATTERN: Fetch Child Entities
     */
    id: 'fetch-container-reports',
    name: 'Fetch Container Reports',
    entities: [
      {
        resourceName: 'Container Report',
        _class: 'Assessment',
        _type: 'tenable_container_report',
      },
      {
        resourceName: 'Container Unwanted Program',
        _class: 'Finding',
        _type: 'tenable_container_unwanted_program',
      },
      {
        resourceName: 'Container Malware',
        _class: 'Finding',
        _type: 'tenable_container_malware',
      },
      {
        resourceName: 'Container Finding',
        _class: 'Finding',
        _type: 'tenable_container_finding',
      },
    ],
    relationships: [
      {
        _type: 'tenable_container_has_report',
        sourceType: 'tenable_container',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_container_report',
      },
      {
        _type: 'tenable_container_report_identified_unwanted_program',
        sourceType: 'tenable_container_report',
        _class: RelationshipClass.IDENTIFIED,
        targetType: 'tenable_container_unwanted_program',
      },
      {
        _type: 'tenable_container_report_identified_malware',
        sourceType: 'tenable_container_report',
        _class: RelationshipClass.IDENTIFIED,
        targetType: 'tenable_container_malware',
      },
      {
        _type: 'tenable_container_report_identified_finding',
        sourceType: 'tenable_container_report',
        _class: RelationshipClass.IDENTIFIED,
        targetType: 'tenable_container_finding',
      },
    ],
    dependsOn: ['fetch-containers'],
    executionHandler,
  },
];
