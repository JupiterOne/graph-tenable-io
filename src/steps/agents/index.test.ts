// import {
//   createIntegrationEntity,
//   IntegrationLogger,
//   MappedRelationship,
//   Relationship,
// } from '@jupiterone/integration-sdk-core';
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
// import {
//   AssetExport,
//   VulnerabilityExportAsset,
//   VulnerabilityExportPlugin,
//   VulnerabilityExportPort,
//   VulnerabilityExportScan,
// } from '../../tenable/client';
import { fetchAgents } from '.';
import { config } from '../../../test/config';
import {
  setupTenableRecording,
  Recording,
  // getTenableMatchRequestsBy,
} from '../../../test/recording';
import { Entities, Relationships } from '../constants';
// import { v4 as uuid } from 'uuid';
// import { createAssetEntity, createVulnerabilityEntity } from './converters';
import { filterGraphObjects } from '../../../test/helpers/filterGraphObjects';
import { fetchAccount } from '../account';
import { fetchScannerIds } from '../scanners';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

// function generatePathnameFunction(toInsert: string) {
//   return (pathname: string) => {
//     return pathname.replace(
//       /\/scanners\/([0-9]|[a-z]|-)*\//g,
//       `/scanners/${toInsert}/`,
//     );
//   };
// }

describe('fetch-agents', () => {
  test('success', async () => {
    recording = setupTenableRecording({
      name: 'fetch-agents',
      directory: __dirname,
      options: {
        recordFailedRequests: false,
        matchRequestsBy: {
          url: {
            protocol: false,
            query: false,
          },
        },
      },
    });

    const context = createMockStepExecutionContext({
      instanceConfig: config,
    });
    await fetchAccount(context);
    await fetchScannerIds(context);
    await fetchAgents(context);

    const agentEntities = context.jobState.collectedEntities;

    expect(agentEntities.length).toBeGreaterThan(0);
    expect(agentEntities).toMatchGraphObjectSchema({
      _class: Entities.AGENT._class,
    });

    const { rest: accountAgentRelationships } = filterGraphObjects(
      context.jobState.collectedRelationships,
      (r) => !!r._mapping,
    );

    expect(accountAgentRelationships.length).toBe(agentEntities.length);
    expect(accountAgentRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: Relationships.ACCOUNT_HAS_AGENT._type },
        },
      },
    });
  });
});
