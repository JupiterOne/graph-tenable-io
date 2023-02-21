import {
  createDirectRelationship,
  getRawData,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../config';
import { Entities } from '../../constants';
import { ContainerImage } from '../../../tenable/client';
import { generateEntityKey } from '../../../utils/generateKey';

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
