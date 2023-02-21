import { IntegrationStepExecutionContext } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../config';
import {
  createContainerRepositoryEntity,
  createAccountContainerRepositoryRelationship,
} from '../converters';
import { getAccount } from '../../account/util';
import TenableClient from '../../../tenable/TenableClient';

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
