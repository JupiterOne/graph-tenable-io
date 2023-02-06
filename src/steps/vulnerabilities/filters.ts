import { IntegrationConfig } from '../../config';
import {
  ExportVulnerabilitiesFilter,
  VulnerabilitySeverity,
  VulnerabilityState,
} from '../../tenable/client';
import { getUnixTime, sub } from 'date-fns';

const DEFAULT_STATES: VulnerabilityState[] = ['open', 'reopened', 'fixed'];

function parseVulnerabilitySeverities(severities: string) {
  return severities.split(',') as VulnerabilitySeverity[];
}

function parseVulnerabilityStates(states: string) {
  return states.split(',') as VulnerabilityState[];
}

export function buildFilters(
  config: IntegrationConfig,
): ExportVulnerabilitiesFilter {
  return {
    since: getUnixTime(sub(Date.now(), { days: 35 })),
    ...(config.vulnerabilitySeverities && {
      severity: parseVulnerabilitySeverities(config.vulnerabilitySeverities),
    }),
    ...{
      state: config.vulnerabilityStates
        ? parseVulnerabilityStates(config.vulnerabilityStates)
        : DEFAULT_STATES,
    },
  };
}
