import {
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { TenableIntegrationConfig } from '../../../../src/config';
import { StepSpec } from '../types';

export const vulnerabilitySpec: StepSpec<TenableIntegrationConfig>[] = [
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/assets/export
     * PATTERN: Fetch Entities
     */
    id: 'step-assets',
    name: 'Fetch Assets',
    entities: [
      {
        resourceName: 'Asset',
        _class: 'Record',
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
    mappedRelationships: [
      {
        _type: 'tenable_asset_is_host',
        sourceType: 'tenable_asset',
        _class: RelationshipClass.IS,
        targetType: 'host',
        direction: RelationshipDirection.FORWARD,
      },
    ],
    dependsOn: ['step-account'],
    implemented: true,
  },
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/scanners
     * PATTERN: Fetch Entities
     */
    id: 'fetch-scanners',
    name: 'Fetch Scanners',
    entities: [
      {
        resourceName: 'Scanner',
        _class: 'Scanner',
        _type: 'tenable_scanner',
      },
    ],
    relationships: [
      {
        _type: 'tenable_account_has_scanner',
        sourceType: 'tenable_account',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_scanner',
      },
    ],
    dependsOn: ['fetch-account'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: TODO ???
     * PATTERN: Build Child Relationships
     */
    id: 'build-scanner-asset-relationships',
    name: 'Build Scanner -> Asset Relationships',
    entities: [],
    relationships: [
      {
        _type: 'tenable_scanner_scans_asset',
        sourceType: 'tenable_scanner',
        _class: RelationshipClass.SCANS,
        targetType: 'tenable_asset',
      },
    ],
    mappedRelationships: [
      {
        _type: 'tenable_scanner_scans_host',
        sourceType: 'tenable_scanner',
        _class: RelationshipClass.SCANS,
        targetType: 'host',
        direction: RelationshipDirection.FORWARD,
      },
    ],
    dependsOn: ['fetch-assets', 'fetch-scanners'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/scanners/{scanner_id}/agents
     * PATTERN: Fetch Child Entities
     */
    id: 'fetch-agents',
    name: 'Fetch Agents',
    entities: [
      {
        resourceName: 'Agent',
        _class: 'HostAgent',
        _type: 'tenable_agent',
      },
    ],
    relationships: [
      {
        _type: 'tenable_scanner_uses_agent',
        sourceType: 'tenable_scanner',
        _class: RelationshipClass.USES,
        targetType: 'tenable_agent',
      },
    ],
    dependsOn: ['fetch-scanners'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: TODO ???
     * PATTERN: Build Child Relationships
     */
    id: 'build-agent-asset-relationships',
    name: 'Build Agent -> Asset Relationships',
    entities: [],
    relationships: [
      {
        _type: 'tenable_agent_protects_asset',
        sourceType: 'tenable_agent',
        _class: RelationshipClass.PROTECTS,
        targetType: 'tenable_asset',
      },
    ],
    mappedRelationships: [
      {
        _type: 'tenable_agent_protects_host',
        sourceType: 'tenable_agent',
        _class: RelationshipClass.PROTECTS,
        targetType: 'host',
        direction: RelationshipDirection.FORWARD,
      },
    ],
    dependsOn: ['fetch-assets', 'fetch-agents'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: https://cloud.tenable.com/vulns/export
     * PATTERN: Fetch Entities
     */
    id: 'step-vulnerabilities',
    name: 'Fetch Vulnerabilities',
    entities: [
      {
        resourceName: 'Vulnerability',
        _class: 'Finding',
        _type: 'tenable_vulnerability',
      },
    ],
    relationships: [],
    dependsOn: [],
    implemented: true,
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
        _type: 'tenable_asset_has_vulnerability',
        sourceType: 'tenable_asset',
        _class: RelationshipClass.HAS,
        targetType: 'tenable_vulnerability',
      },
    ],
    mappedRelationships: [
      {
        _type: 'host_has_tenable_vulnerability',
        sourceType: 'tenable_vulnerability',
        _class: RelationshipClass.HAS,
        targetType: 'host',
        direction: RelationshipDirection.REVERSE,
      },
    ],
    dependsOn: ['fetch-assets', 'fetch-vulnerabilities'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: n/a
     * PATTERN: Build Child Relationships
     */
    id: 'build-scanner-vuln-relationships',
    name: 'Build Scanner -> Vuln Relationships',
    entities: [],
    relationships: [
      {
        _type: 'tenable_scanner_identified_vulnerability',
        sourceType: 'tenable_scanner',
        _class: RelationshipClass.IDENTIFIED,
        targetType: 'tenable_vulnerability',
      },
    ],
    dependsOn: ['fetch-scanners', 'fetch-vulnerabilities'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: n/a
     * PATTERN: Build Child Relationships
     */
    id: 'build-agent-vuln-relationships',
    name: 'Build Agent -> Vuln Relationships',
    entities: [],
    relationships: [
      {
        _type: 'tenable_agent_identified_vulnerability',
        sourceType: 'tenable_agent',
        _class: RelationshipClass.IDENTIFIED,
        targetType: 'tenable_vulnerability',
      },
    ],
    dependsOn: ['fetch-agents', 'fetch-vulnerabilities'],
    implemented: false,
  },
  {
    /**
     * ENDPOINT: n/a
     * PATTERN: Build Child Relationships
     */
    id: 'build-vuln-cve-relationships',
    name: 'Build Vulnerability -> CVE Mapped Relationships',
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
    dependsOn: ['step-vulnerabilities'],
    implemented: true,
  },
];
