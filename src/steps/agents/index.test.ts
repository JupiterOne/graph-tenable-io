jest.setTimeout(50000);

import { StepIds } from '../constants';
import { buildStepTestConfig } from '../../../test/config';
import { executeStepWithDependencies } from '@jupiterone/integration-sdk-testing';
import { setupTenableRecording, Recording } from '../../../test/recording';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('fetch-agents', () => {
  test('success', async () => {
    recording = setupTenableRecording({
      name: 'fetch-agents',
      directory: __dirname,
      options: {
        recordFailedRequests: false,
        matchRequestsBy: {
          order: true,
        },
      },
    });

    const stepConfig = buildStepTestConfig(StepIds.AGENTS);
    const stepResults = await executeStepWithDependencies(stepConfig);
    expect(stepResults).toMatchStepMetadata(stepConfig);
  });
});
