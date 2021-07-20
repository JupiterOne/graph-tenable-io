import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { fetchAssets } from '.';
import { config } from '../../../test/config';
import {
  setupTenableRecording,
  Recording,
  getTenableMatchRequestsBy,
} from '../../../test/recording';
import { SetDataKeys } from '../../constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
describe('fetch-assets', () => {
  test('success', async () => {
    recording = setupTenableRecording({
      directory: __dirname,
      name: 'fetch-assets',
      options: {
        matchRequestsBy: getTenableMatchRequestsBy(config),
      },
    });

    const context = createMockStepExecutionContext({
      instanceConfig: config,
    });

    await fetchAssets(context);

    expect(context.jobState.getData(SetDataKeys.ASSET_MAP)).not.toBeUndefined();
  });
});
