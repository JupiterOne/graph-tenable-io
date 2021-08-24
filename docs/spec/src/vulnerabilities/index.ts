import {
  IntegrationStepExecutionContext,
  RelationshipClass,
  RelationshipDirection,
  Step,
} from '@jupiterone/integration-sdk-core';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const executionHandler = () => {};

export const vulnerabilitySpec: Step<IntegrationStepExecutionContext>[] = [
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/assets/export
     * PATTERN: Fetch Entities
     */
    id: 'fetch-assets',
    name: 'Fetch Assets',
    entities: [
      {
        resourceName: 'Asset',
        _class: 'HostAgent',
        _type: 'tenable_asset',
      },
    ],
    relationships: [
      {
        _type: 'tenable_account_has_asset',
        sourceType: 'tenable_account',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_asset',
      },
    ],
    dependsOn: ['fetch-account'],
    executionHandler,
  },
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/assets/export
     * PATTERN: Fetch Entities
     */
    id: 'fetch-assets',
    name: 'Fetch Assets',
    entities: [
      {
        resourceName: 'Asset',
        _class: 'HostAgent',
        _type: 'tenable_asset',
      },
    ],
    relationships: [
      {
        _type: 'tenable_account_has_asset',
        sourceType: 'tenable_account',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_asset',
      },
    ],
    dependsOn: ['fetch-account'],
    executionHandler,
  },
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/vulns/export
     * PATTERN: Fetch Entities
     */
    id: 'fetch-vulnerabilities',
    name: 'Fetch Vulnerabilties',
    entities: [
      {
        resourceName: 'Vulnerability',
        _class: 'Finding',
        _type: 'tenable_vulnerability',
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler,
  },
  {
    /**
     * ENDPOINT: n/a
     * PATTERN: Build Child Relationships
     */
    id: 'build-asset-vuln-relationships',
    name: 'Build Asset -> Vuln Relationships',
    entities: [],
    relationships: [
      {
        _type: 'tenable_asset_identified_vulnerability',
        sourceType: 'tenable_asset',
        _class: RelationshipClass.IDENTIFIED,
        targetType: 'tenable_vulnerability',
      },
    ],
    mappedRelationships: [
      {
        _type: 'tenable_asset_is_host',
        sourceType: 'tenable_asset',
        _class: RelationshipClass.IS,
        targetType: 'host',
        direction: RelationshipDirection.FORWARD,
      },
      {
        _type: 'host_has_tenable_vulnerability',
        sourceType: 'tenable_vulnerability',
        _class: RelationshipClass.HAS,
        targetType: 'host',
        direction: RelationshipDirection.REVERSE,
      },
    ],
    dependsOn: ['fetch-assets', 'fetch-vulnerabilities'],
    executionHandler,
  },
  {
    /**
     * ENDPOINT: n/a
     * PATTERN: Build Child Relationships
     */
    id: 'build-vuln-cve-relationships',
    name: 'Build Vuln -> CVE Relationships',
    entities: [],
    relationships: [],
    mappedRelationships: [
      {
        _type: 'tenable_vulnerability_is_cve',
        sourceType: 'tenable_vulnerability',
        _class: RelationshipClass.IS,
        targetType: 'cve',
        direction: RelationshipDirection.FORWARD,
      },
    ],
    dependsOn: ['fetch-vulnerabilities'],
    executionHandler,
  },
];
