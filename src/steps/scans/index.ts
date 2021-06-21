import {
  getRawData,
  IntegrationError,
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import { TenableIntegrationConfig } from '../../config';
import { entities, relationships, SetDataKeys, StepIds } from '../../constants';
import TenableClient from '../../tenable/TenableClient';
import { RecentScanSummary, User } from '../../tenable/types';
import { createScanEntity, createUserScanRelationship } from './converters';

export async function fetchScans(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Promise<void> {
  const client = new TenableClient({
    logger: context.logger,
    accessToken: context.instance.config.accessKey,
    secretToken: context.instance.config.secretKey,
  });

  const scans = await client.fetchScans();

  for (const scan of scans) {
    await context.jobState.addEntity(createScanEntity(scan));
  }
}

export async function buildUserScanRelationships({
  jobState,
  logger,
}: IntegrationStepExecutionContext<TenableIntegrationConfig>): Promise<void> {
  const users = await jobState.getData<User[]>(SetDataKeys.USERS);

  if (!users) {
    logger.warn(
      {
        dataKey: SetDataKeys.USERS,
      },
      'Could not retrieve list of users from job state. Cannot build scan -> user relationships.',
    );
    throw new IntegrationError({
      code: 'MISSING_USER_DATA',
      message: 'Cannot build scan -> user relationships; user data is missing.',
    });
  }

  await jobState.iterateEntities(
    { _type: entities.SCAN._type },
    async (scanEntity) => {
      const scan = getRawData<RecentScanSummary>(scanEntity);
      if (!scan) {
        logger.warn(
          {
            scanKey: scanEntity._key,
          },
          'Could not get raw data from scan.',
        );
        return;
      }

      const user = findUser(users, scan.owner);

      if (!user) {
        logger.warn(
          {
            'scan.owner': scan.owner,
          },
          'Could not find scan owner by username',
        );
        return;
      }

      await jobState.addRelationship(createUserScanRelationship(user, scan));
    },
  );
  await jobState.setData(SetDataKeys.USERS, undefined);
}

function findUser(users: User[], username: string): User | undefined {
  return users.find((user) => user.username === username);
}

export const scanSteps: Step<
  IntegrationStepExecutionContext<TenableIntegrationConfig>
>[] = [
  {
    id: StepIds.SCANS,
    name: 'Fetch Scans',
    entities: [entities.SCAN],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchScans,
  },
  {
    id: StepIds.USER_SCAN_RELATIONSHIPS,
    name: 'Fetch User Scan Relationships',
    entities: [],
    relationships: [relationships.USER_OWNS_SCAN],
    dependsOn: [StepIds.SCANS, StepIds.USERS],
    executionHandler: buildUserScanRelationships,
  },
];
