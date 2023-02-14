import {
  RelationshipClass,
  RelationshipDirection,
  StepEntityMetadata,
  StepMappedRelationshipMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

export const SERVICE_ENTITY_DATA_KEY = 'entity:service';

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
  | 'USER',
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
  | 'ASSET_HAS_VULN',
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
};

export const MappedRelationships: Record<
  'ASSET_IS_HOST' | 'HOST_HAS_VULN' | 'VULNERABILITY_IS_CVE',
  StepMappedRelationshipMetadata
> = {
  ASSET_IS_HOST: {
    _type: 'tenable_asset_is_host',
    sourceType: Entities.ASSET._type,
    _class: RelationshipClass.IS,
    targetType: 'host',
    direction: RelationshipDirection.FORWARD,
  },
  HOST_HAS_VULN: {
    _type: 'host_has_tenable_vulnerability_finding',
    sourceType: Entities.VULNERABILITY._type,
    _class: RelationshipClass.HAS,
    targetType: 'host',
    direction: RelationshipDirection.REVERSE,
  },
  VULNERABILITY_IS_CVE: {
    _type: 'tenable_vulnerability_finding_is_cve',
    sourceType: Entities.VULNERABILITY._type,
    _class: RelationshipClass.IS,
    targetType: 'cve',
    direction: RelationshipDirection.FORWARD,
  },
};
