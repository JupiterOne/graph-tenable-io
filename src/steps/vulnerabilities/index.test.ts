import {
  createIntegrationEntity,
  getRawData,
  IntegrationLogger,
  MappedRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import {
  AssetExport,
  VulnerabilityExportAsset,
  VulnerabilityExportPlugin,
  VulnerabilityExportPort,
  VulnerabilityExportScan,
} from '../../tenable/client';
import {
  buildAssetVulnerabilityRelationships,
  buildVulnerabilityCveRelationships,
  fetchAssets,
  fetchVulnerabilities,
} from '.';
import { config } from '../../../test/config';
import {
  setupTenableRecording,
  Recording,
  getTenableMatchRequestsBy,
} from '../../../test/recording';
import { Entities, Relationships } from '../constants';
import { v4 as uuid } from 'uuid';
import { createAssetEntity, createVulnerabilityEntity } from './converters';
import { filterGraphObjects } from '../../../test/helpers/filterGraphObjects';
import * as Fetch from 'node-fetch';

jest.mock('@lifeomic/attempt', () => {
  // you MUST comment this block and add a large timeout (1 million ms to be safe) when re-recording tests
  const attempt = jest.requireActual('@lifeomic/attempt');
  return {
    ...attempt,
    sleep: () => Promise.resolve(),
  };
});

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

function generatePathnameFunction(toInsert: string) {
  return (pathname: string) => {
    return pathname.replace(
      /\/export\/([0-9]|[a-z]|-)*\//g,
      `/export/${toInsert}/`,
    );
  };
}

describe('fetch-assets', () => {
  test('success', async () => {
    recording = setupTenableRecording({
      directory: __dirname,
      name: 'fetch-assets',
      options: {
        matchRequestsBy: getTenableMatchRequestsBy(config, {
          url: {
            pathname: generatePathnameFunction(
              'd8ba52b9-829d-415d-bbf3-97efd375a187', // you MUST change this to the new export uuid if you re-record
            ),
          },
        }),
      },
    });

    const context = createMockStepExecutionContext({
      instanceConfig: config,
    });
    await fetchAssets(context);

    const assetEntities = context.jobState.collectedEntities;

    expect(assetEntities.length).toBeGreaterThan(0);
    expect(assetEntities).toMatchGraphObjectSchema({
      _class: Entities.ASSET._class,
    });

    const {
      targets: mappedAssetHostRelationships,
      rest: accountAssetRealtionships,
    } = filterGraphObjects(
      context.jobState.collectedRelationships,
      (r) => !!r._mapping,
    );

    expect(accountAssetRealtionships.length).toBe(assetEntities.length);
    expect(accountAssetRealtionships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: Relationships.ACCOUNT_HAS_ASSET._type },
        },
      },
    });

    const assetsThatShouldBeMapped = assetEntities.filter((v) => {
      const raw = getRawData<AssetExport>(v) as AssetExport;
      return (
        raw.aws_ec2_instance_id || raw.azure_resource_id || raw.gcp_instance_id
      );
    });

    expect(mappedAssetHostRelationships.length).toBe(
      assetsThatShouldBeMapped.length,
    );
  });

  describe('tenable_asset -> Host mapped relationships', () => {
    test('should create mapped relationships to azure_vm', async () => {
      recording = setupTenableRecording({
        directory: __dirname,
        name: 'fetch-assets::mapped-relationships::azure_vm',
        options: {
          matchRequestsBy: getTenableMatchRequestsBy(config, {
            url: {
              pathname: generatePathnameFunction(
                // you MUST change this to new export uuid if you re-record
                '1cbc9795-bd70-434a-92e1-b69db929a274',
              ),
            },
          }),
        },
      });

      function createAzureVmEntities(azureVmIds: string[]) {
        return azureVmIds.map((id) =>
          createIntegrationEntity({
            entityData: {
              source: {},
              assign: {
                // a few relevant properties from https://github.com/JupiterOne/graph-azure/blob/main/src/steps/resource-manager/compute/converters.ts#L33
                _class: ['Host'],
                _type: 'azure_vm',
                _key: id.toLocaleLowerCase(),
                id: id,
              },
            },
          }),
        );
      }

      const context = createMockStepExecutionContext({
        instanceConfig: config,
      });

      await fetchAssets(context);

      expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
      expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
        _class: Entities.ASSET._class,
      });

      const azureMappedRelationships = (
        context.jobState.collectedRelationships as MappedRelationship[]
      ).filter((m) => m._mapping?.targetEntity?._type === 'azure_vm');

      expect(azureMappedRelationships.length).toBeGreaterThan(0);
      expect(azureMappedRelationships).toTargetEntities(
        createAzureVmEntities([
          // These IDs copied directly from graph-azure `yarn j1-integration start -s rm-compute-virtual-machines`
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/tenable',
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourceGroups/J1DEV/providers/Microsoft.Compute/virtualMachines/tenable-nessus',
        ]),
      );
    });
  });
});

