import {
  getRawData,
  IntegrationError,
  IntegrationStepExecutionContext,
  Step,
} from '@jupiterone/integration-sdk-core';
import { TenableIntegrationConfig } from '../../config';
import { entities, relationships, SetDataKeys, StepIds } from '../../constants';
import { createAssetExportCache } from '../../tenable/createAssetExportCache';
import { createVulnerabilityExportCache } from '../../tenable/createVulnerabilityExportCache';
import TenableClient from '../../tenable/TenableClient';
import {
  RecentScanSummary,
  ScanStatus,
  User,
  VulnerabilityExport,
} from '../../tenable/types';
import {
  createScanEntity,
  createScanFindingRelationship,
  createScanVulnerabilityRelationship,
  createUserScanRelationship,
  createVulnerabilityFindingEntity,
  createVulnerabilityFindingRelationship,
} from './converters';

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

export async function fetchScanDetails(
  context: IntegrationStepExecutionContext<TenableIntegrationConfig>,
): Promise<void> {
  const { jobState, logger, instance } = context;
  const provider = new TenableClient({
    logger: logger,
    accessToken: instance.config.accessKey,
    secretToken: instance.config.secretKey,
  });

  const assetCache = await createAssetExportCache(context.logger, provider);
  const vulnerabilityCache = await createVulnerabilityExportCache(
    context.logger,
    provider,
  );

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

      if (scan.status === ScanStatus.Completed) {
        const scanDetail = await provider.fetchScanDetail(scan);
        if (scanDetail) {
          if (scanDetail.vulnerabilities) {
            const vulnerabilities = scanDetail.vulnerabilities;
            for (const vuln of vulnerabilities) {
              await context.jobState.addRelationship(
                createScanVulnerabilityRelationship(scan, vuln),
              );
            }
          }
          // If the scan detail is archived any calls
          // to sync the host details will give a 404 until
          // we add the export functionality requested by
          // Tenable. POST /scans/scan_id/export
          if (scanDetail.hosts && !scanDetail.info.is_archived) {
            logger.info(
              {
                scanDetailHosts: scanDetail.hosts.length,
              },
              'Processing scan detail hosts...',
            );
            for (const host of scanDetail.hosts) {
              const scanHostVulnerabilities =
                await provider.fetchScanHostVulnerabilities(
                  scan.id,
                  host.host_id,
                );

              const hostAsset = assetCache.findAssetExportByUuid(host.uuid);

              /* istanbul ignore next */
              if (!hostAsset) {
                logger.info(
                  'No asset found for scan host, some details cannot be provided',
                );
              }

              /* istanbul ignore next */
              const assetUuid = hostAsset ? hostAsset.id : host.uuid;

              logger.info(
                {
                  assetUuid,
                  scanHostVulnerabilities: scanHostVulnerabilities.length,
                },
                'Processing host vulnerabilities discovered by recent scan...',
              );

              for (const vulnerability of scanHostVulnerabilities) {
                let vulnerabilityExport: VulnerabilityExport | undefined;
                /* istanbul ignore next */
                if (assetUuid) {
                  vulnerabilityExport =
                    vulnerabilityCache.findVulnerabilityExportByAssetPluginUuid(
                      assetUuid,
                      vulnerability.plugin_id,
                    );
                }

                await context.jobState.addEntity(
                  createVulnerabilityFindingEntity({
                    scan,
                    asset: hostAsset,
                    assetUuid,
                    vulnerability,
                    vulnerabilityExport,
                  }),
                );

                await context.jobState.addRelationship(
                  createVulnerabilityFindingRelationship({
                    scan,
                    assetUuid,
                    vulnerability,
                  }),
                );

                await context.jobState.addRelationship(
                  createScanFindingRelationship({
                    scan,
                    assetUuid,
                    vulnerability,
                  }),
                );
              }

              logger.info(
                'Processing host vulnerabilities discovered by recent scan completed.',
              );
            }
          }
        }
      }
    },
  );
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
    id: StepIds.SCAN_DETAILS,
    name: 'Fetch Scan Details',
    entities: [entities.VULNERABILITY, entities.VULN_FINDING],
    relationships: [
      relationships.SCAN_IDENTIFIED_FINDING,
      relationships.SCAN_IDENTIFIED_VULNERABILITY,
      relationships.FINDING_IS_VULNERABILITY,
    ],
    dependsOn: [StepIds.SCANS],
    executionHandler: fetchScanDetails,
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
