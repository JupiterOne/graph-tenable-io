import { IntegrationConfig } from '../../config';
import {
  ExportVulnerabilitiesFilter,
  VulnerabilitySeverity,
  VulnerabilityState,
} from '../../tenable/client';
import { getUnixTime, sub } from 'date-fns';

function parseVulnerabilitySeverities(severities: string) {
  return severities
    .split(',')
    .map((severity) => severity.toLowerCase() as VulnerabilitySeverity);
}

function parseVulnerabilityStates(states: string) {
  return states
    .split(',')
    .map((state) => state.toLowerCase() as VulnerabilityState);
}

export function buildFilters(
  config: IntegrationConfig,
): ExportVulnerabilitiesFilter {
  return {
    since: getUnixTime(sub(Date.now(), { days: 35 })),
    ...(config.vulnerabilitySeverities && {
      severity: parseVulnerabilitySeverities(config.vulnerabilitySeverities),
    }),
    ...(config.vulnerabilityStates && {
      state: parseVulnerabilityStates(config.vulnerabilityStates),
    }),
  };
}
