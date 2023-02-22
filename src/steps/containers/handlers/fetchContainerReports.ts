import {
  createDirectRelationship,
  Entity,
  getRawData,
  IntegrationStepExecutionContext,
  JobState,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../config';
import { Entities, StepIds } from '../../constants';
import {
  containerFindingEntityKey,
  createReportUnwantedProgramRelationship,
  createMalwareEntity,
  createReportMalwareRelationship,
  createUnwantedProgramEntity,
  malwareEntityKey,
  unwantedProgramEntityKey,
} from '../converters';
import TenableClient from '../../../tenable/TenableClient';
import { ContainerImage, ContainerReport } from '../../../tenable/client';
import {
  createContainerFindingEntity,
  createContainerReportRelationship,
  createReportEntity,
  createReportFindingRelationship,
} from '../converters';
import DuplicateKeysCounter from '../../../utils/duplicateKeysCounter';

interface ProcessRelatedEntityParams {
  report: ContainerReport;
  jobState: JobState;
  imageEntity: Entity;
  duplicateKeys: DuplicateKeysCounter;
}

async function processFindings({
  report,
  jobState,
  imageEntity,
  duplicateKeys,
}: ProcessRelatedEntityParams) {
  for (const finding of report.findings) {
    const findingKey = containerFindingEntityKey(finding);
    let findingEntity = await jobState.findEntity(findingKey);

    if (!findingEntity) {
      findingEntity = await jobState.addEntity(
        createContainerFindingEntity(finding),
      );
    }

    const reportFindingRelationship = createReportFindingRelationship(
      report.sha256,
      finding,
    );

    if (!jobState.hasKey(reportFindingRelationship._key)) {
      await jobState.addRelationship(reportFindingRelationship);
    } else {
      duplicateKeys.add(reportFindingRelationship._type);
    }

    const imageFindingRelationship = createDirectRelationship({
      from: imageEntity,
      _class: RelationshipClass.HAS,
      to: findingEntity,
    });

    if (!jobState.hasKey(imageFindingRelationship._key)) {
      await jobState.addRelationship(imageFindingRelationship);
    } else {
      duplicateKeys.add(imageFindingRelationship._type);
    }
  }
}

async function processMalwares({
  report,
  jobState,
  imageEntity,
  duplicateKeys,
}: ProcessRelatedEntityParams) {
  for (const malware of report.malware) {
    const malwareKey = malwareEntityKey(malware);
    let malwareEntity = await jobState.findEntity(malwareKey);

    if (!malwareEntity) {
      malwareEntity = await jobState.addEntity(createMalwareEntity(malware));
    }

    const reportMalwareRelationship = createReportMalwareRelationship(
      report.sha256,
      malware,
    );
    if (!jobState.hasKey(reportMalwareRelationship._key)) {
      await jobState.addRelationship(reportMalwareRelationship);
    } else {
      duplicateKeys.add(reportMalwareRelationship._type);
    }

    const imageMalwareRelationship = createDirectRelationship({
      from: imageEntity,
      _class: RelationshipClass.HAS,
      to: malwareEntity,
    });

    if (!jobState.hasKey(imageMalwareRelationship._key)) {
      await jobState.addRelationship(imageMalwareRelationship);
    } else {
      duplicateKeys.add(imageMalwareRelationship._type);
    }
  }
}

async function processPrograms({
  report,
  jobState,
  imageEntity,
  duplicateKeys,
}: ProcessRelatedEntityParams) {
  for (const program of report.potentially_unwanted_programs) {
    const programKey = unwantedProgramEntityKey(program);
    let programEntity = await jobState.findEntity(programKey);

    if (!programEntity) {
      programEntity = await jobState.addEntity(
        createUnwantedProgramEntity(program),
      );
    }

    const reportUnwantedProgramRelationship =
      createReportUnwantedProgramRelationship(report.sha256, program);

    if (!jobState.hasKey(reportUnwantedProgramRelationship._key)) {
      await jobState.addRelationship(reportUnwantedProgramRelationship);
    } else {
      duplicateKeys.add(reportUnwantedProgramRelationship._type);
    }

    const imageProgramRelationship = createDirectRelationship({
      from: imageEntity,
      _class: RelationshipClass.HAS,
      to: programEntity,
    });

    if (!jobState.hasKey(imageProgramRelationship._key)) {
      await jobState.addRelationship(imageProgramRelationship);
    } else {
      duplicateKeys.add(imageProgramRelationship._type);
    }
  }
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
  const duplicateKeys = new DuplicateKeysCounter();

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

      const reportEntity = createReportEntity(report);
      if (!jobState.hasKey(reportEntity._key)) {
        await jobState.addEntity(reportEntity);
        await jobState.addRelationship(
          createContainerReportRelationship(image, report),
        );
      } else {
        duplicateKeys.add(reportEntity._type);
      }

      const processParams: ProcessRelatedEntityParams = {
        report,
        jobState,
        imageEntity,
        duplicateKeys,
      };
      await processFindings(processParams);
      await processMalwares(processParams);
      await processPrograms(processParams);
    },
  );

  if (duplicateKeys.getTotalCount() > 0) {
    logger.info(
      { duplicateKeysEncountered: duplicateKeys.getObject() },
      `Found duplicate keys in step: ${StepIds.CONTAINER_REPORTS}`,
    );
  }
}
