import {
  getRawData,
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import { TenableIntegrationConfig } from '../../config';
import { entities, relationships, StepIds } from '../../constants';
import {
  containerFindingEntityKey,
  createMalwareEntity,
  createReportMalwareRelationship,
  malwareEntityKey,
} from './converters';
import { getAccount } from '../../initializeContext';
import TenableClient from '../../tenable/TenableClient';
import { Container } from '../../tenable/types';
import {
  createAccountContainerRelationship,
  createContainerEntity,
  createContainerFindingEntity,
  createContainerReportRelationship,
  createReportEntity,
  createReportFindingRelationship,
} from './converters';

export async function fetchContainers(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Promise<void> {
  const { jobState, logger, instance } = context;
  const client = new TenableClient({
    logger: logger,
    accessToken: instance.config.accessKey,
    secretToken: instance.config.secretKey,
  });

  const account = getAccount(context);
  const containers = await client.fetchContainers();
  for (const container of containers) {
    await jobState.addEntity(createContainerEntity(container));
    await jobState.addRelationship(
      createAccountContainerRelationship(account, container),
    );
  }
}

export async function fetchContainerReports(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Promise<void> {
  const { jobState, logger, instance } = context;
  const client = new TenableClient({
    logger: logger,
    accessToken: instance.config.accessKey,
    secretToken: instance.config.secretKey,
  });

  await jobState.iterateEntities(
    { _type: entities.CONTAINER._type },
    async (containerEntity) => {
      const container = getRawData<Container>(containerEntity);

      if (!container) {
        logger.warn(
          {
            _key: containerEntity._key,
          },
          'Could not fetch raw data for container entity',
        );
        return;
      }

      const report = await client.fetchReportByImageDigest(container.digest);
      await jobState.addEntity(createReportEntity(report));
      await jobState.addRelationship(
        createContainerReportRelationship(container, report),
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
      }
    },
  );
}

export const containerSteps: Step<
  IntegrationStepExecutionContext<TenableIntegrationConfig>
>[] = [
  {
    id: StepIds.CONTAINERS,
    name: 'Fetch Containers',
    entities: [entities.CONTAINER],
    relationships: [relationships.ACCOUNT_HAS_CONTAINER],
    dependsOn: [],
    executionHandler: fetchContainers,
  },
  {
    id: StepIds.CONTAINER_REPORTS,
    name: 'Fetch Container Reports',
    entities: [
      entities.CONTAINER_REPORT,
      entities.CONTAINER_FINDING,
      entities.CONTAINER_MALWARE,
    ],
    relationships: [
      relationships.CONTAINER_HAS_REPORT,
      relationships.REPORT_IDENTIFIED_FINDING,
      relationships.REPORT_IDENTIFIED_MALWARE,
    ],
    dependsOn: [StepIds.CONTAINERS],
    executionHandler: fetchContainerReports,
  },
];