describe('fetch-vulnerabilities', () => {
  test('success', async () => {
    recording = setupTenableRecording({
      directory: __dirname,
      name: 'fetch-vulnerabilities',
      options: {
        matchRequestsBy: getTenableMatchRequestsBy(config, {
          url: {
            pathname: generatePathnameFunction(
              // you MUST change this to new export uuid if you re-record
              'f36739a5-d033-4ab5-b623-c97913251ac4',
            ),
          },
        }),
      },
    });

    const context = createMockStepExecutionContext({
      instanceConfig: config,
    });

    await fetchVulnerabilities(context);

    const vulnerabilityEntities = context.jobState.collectedEntities;
    expect(vulnerabilityEntities.length).toBe(101);

    /*     // TODO (INT-4010): add required props
    expect(vulnerabilityEntities).toMatchGraphObjectSchema({
      _class: Entities.VULNERABILITY._class,
    }); */
  });

  test('add vulnerability filters by config parameters', async () => {
    const testCombinations = [
      {
        severities: ['info', 'low', 'medium', 'high'],
        states: ['open', 'reopened', 'fixed'],
      },
      { severities: ['info', 'low', 'medium'], states: ['open', 'reopened'] },
      { severities: ['info', 'low'], states: ['open'] },
      { severities: ['info'], states: [] },
      { severities: [], states: ['open'] },
      { severities: [], states: [] },
    ];

    const fetchSpy = jest.spyOn(Fetch, 'default');

    for (const combination of testCombinations) {
      recording = setupTenableRecording({
        directory: __dirname,
        name: 'fetch-vulnerabilities',
        options: {
          matchRequestsBy: getTenableMatchRequestsBy(config, {
            url: {
              pathname: generatePathnameFunction(
                // you MUST change this to new export uuid if you re-record
                'f36739a5-d033-4ab5-b623-c97913251ac4',
              ),
            },
          }),
        },
      });

      const context = createMockStepExecutionContext({
        instanceConfig: {
          ...config,
          ...(combination.severities.length > 0 && {
            vulnerabilitySeverities: combination.severities.join(','),
          }),
          ...(combination.states.length > 0 && {
            vulnerabilityStates: combination.states.join(','),
          }),
        },
      });

      await fetchVulnerabilities(context);

      if (combination.severities.length > 0) {
        expect(fetchSpy.mock.calls[0][1]).toMatchObject({
          body: expect.stringContaining(
            `"severity":[${combination.severities
              .map((sev) => `"${sev}"`)
              .join(',')}]`,
          ),
        });
      } else {
        expect(fetchSpy.mock.calls[0][1]).toMatchObject({
          body: expect.not.stringContaining(`"severity":[`),
        });
      }

      if (combination.states.length > 0) {
        expect(fetchSpy.mock.calls[0][1]).toMatchObject({
          body: expect.stringContaining(
            `"state":[${combination.states
              .map((state) => `"${state}"`)
              .join(',')}]`,
          ),
        });
      } else {
        // When states value in instance config is undefined, pass default values.
        expect(fetchSpy.mock.calls[0][1]).toMatchObject({
          body: expect.stringContaining(`"state":["open","reopened","fixed"]`),
        });
      }
      await recording.stop();
      fetchSpy.mockClear();
    }
  });
});

