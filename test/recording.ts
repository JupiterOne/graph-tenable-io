import {
  Recording,
  setupRecording,
  SetupRecordingInput,
} from '@jupiterone/integration-sdk-testing';
import { TenableIntegrationConfig } from '../src/config';

export { Recording };

export function setupTenableRecording(input: SetupRecordingInput) {
  return setupRecording({
    redactedRequestHeaders: ['x-apikeys'],
    ...input,
  });
}

type MatchRequestsBy =
  Required<SetupRecordingInput>['options']['matchRequestsBy'];

export function getTenableMatchRequestsBy(
  config: TenableIntegrationConfig,
  options?: MatchRequestsBy,
): MatchRequestsBy {
  return {
    headers: false,
    url: true,
    ...options,
  };
}
