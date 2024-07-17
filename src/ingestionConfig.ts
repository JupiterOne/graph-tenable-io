import { IntegrationIngestionConfigFieldMap } from '@jupiterone/integration-sdk-core';
import { INGESTION_SOURCE_IDS } from './steps/constants';

export const ingestionConfig: IntegrationIngestionConfigFieldMap = {
  [INGESTION_SOURCE_IDS.ACCOUNT]: {
    title: 'Account',
    description: 'Tenable accounts',
    defaultsToDisabled: false,
  },
  [INGESTION_SOURCE_IDS.SERVICE]: {
    title: 'Service',
    description: 'Service descriptions',
    defaultsToDisabled: false,
  },
  [INGESTION_SOURCE_IDS.ASSETS]: {
    title: 'Assets',
    description: 'Asset descriptions',
    defaultsToDisabled: false,
  },
  [INGESTION_SOURCE_IDS.VULNERABILITIES]: {
    title: 'Vulnerabilities',
    description: 'Vulnerability descriptions',
    defaultsToDisabled: false,
  },
  [INGESTION_SOURCE_IDS.USERS]: {
    title: 'Users',
    description: 'User information',
    defaultsToDisabled: false,
  },
  [INGESTION_SOURCE_IDS.CONTAINER_IMAGES]: {
    title: 'Container Images',
    description: 'Container image descriptions',
    defaultsToDisabled: false,
  },
  [INGESTION_SOURCE_IDS.CONTAINER_REPOSITORIES]: {
    title: 'Container Repositories',
    description: 'Container repository descriptions',
    defaultsToDisabled: false,
  },
  [INGESTION_SOURCE_IDS.CONTAINER_REPORTS]: {
    title: 'Container Reports',
    description: 'Reports on container statuses',
    defaultsToDisabled: false,
  },
  [INGESTION_SOURCE_IDS.SCANNER_IDS]: {
    title: 'Scanner IDs',
    description: 'Scanner ID information',
    defaultsToDisabled: false,
  },
  [INGESTION_SOURCE_IDS.AGENTS]: {
    title: 'Agents',
    description: 'Agent information',
    defaultsToDisabled: false,
  },
  [INGESTION_SOURCE_IDS.COMPLIANCE_FINDINGS]: {
    title: 'Compliance Findings',
    description: 'Compliance findings',
    defaultsToDisabled: true,
  },
};
