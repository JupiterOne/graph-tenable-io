import {
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../config';
import { Entities, Relationships, StepIds } from '../constants';
import {
  buildRepositoryImagesRelationship,
  fetchContainerImages,
  fetchContainerReports,
  fetchContainerRepositories,
} from './handlers';

export const containerSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: StepIds.CONTAINER_REPOSITORIES,
    name: 'Fetch Container Repositories',
    entities: [Entities.CONTAINER_REPOSITORY],
    relationships: [Relationships.ACCOUNT_HAS_CONTAINER_REPOSITORY],
    dependsOn: [StepIds.ACCOUNT],
    executionHandler: fetchContainerRepositories,
  },
  {
    id: StepIds.CONTAINER_IMAGES,
    name: 'Fetch Container Images',
    entities: [Entities.CONTAINER_IMAGE],
    relationships: [
      Relationships.ACCOUNT_HAS_CONTAINER_IMAGE,
      Relationships.SERVICE_SCANS_CONTAINER_IMAGE,
    ],
    dependsOn: [StepIds.ACCOUNT, StepIds.SERVICE],
    executionHandler: fetchContainerImages,
  },
  {
    id: StepIds.REPOSITORY_IMAGES_RELATIONSHIPS,
    name: 'Build Repository Images Relationships',
    entities: [],
    relationships: [Relationships.CONTAINER_REPOSITORY_HAS_IMAGE],
    dependsOn: [StepIds.CONTAINER_IMAGES, StepIds.CONTAINER_REPOSITORIES],
    executionHandler: buildRepositoryImagesRelationship,
  },
  {
    id: StepIds.CONTAINER_REPORTS,
    name: 'Fetch Container Reports',
    entities: [
      Entities.CONTAINER_REPORT,
      Entities.CONTAINER_FINDING,
      Entities.CONTAINER_MALWARE,
      Entities.CONTAINER_UNWANTED_PROGRAM,
    ],
    relationships: [
      Relationships.CONTAINER_IMAGE_HAS_REPORT,
      Relationships.CONTAINER_IMAGE_HAS_FINDING,
      Relationships.CONTAINER_IMAGE_HAS_MALWARE,
      Relationships.CONTAINER_IMAGE_HAS_UNWANTED_PROGRAM,
      Relationships.REPORT_IDENTIFIED_FINDING,
      Relationships.REPORT_IDENTIFIED_MALWARE,
      Relationships.REPORT_IDENTIFIED_UNWANTED_PROGRAM,
    ],
    mappedRelationships: [],
    dependsOn: [StepIds.CONTAINER_IMAGES],
    executionHandler: fetchContainerReports,
  },
];
