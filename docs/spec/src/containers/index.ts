import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { TenableIntegrationConfig } from '../../../../src/config';
import { StepSpec } from '../types';

export const containerSpec: StepSpec<TenableIntegrationConfig>[] = [
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/container-security/api/v1/container/list
     * PATTERN: Fetch Entities
     */
    id: 'step-containers',
    name: 'Fetch Containers',
    entities: [
      {
        resourceName: 'Container',
        _class: ['Image'],
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
    dependsOn: ['step-account'],
    implemented: true,
  },
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/container-security/api/v1/reports/by_image_digest?image_digest=${digestId}
     * PATTERN: Fetch Child Entities
     */
    id: 'step-container-reports',
    name: 'Fetch Container Reports',
    entities: [
      {
        resourceName: 'Container Report',
        _class: ['Assessment'],
        _type: 'tenable_container_report',
      },
      {
        resourceName: 'Container Finding',
        _class: ['Finding'],
        _type: 'tenable_container_finding',
      },
      {
        resourceName: 'Container Malware',
        _class: ['Finding'],
        _type: 'tenable_container_malware',
      },
      {
        resourceName: 'Container Unwanted Program',
        _class: ['Finding'],
        _type: 'tenable_container_unwanted_program',
      },
    ],
    relationships: [
      {
        _type: 'tenable_container_has_container_report',
        sourceType: 'tenable_container',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_container_report',
      },
      {
        _type: 'tenable_container_report_identified_finding',
        sourceType: 'tenable_container_report',
        _class: RelationshipClass.IDENTIFIED,
        targetType: 'tenable_container_finding',
      },
      {
        _type: 'tenable_container_report_identified_malware',
        sourceType: 'tenable_container_report',
        _class: RelationshipClass.IDENTIFIED,
        targetType: 'tenable_container_malware',
      },
      {
        _type: 'tenable_container_report_identified_unwanted_program',
        sourceType: 'tenable_container_report',
        _class: RelationshipClass.IDENTIFIED,
        targetType: 'tenable_container_unwanted_program',
      },
    ],
    dependsOn: ['step-containers'],
    implemented: true,
  },
];
