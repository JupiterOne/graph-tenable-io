import { IntegrationConfig } from '../../config';
import {
  ExportComplianceFindingsFilter,
  complianceChunkState,
  complianceChunkResult,
} from '../../tenable/client';
import { subDays, getUnixTime } from 'date-fns';

const DEFAULT_STATES: complianceChunkState[] = ['OPEN', 'REOPENED', 'FIXED'];
const DEFAULT_RESULTS: complianceChunkResult[] = [
  'PASSED',
  'FAILED',
  'WARNING',
  'SKIPPED',
  'UNKNOWN',
  'ERROR',
];
const DEFAULT_LAST_SEEN_DAYS = 30; // Default to 30 days if not provided

function parseComplianceStates(states: string): complianceChunkState[] {
  return states.split(',') as complianceChunkState[];
}

function parseComplianceResults(results: string): complianceChunkResult[] {
  return results.split(',') as complianceChunkResult[];
}

function calculateLastSeenTimestamp(daysAgo: number): number {
  const lastSeenDate = subDays(new Date(), daysAgo);
  return getUnixTime(lastSeenDate);
}

export function buildComplianceFilters(
  config: IntegrationConfig,
): ExportComplianceFindingsFilter {
  const lastSeenDays = config.lastSeen
    ? Number(config.lastSeen)
    : DEFAULT_LAST_SEEN_DAYS;
  if (isNaN(lastSeenDays)) {
    throw new Error(`Invalid lastSeen value: ${config.lastSeen}`);
  }

  const lastSeenTimestamp = calculateLastSeenTimestamp(lastSeenDays);

  return {
    state: config.complianceState
      ? parseComplianceStates(config.complianceState)
      : DEFAULT_STATES,
    compliance_results: config.complianceResults
      ? parseComplianceResults(config.complianceResults)
      : DEFAULT_RESULTS,
    last_seen: lastSeenTimestamp,
  };
}
