import { StepIds } from '../constants';
import { buildStepTestConfig } from '../../../test/config';
import { executeStepWithDependencies } from '@jupiterone/integration-sdk-testing';
import { setupTenableRecording, Recording } from '../../../test/recording';
import { DATA_SCANNER_IDS } from './constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('fetch-scanner-ids', () => {
  test('success', async () => {
    recording = setupTenableRecording({
      name: 'fetch-scanner-ids',
      directory: __dirname,
      options: {
        recordFailedRequests: false,
        matchRequestsBy: {
          order: true,
        },
      },
    });

    const stepConfig = buildStepTestConfig(StepIds.SCANNER_IDS);
    const stepResults = await executeStepWithDependencies(stepConfig);
    expect(stepResults).toMatchStepMetadata(stepConfig);

    const expectedScannerIds = [
      181821, 194954, 197777, 204516, 181822, 181823, 181824, 181825, 181826,
      181827, 181828, 181829, 181830, 181831, 199006, 207638,
    ];
    expect(stepResults.collectedData[DATA_SCANNER_IDS]).toBeDefined();
    expect(stepResults.collectedData[DATA_SCANNER_IDS]).toEqual(
      expect.arrayContaining(expectedScannerIds),
    );
  });
});
