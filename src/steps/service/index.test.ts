import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { config } from '../../../test/config';
import { setupTenableRecording, Recording } from '../../../test/recording';
import { Entities, Relationships } from '../constants';
import { fetchAccount } from '../account';
import { fetchServiceDetails } from '../service';

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

describe('fetch-service', () => {
  test('success', async () => {
    recording = setupTenableRecording({
      directory: __dirname,
      name: 'fetch-service',
    });

    const context = createMockStepExecutionContext({
      instanceConfig: config,
    });

    await fetchAccount(context);
    await fetchServiceDetails(context);

    const entities = context.jobState.collectedEntities;

    expect(entities.length).toBeGreaterThan(0);
    expect(
      entities.filter((e) => e._type === Entities.SERVICE._type),
    ).toMatchGraphObjectSchema({
      _class: Entities.SERVICE._class,
    });

    const relationships = context.jobState.collectedRelationships;
    const accountProvidesService = relationships.filter(
      (r) => r._type === 'tenable_account_provides_scanner',
    );

    expect(accountProvidesService.length).toBeGreaterThan(0);
    expect(accountProvidesService).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: Relationships.ACCOUNT_PROVIDES_SERVICE._type },
        },
      },
    });
  });
});
