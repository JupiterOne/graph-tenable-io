import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../../src/config';
import { StepSpec } from '../types';

export const containerSpec: StepSpec<IntegrationConfig>[] = [
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/container-security/api/v2/repositories
     * PATTERN: Fetch Entities
     */
    id: 'step-container-repositories',
    name: 'Fetch Container Repositories',
    entities: [
      {
        resourceName: 'Container Repository',
        _class: ['Repository'],
        _type: 'tenable_container_repository',
      },
    ],
    relationships: [
      {
        _type: 'tenable_account_has_container_repository',
        sourceType: 'tenable_account',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_container_repository',
      },
    ],
    dependsOn: ['step-account'],
    implemented: true,
  },
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/container-security/api/v2/images
     * PATTERN: Fetch Entities
     */
    id: 'step-container-images',
    name: 'Fetch Container Images',
    entities: [
      {
        resourceName: 'Container Image',
        _class: ['Image'],
        _type: 'tenable_container_image',
      },
    ],
    relationships: [
      {
        _type: 'tenable_account_has_container_image',
        sourceType: 'tenable_account',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_container_image',
      },
      {
        _type: 'tenable_scanner_scans_container_image',
        sourceType: 'tenable_scanner',
        _class: RelationshipClass.SCANS,
        targetType: 'tenable_container_image',
      },
    ],
    dependsOn: ['step-account', 'step-service'],
    implemented: true,
  },
  {
    /**
     * PATTERN: Fetch Child Relationships
     */
    id: 'build-repository-images-relationships',
    name: 'Build Repository Images Relationships',
    entities: [],
    relationships: [
      {
        _type: 'tenable_container_repository_has_image',
        sourceType: 'tenable_container_repository',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_container_image',
      },
    ],
    dependsOn: ['step-container-images', 'step-container-repositories'],
    implemented: true,
  },
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/container-security/api/v2/reports/${container_repository}/${container_image}/${container_image_tag}
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
        _type: 'tenable_container_image_has_report',
        sourceType: 'tenable_container_image',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_container_report',
      },
      {
        _type: 'tenable_container_image_has_finding',
        sourceType: 'tenable_container_image',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_container_finding',
      },
      {
        _type: 'tenable_container_image_has_malware',
        sourceType: 'tenable_container_image',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_container_malware',
      },
      {
        _type: 'tenable_container_image_has_unwanted_program',
        sourceType: 'tenable_container_image',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_container_unwanted_program',
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
    dependsOn: ['step-container-images'],
    implemented: true,
  },
];
