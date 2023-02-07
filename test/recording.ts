import {
  mutations,
  Recording,
  setupRecording,
  SetupRecordingInput,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../src/config';
import _ from 'lodash';

export { Recording };

export function setupTenableRecording(input: SetupRecordingInput) {
  return setupRecording({
    redactedRequestHeaders: ['x-apikeys'],
    ...input,
    mutateEntry: (entry) => {
      redact(entry);
    },
  });
}

function redactValuesDeep(obj, keysMap: Map<String, any>) {
  return _.transform(obj, function (result: any, value: any, key: string) {
    // transform to a new object
    const newValue = keysMap.get(key) || value; // if the key is in keysMap use the replacement value, if not use the original key's value
    if (_.isArray(value)) {
      if (keysMap.has(key)) {
        // the key whose value is array is to be redacted, set each element to target redacted value
        result[key] = value.map(() => newValue);
      } else {
        result[key] = redactValuesDeep(value, keysMap); // redact value to handle nested objects/arrays
      }
    } else if (_.isObject(value)) {
      result[key] = redactValuesDeep(value, keysMap); // if value for key is an object, deepRedact it
    } else {
      result[key] = newValue; // neither object or array, set to newValue
    }
  });
}

function redact(entry): void {
  mutations.unzipGzippedRecordingEntry(entry);

  const DEFAULT_REDACT = '[REDACTED]';

  const keysToRedactMap = new Map();
  keysToRedactMap.set('ipv4s', DEFAULT_REDACT);
  keysToRedactMap.set('ipv6s', DEFAULT_REDACT);
  keysToRedactMap.set('mac_addresses', DEFAULT_REDACT);
  keysToRedactMap.set('mac_address', DEFAULT_REDACT);
  keysToRedactMap.set('ipv4', DEFAULT_REDACT);
  keysToRedactMap.set('ipv6', DEFAULT_REDACT);
  keysToRedactMap.set('output', DEFAULT_REDACT);
  keysToRedactMap.set('ip', DEFAULT_REDACT);

  const response = JSON.parse(entry.response.content.text);
  if (_.isArray(response)) {
    response.forEach((responseValue, responseIndex) => {
      response[responseIndex] = redactValuesDeep(
        responseValue,
        keysToRedactMap,
      );
    });
  } else {
    Object.keys(response).forEach((key) => {
      response[key] = redactValuesDeep(response[key], keysToRedactMap);
    });
  }
  entry.response.content.text = JSON.stringify(response);
}

type MatchRequestsBy =
  Required<SetupRecordingInput>['options']['matchRequestsBy'];

export function getTenableMatchRequestsBy(
  config: IntegrationConfig,
  options?: MatchRequestsBy,
): MatchRequestsBy {
  return {
    headers: false,
    url: true,
    ...options,
  };
}
