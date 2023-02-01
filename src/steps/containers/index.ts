import {
  createDirectRelationship,
  Entity,
  getRawData,
  IntegrationStepExecutionContext,
  RelationshipClass,
  Step,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../config';
import {
  Entities,
  Relationships,
  SERVICE_ENTITY_DATA_KEY,
  StepIds,
} from '../../constants';
import {
  containerFindingEntityKey,
  createReportUnwantedProgramRelationship,
  createMalwareEntity,
  createReportMalwareRelationship,
  createUnwantedProgramEntity,
  malwareEntityKey,
  unwantedProgramEntityKey,
  createContainerRepositoryEntity,
  createAccountContainerRepositoryRelationship,
} from './converters';
import { getAccount } from '../../initializeContext';
import TenableClient from '../../tenable/TenableClient';
import { ContainerImage } from '../../tenable/client';
import {
  createAccountContainerImageRelationship,
  createContainerImageEntity,
  createContainerFindingEntity,
  createContainerReportRelationship,
  createReportEntity,
  createReportFindingRelationship,
} from './converters';
import { generateEntityKey } from '../../utils/generateKey';

export async function fetchContainerRepositories(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Promise<void> {
  const {
    jobState,
    logger,
    instance: {
      config: { accessKey, secretKey },
    },
  } = context;
  const client = new TenableClient({
    logger,
    accessToken: accessKey,
    secretToken: secretKey,
  });

  const account = getAccount(context);
  await client.iterateContainerRepositories(async (repository) => {
    await jobState.addEntity(createContainerRepositoryEntity(repository));
    await jobState.addRelationship(
      createAccountContainerRepositoryRelationship(account, repository),
    );
  });
}

export async function fetchContainerImages(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Promise<void> {
  const { jobState, logger, instance } = context;
  const client = new TenableClient({
    logger: logger,
    accessToken: instance.config.accessKey,
    secretToken: instance.config.secretKey,
  });

  const serviceEntity = (await jobState.getData(
    SERVICE_ENTITY_DATA_KEY,
  )) as Entity;

  const account = getAccount(context);
  await client.iterateContainerImages(async (image) => {
    const imageEntity = createContainerImageEntity(image);
    await Promise.all([
      jobState.addEntity(imageEntity),
      jobState.addRelationship(
        createAccountContainerImageRelationship(account, image),
      ),
      jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.SCANS,
          from: serviceEntity,
          to: imageEntity,
        }),
      ),
    ]);
  });
}

export async function buildRepositoryImagesRelationship(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Promise<void> {
  const { jobState, logger } = context;

  await jobState.iterateEntities(
    { _type: Entities.CONTAINER_IMAGE._type },
    async (imageEntity) => {
      const image = getRawData<ContainerImage>(imageEntity);

      if (!image) {
        logger.warn(
          {
            _key: imageEntity._key,
          },
          'Could not fetch raw data for container image entity',
        );
        return;
      }
      const { repoName } = image;
      const repoEntity = await jobState.findEntity(
        generateEntityKey(Entities.CONTAINER_REPOSITORY._type, repoName),
      );
      if (repoEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: repoEntity,
            to: imageEntity,
          }),
        );
      }
    },
  );
}

export async function fetchContainerReports(
  context: IntegrationStepExecutionContext<IntegrationConfig>,
): Promise<void> {
  const { jobState, logger, instance } = context;
  const client = new TenableClient({
    logger: logger,
    accessToken: instance.config.accessKey,
    secretToken: instance.config.secretKey,
  });

  await jobState.iterateEntities(
    { _type: Entities.CONTAINER_IMAGE._type },
    async (imageEntity) => {
      const image = getRawData<ContainerImage>(imageEntity);

      if (!image) {
        logger.warn(
          {
            _key: imageEntity._key,
          },
          'Could not fetch raw data for container image entity',
        );
        return;
      }
      const { repoName, name: imageName, tag } = image;
      const report = await client.fetchContainerImageReport(
        repoName,
        imageName,
        tag,
      );
      await jobState.addEntity(createReportEntity(report));
      await jobState.addRelationship(
        createContainerReportRelationship(image, report),
      );

      for (const finding of report.findings) {
        const findingKey = containerFindingEntityKey(finding);
        let findingEntity = await jobState.findEntity(findingKey);

        if (!findingEntity) {
          findingEntity = await jobState.addEntity(
            createContainerFindingEntity(finding),
          );
        }

        await jobState.addRelationship(
          createReportFindingRelationship(report.sha256, finding),
        );
        await jobState.addRelationship(
          createDirectRelationship({
            from: imageEntity,
            _class: RelationshipClass.HAS,
            to: findingEntity,
          }),
        );
      }

      for (const malware of report.malware) {
        const malwareKey = malwareEntityKey(malware);
        let malwareEntity = await jobState.findEntity(malwareKey);

        if (!malwareEntity) {
          malwareEntity = await jobState.addEntity(
            createMalwareEntity(malware),
          );
        }

        await jobState.addRelationship(
          createReportMalwareRelationship(report.sha256, malware),
        );
        await jobState.addRelationship(
          createDirectRelationship({
            from: imageEntity,
            _class: RelationshipClass.HAS,
            to: malwareEntity,
          }),
        );
      }

      for (const program of report.potentially_unwanted_programs) {
        const programKey = unwantedProgramEntityKey(program);
        let programEntity = await jobState.findEntity(programKey);

        if (!programEntity) {
          programEntity = await jobState.addEntity(
            createUnwantedProgramEntity(program),
          );
        }

        await jobState.addRelationship(
          createReportUnwantedProgramRelationship(report.sha256, program),
        );
        await jobState.addRelationship(
          createDirectRelationship({
            from: imageEntity,
            _class: RelationshipClass.HAS,
            to: programEntity,
          }),
        );
      }
    },
  );
}

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