describe('build-vuln-cve-relationships', () => {
  function createMockVulnerabilityEntity(options: { cves: string[] }) {
    return createVulnerabilityEntity(
      {
        asset: {
          uuid: '',
        } as VulnerabilityExportAsset,
        output: '',
        plugin: { cve: options.cves } as VulnerabilityExportPlugin,
        port: {} as VulnerabilityExportPort,
        scan: {} as VulnerabilityExportScan,
        severity: '',
        severity_default_id: 0,
        severity_id: 0,
        severity_modification_type: '',
        first_found: '',
        last_found: '',
        state: '',
      },
      jest.fn() as unknown as IntegrationLogger,
    );
  }

  test('success', async () => {
    const context = createMockStepExecutionContext({
      instanceConfig: config,
      entities: [createMockVulnerabilityEntity({ cves: ['CVE-2017-16114'] })],
    });

    await buildVulnerabilityCveRelationships(context);
    expect(context.jobState.collectedEntities).toHaveLength(0);

    expect(context.jobState.collectedRelationships).toHaveLength(1);
    expect(context.jobState.collectedRelationships).toTargetEntities([
      createIntegrationEntity({
        entityData: {
          source: {},
          assign: {
            _class: 'Vulnerability',
            _type: 'cve',
            _key: 'cve-2017-16114',
          },
        },
      }),
    ]);
  });
});

describe('build-asset-vuln-relationships', () => {
  function createMockVulnerabilityEntity(options: { assetId: string }) {
    return createVulnerabilityEntity(
      {
        asset: {
          uuid: options.assetId,
        } as VulnerabilityExportAsset,
        output: '',
        plugin: {} as VulnerabilityExportPlugin,
        port: {} as VulnerabilityExportPort,
        scan: {} as VulnerabilityExportScan,
        severity: '',
        severity_default_id: 0,
        severity_id: 0,
        severity_modification_type: '',
        first_found: '',
        last_found: '',
        state: '',
      },
      jest.fn() as unknown as IntegrationLogger,
    );
  }

  function createMockAssetEntity(options: {
    assetId: string;
    partial?: Partial<AssetExport>;
  }) {
    const partialAssetExport: Partial<AssetExport> = {
      id: options.assetId,
      ...options.partial,
    };
    return createAssetEntity(partialAssetExport as AssetExport);
  }

  function separateAssetVulnRelationships(
    collectedRelationships: Relationship[],
  ) {
    const { targets: mappedRelationships, rest: directRelationships } =
      filterGraphObjects(
        collectedRelationships,
        (r) => r._mapping !== undefined,
      );
    return {
      mappedRelationships,
      directRelationships,
    };
  }

  test('successfully maps all three CSP asset types', async () => {
    const ids = [uuid(), uuid(), uuid(), uuid()];
    const vulnEntities = ids.map((v) =>
      createMockVulnerabilityEntity({ assetId: v }),
    );
    const assetEntities = [
      createMockAssetEntity({
        assetId: ids[0],
        partial: { gcp_instance_id: uuid() },
      }),
      createMockAssetEntity({
        assetId: ids[1],
        partial: { aws_ec2_instance_id: uuid() },
      }),
      createMockAssetEntity({
        assetId: ids[2],
        partial: { azure_resource_id: uuid() },
      }),
      // entity without one of the properties above should not result
      // in mapped relationship
      createMockAssetEntity({
        assetId: ids[3],
      }),
    ];

    const context = createMockStepExecutionContext({
      instanceConfig: config,
      entities: [...vulnEntities, ...assetEntities],
    });

    await buildAssetVulnerabilityRelationships(context);

    expect(context.jobState.collectedEntities).toHaveLength(0);

    const { directRelationships, mappedRelationships } =
      separateAssetVulnRelationships(context.jobState.collectedRelationships);

    expect(directRelationships).toHaveLength(4);
    expect(directRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: Relationships.ASSET_HAS_VULN._type },
          _class: { const: Relationships.ASSET_HAS_VULN._class },
        },
      },
    });

    expect(mappedRelationships).toHaveLength(3);

    /**
     * The mapping here uses the same createTargetHostEntity() method used in fetchAssets
     * We already test the mapped relationship to host in the above test:
     *   fetch-assets
     *     ✓ success (55 ms)
     *     tenable_asset -> Host mapped relationships
     *       ✓ should create mapped relationships to azure_vm (30 ms)
     *
     * Because the target is tested above, we don't need to test here.
     */
    // expect(mappedRelationships).toTargetEntities([])
  });
});
