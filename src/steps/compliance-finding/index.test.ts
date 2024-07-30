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

describe.skip('step-compliance-findings', () => {
  test('success', async () => {
    recording = setupTenableRecording({
      name: 'step-compliance-findings',
      directory: __dirname,
      options: {
        recordFailedRequests: false,
        matchRequestsBy: {
          order: true,
        },
      },
    });

    const stepConfig = buildStepTestConfig(StepIds.COMPLIANCE_FINDINGS);
    const stepResults = await executeStepWithDependencies(stepConfig);
    expect(stepResults).toMatchStepMetadata(stepConfig);
  });
});

describe.skip('build-asset-compliance-findings-relationships', () => {
  test('success', async () => {
    recording = setupTenableRecording({
      name: 'build-asset-compliance-findings-relationships',
      directory: __dirname,
      options: {
        recordFailedRequests: false,
        matchRequestsBy: {
          order: true,
        },
      },
    });

    const stepConfig = buildStepTestConfig(
      StepIds.ASSET_COMPLIANCE_FINDINGS_RELATIONSHIPS,
    );
    const stepResults = await executeStepWithDependencies(stepConfig);
    expect(stepResults).toMatchStepMetadata(stepConfig);
  });
});
