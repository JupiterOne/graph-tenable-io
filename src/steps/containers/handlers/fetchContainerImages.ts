import {
  createDirectRelationship,
  Entity,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../config';
import { SERVICE_ENTITY_DATA_KEY } from '../../constants';
import { getAccount } from '../../account/util';
import TenableClient from '../../../tenable/TenableClient';
import {
  createAccountContainerImageRelationship,
  createContainerImageEntity,
} from '../converters';

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
