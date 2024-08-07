import {
  RelationshipClass,
  RelationshipDirection,
  StepEntityMetadata,
  StepMappedRelationshipMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

export const SERVICE_ENTITY_DATA_KEY = 'entity:service';

export const SLEEP_TIME = 60_000;

export const StepIds = {
  ACCOUNT: 'step-account',
  SERVICE: 'step-service',
  ASSETS: 'step-assets',
  VULNERABILITIES: 'step-vulnerabilities',
  VULNERABILITY_CVE_RELATIONSHIPS: 'build-vuln-cve-relationships',
  ASSET_VULNERABILITY_RELATIONSHIPS: 'build-asset-vuln-relationships',
  USERS: 'step-users',
  CONTAINER_IMAGES: 'step-container-images',
  CONTAINER_REPOSITORIES: 'step-container-repositories',
  REPOSITORY_IMAGES_RELATIONSHIPS: 'build-repository-images-relationships',
  CONTAINER_REPORTS: 'step-container-reports',
  SCANNER_IDS: 'step-scanner-ids',
  AGENTS: 'step-agents',
  AGENT_RELATIONSHIPS: 'build-agent-relationships',
  COMPLIANCE_FINDINGS: 'step-compliance-findings',
  ASSET_COMPLIANCE_FINDINGS_RELATIONSHIPS:
    'build-asset-compliance-findings-relationships',
};

export const Entities: Record<
  | 'ACCOUNT'
  | 'ASSET'
  | 'SERVICE'
  | 'CONTAINER_IMAGE'
  | 'CONTAINER_REPOSITORY'
  | 'CONTAINER_REPORT'
  | 'CONTAINER_FINDING'
  | 'CONTAINER_MALWARE'
  | 'CONTAINER_UNWANTED_PROGRAM'
  | 'VULNERABILITY'
  | 'USER'
  | 'AGENT'
  | 'COMPLIANCE_FINDINGS',
  StepEntityMetadata
> = {
  ACCOUNT: {
    resourceName: 'Account',
    _class: ['Account'],
    _type: 'tenable_account',
  },
  ASSET: {
    resourceName: 'Asset',
    _class: ['Record'],
    _type: 'tenable_asset',
  },
  SERVICE: {
    resourceName: 'Service',
    _type: 'tenable_scanner',
    _class: ['Service'],
  },
  CONTAINER_IMAGE: {
    resourceName: 'Container Image',
    _class: ['Image'],
    _type: 'tenable_container_image',
  },
  CONTAINER_REPOSITORY: {
    resourceName: 'Container Repository',
    _class: ['Repository'],
    _type: 'tenable_container_repository',
  },
  // TODO does the report entity simply include container details, can we really get rid of this entity?
  CONTAINER_REPORT: {
    resourceName: 'Container Report',
    _class: ['Assessment'],
    _type: 'tenable_container_report',
  },
  CONTAINER_FINDING: {
    resourceName: 'Container Finding',
    _class: ['Finding'],
    _type: 'tenable_container_finding',
  },
  CONTAINER_MALWARE: {
    resourceName: 'Container Malware',
    _class: ['Finding'],
    _type: 'tenable_container_malware',
  },
  CONTAINER_UNWANTED_PROGRAM: {
    resourceName: 'Container Unwanted Program',
    _class: ['Finding'],
    _type: 'tenable_container_unwanted_program',
  },
  VULNERABILITY: {
    resourceName: 'Vulnerability',
    _class: ['Finding'],
    _type: 'tenable_vulnerability_finding',
  },
  USER: {
    resourceName: 'User',
    _class: ['User'],
    _type: 'tenable_user',
  },
  AGENT: {
    resourceName: 'Agent',
    _class: ['HostAgent'],
    _type: 'tenable_agent',
  },
  COMPLIANCE_FINDINGS: {
    resourceName: 'Compliance Finding',
    _class: ['Finding'],
    _type: 'tenable_compliance_finding',
  },
};

export const Relationships: Record<
  | 'ACCOUNT_HAS_USER'
  | 'ACCOUNT_HAS_ASSET'
  | 'ACCOUNT_PROVIDES_SERVICE'
  | 'ACCOUNT_HAS_CONTAINER_REPOSITORY'
  | 'ACCOUNT_HAS_CONTAINER_IMAGE'
  | 'SERVICE_SCANS_CONTAINER_IMAGE'
  | 'CONTAINER_REPOSITORY_HAS_IMAGE'
  | 'CONTAINER_IMAGE_HAS_REPORT'
  | 'CONTAINER_IMAGE_HAS_FINDING'
  | 'CONTAINER_IMAGE_HAS_MALWARE'
  | 'CONTAINER_IMAGE_HAS_UNWANTED_PROGRAM'
  | 'REPORT_IDENTIFIED_FINDING'
  | 'REPORT_IDENTIFIED_MALWARE'
  | 'REPORT_IDENTIFIED_UNWANTED_PROGRAM'
  | 'ASSET_HAS_VULN'
  | 'ACCOUNT_HAS_AGENT'
  | 'HOSTAGENT_PROTECTS_DEVICE'
  | 'ASSET_HAS_COMPLIANCE_FINDINGS',
  StepRelationshipMetadata
> = {
  ACCOUNT_HAS_USER: {
    _type: 'tenable_account_has_user',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.USER._type,
    indexMetadata: {
      enabled: false,
    },
  },
  ACCOUNT_HAS_ASSET: {
    _type: 'tenable_account_has_asset',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.ASSET._type,
    indexMetadata: {
      enabled: false,
    },
  },
  ACCOUNT_PROVIDES_SERVICE: {
    _type: 'tenable_account_provides_scanner',
    _class: RelationshipClass.PROVIDES,
    sourceType: Entities.ACCOUNT._type,
    targetType: Entities.SERVICE._type,
    indexMetadata: {
      enabled: false,
    },
  },
  ACCOUNT_HAS_CONTAINER_REPOSITORY: {
    _type: 'tenable_account_has_container_repository',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.CONTAINER_REPOSITORY._type,
    indexMetadata: {
      enabled: false,
    },
  },
  CONTAINER_REPOSITORY_HAS_IMAGE: {
    _type: 'tenable_container_repository_has_image',
    sourceType: Entities.CONTAINER_REPOSITORY._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.CONTAINER_IMAGE._type,
    indexMetadata: {
      enabled: false,
    },
  },
  ACCOUNT_HAS_CONTAINER_IMAGE: {
    _type: 'tenable_account_has_container_image',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.CONTAINER_IMAGE._type,
    indexMetadata: {
      enabled: false,
    },
  },
  SERVICE_SCANS_CONTAINER_IMAGE: {
    _type: 'tenable_scanner_scans_container_image',
    sourceType: Entities.SERVICE._type,
    _class: RelationshipClass.SCANS,
    targetType: Entities.CONTAINER_IMAGE._type,
    indexMetadata: {
      enabled: false,
    },
  },
  CONTAINER_IMAGE_HAS_REPORT: {
    _type: 'tenable_container_image_has_report',
    sourceType: Entities.CONTAINER_IMAGE._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.CONTAINER_REPORT._type,
    indexMetadata: {
      enabled: false,
    },
  },
  CONTAINER_IMAGE_HAS_FINDING: {
    _type: 'tenable_container_image_has_finding',
    sourceType: Entities.CONTAINER_IMAGE._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.CONTAINER_FINDING._type,
    indexMetadata: {
      enabled: false,
    },
  },
  CONTAINER_IMAGE_HAS_MALWARE: {
    _type: 'tenable_container_image_has_malware',
    sourceType: Entities.CONTAINER_IMAGE._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.CONTAINER_MALWARE._type,
    indexMetadata: {
      enabled: false,
    },
  },
  CONTAINER_IMAGE_HAS_UNWANTED_PROGRAM: {
    _type: 'tenable_container_image_has_unwanted_program',
    sourceType: Entities.CONTAINER_IMAGE._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.CONTAINER_UNWANTED_PROGRAM._type,
    indexMetadata: {
      enabled: false,
    },
  },
  REPORT_IDENTIFIED_FINDING: {
    _type: 'tenable_container_report_identified_finding',
    sourceType: Entities.CONTAINER_REPORT._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: Entities.CONTAINER_FINDING._type,
    indexMetadata: {
      enabled: false,
    },
  },
  REPORT_IDENTIFIED_MALWARE: {
    _type: 'tenable_container_report_identified_malware',
    sourceType: Entities.CONTAINER_REPORT._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: Entities.CONTAINER_MALWARE._type,
    indexMetadata: {
      enabled: false,
    },
  },
  REPORT_IDENTIFIED_UNWANTED_PROGRAM: {
    _type: 'tenable_container_report_identified_unwanted_program',
    sourceType: Entities.CONTAINER_REPORT._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: Entities.CONTAINER_UNWANTED_PROGRAM._type,
    indexMetadata: {
      enabled: false,
    },
  },
  ASSET_HAS_VULN: {
    _type: 'tenable_asset_has_vulnerability_finding',
    sourceType: Entities.ASSET._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.VULNERABILITY._type,
    indexMetadata: {
      enabled: false,
    },
  },
  ACCOUNT_HAS_AGENT: {
    _type: 'tenable_account_has_agent',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.AGENT._type,
  },
  HOSTAGENT_PROTECTS_DEVICE: {
    _type: 'tenable_agent_protects_asset',
    sourceType: Entities.AGENT._type,
    _class: RelationshipClass.PROTECTS,
    targetType: Entities.ASSET._type,
  },
  ASSET_HAS_COMPLIANCE_FINDINGS: {
    _type: 'tenable_asset_has_compliance_finding',
    sourceType: Entities.ASSET._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.COMPLIANCE_FINDINGS._type,
  },
};

export const MappedRelationships: Record<
  | 'TENABLE_ASSET_IS_AZURE_VM'
  | 'TENABLE_ASSET_IS_GOOGLE_COMPUTE_INSTANCE'
  | 'TENABLE_ASSET_IS_AWS_INSTANCE'
  | 'VULNERABILITY_HAS_AZURE_VM'
  | 'VULNERABILITY_HAS_GOOGLE_COMPUTE_INSTANCE'
  | 'VULNERABILITY_HAS_AWS_INSTANCE'
  | 'VULNERABILITY_IS_CVE',
  StepMappedRelationshipMetadata
> = {
  TENABLE_ASSET_IS_AZURE_VM: {
    sourceType: Entities.ASSET._type,
    targetType: 'azure_vm',
    _type: 'tenable_asset_is_azure_vm',
    _class: RelationshipClass.IS,
    direction: RelationshipDirection.FORWARD,
    indexMetadata: {
      enabled: false,
    },
  },
  TENABLE_ASSET_IS_GOOGLE_COMPUTE_INSTANCE: {
    sourceType: Entities.ASSET._type,
    targetType: 'google_compute_instance',
    _type: 'tenable_asset_is_google_compute_instance',
    _class: RelationshipClass.IS,
    direction: RelationshipDirection.FORWARD,
    indexMetadata: {
      enabled: false,
    },
  },
  TENABLE_ASSET_IS_AWS_INSTANCE: {
    sourceType: Entities.ASSET._type,
    targetType: 'aws_instance',
    _type: 'tenable_asset_is_aws_instance',
    _class: RelationshipClass.IS,
    direction: RelationshipDirection.FORWARD,
    indexMetadata: {
      enabled: false,
    },
  },
  VULNERABILITY_HAS_AZURE_VM: {
    sourceType: Entities.VULNERABILITY._type,
    targetType: 'azure_vm',
    _type: 'tenable_vulnerability_finding_has_azure_vm',
    _class: RelationshipClass.HAS,
    direction: RelationshipDirection.REVERSE,
    indexMetadata: {
      enabled: false,
    },
  },
  VULNERABILITY_HAS_GOOGLE_COMPUTE_INSTANCE: {
    sourceType: Entities.VULNERABILITY._type,
    targetType: 'google_compute_instance',
    _type: 'tenable_vulnerability_finding_has_google_compute_instance',
    _class: RelationshipClass.HAS,
    direction: RelationshipDirection.REVERSE,
    indexMetadata: {
      enabled: false,
    },
  },
  VULNERABILITY_HAS_AWS_INSTANCE: {
    sourceType: Entities.VULNERABILITY._type,
    targetType: 'aws_instance',
    _type: 'tenable_vulnerability_finding_has_aws_instance',
    _class: RelationshipClass.HAS,
    indexMetadata: {
      enabled: false,
    },
    direction: RelationshipDirection.REVERSE,
  },
  VULNERABILITY_IS_CVE: {
    _type: 'tenable_vulnerability_finding_is_cve',
    sourceType: Entities.VULNERABILITY._type,
    _class: RelationshipClass.IS,
    targetType: 'cve',
    direction: RelationshipDirection.FORWARD,
    indexMetadata: {
      enabled: false,
    },
  },
};

export const INGESTION_SOURCE_IDS = {
  ACCOUNT: 'account',
  SERVICE: 'service',
  ASSETS: 'assets',
  VULNERABILITIES: 'vulnerabilities',
  USERS: 'users',
  CONTAINER_IMAGES: 'container-images',
  CONTAINER_REPOSITORIES: 'container-repositories',
  CONTAINER_REPORTS: 'container-reports',
  SCANNER_IDS: 'scanner-ids',
  AGENTS: 'agents',
  COMPLIANCE_FINDINGS: 'compliance-findings',
};
