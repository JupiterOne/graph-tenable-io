import {
  ContainerImage,
  ContainerReport,
  ContainerFinding,
  ContainerMalware,
  ContainerUnwantedProgram,
  ContainerRepository,
} from '../../tenable/client';
import { Entities } from '../constants';
import { Account } from '../../types';
import {
  createContainerImageEntity,
  createAccountContainerImageRelationship,
  createReportEntity,
  createContainerReportRelationship,
  createContainerFindingEntity,
  createReportFindingRelationship,
  createMalwareEntity,
  createReportMalwareRelationship,
  createUnwantedProgramEntity,
  createReportUnwantedProgramRelationship,
  createContainerRepositoryEntity,
  createAccountContainerRepositoryRelationship,
} from './converters';

const repo: ContainerRepository = {
  name: 'library',
  imagesCount: 2,
  labelsCount: 2,
  vulnerabilitiesCount: 174,
  malwareCount: 0,
  pullCount: 0,
  pushCount: 5,
  totalBytes: 352035549,
};

const container: ContainerImage = {
  repoId: '5647947539604158566',
  repoName: 'library',
  name: 'alpine',
  tag: 'latest',
  digest:
    'sha256:d259bb12b9be326d0368131b35710fa5243b90751798888be566bf35cadaf2d2',
  hasReport: true,
  hasInventory: false,
  status: 'scanned',
  lastJobStatus: 'completed',
  score: 0,
  numberOfVulns: 0,
  numberOfMalware: 0,
  pullCount: '0',
  pushCount: '1',
  source: 'pushed',
  createdAt: '2021-06-22T14:32:30.402Z',
  updatedAt: '2022-09-25T12:47:11.814Z',
  finishedAt: '2022-09-25T12:47:11.770Z',
  imageHash: 'd4ff818577bc',
  size: '528',
  layers: [
    {
      size: 2811478,
      digest:
        'sha256:5843afab387455b37944e709ee8c78d7520df80f8d01cf7f861aae63beeddb6b',
    },
  ],
  os: 'Alpine',
  osVersion: '3.14.0',
  repository: 'library',
  riskScore: 0,
  reportUrl:
    '/container-security/api/v1/reports/by_image_digest?sha256:d259bb12b9be326d0368131b35710fa5243b90751798888be566bf35cadaf2d2',
  uploadedAt: '2021-06-22T14:32:30.402Z',
  lastScanned: '2022-09-25T12:47:11.770Z',
};

test('convert container repository entity', () => {
  expect(createContainerRepositoryEntity(repo)).toEqual({
    _key: 'tenable_container_repository_library',
    _type: Entities.CONTAINER_REPOSITORY._type,
    _class: Entities.CONTAINER_REPOSITORY._class,
    _rawData: [{ name: 'default', rawData: repo }],
    name: 'library',
    displayName: 'library',
    imagesCount: 2,
    labelsCount: 2,
    vulnerabilitiesCount: 174,
    malwareCount: 0,
    pullCount: 0,
    pushCount: 5,
    totalBytes: 352035549,
  });
});

test('convert container image entity', () => {
  expect(createContainerImageEntity(container)).toEqual({
    _class: Entities.CONTAINER_IMAGE._class,
    _key: 'tenable_container_image_library:alpine:latest',
    _type: Entities.CONTAINER_IMAGE._type,
    _rawData: [{ name: 'default', rawData: container }],
    repoId: '5647947539604158566',
    repoName: 'library',
    name: 'alpine',
    displayName: 'alpine',
    tag: 'latest',
    digest:
      'sha256:d259bb12b9be326d0368131b35710fa5243b90751798888be566bf35cadaf2d2',
    hasReport: true,
    reportUrl:
      '/container-security/api/v1/reports/by_image_digest?sha256:d259bb12b9be326d0368131b35710fa5243b90751798888be566bf35cadaf2d2',
    hasInventory: false,
    status: 'scanned',
    lastJobStatus: 'completed',
    score: 0,
    numberOfVulns: 0,
    numberOfMalware: 0,
    pullCount: '0',
    pushCount: '1',
    source: 'pushed',
    createdOn: 1624372350402,
    updatedOn: 1664110031814,
    finishedOn: 1664110031770,
    uploadedOn: 1624372350402,
    lastScannedOn: 1664110031770,
    imageHash: 'd4ff818577bc',
    size: '528',
    'layers.size': [2811478],
    'layers.digest': [
      'sha256:5843afab387455b37944e709ee8c78d7520df80f8d01cf7f861aae63beeddb6b',
    ],
    os: 'Alpine',
    osVersion: '3.14.0',
  });
});

test('convert account container image relationship', () => {
  const account: Account = {
    id: 'TestId',
    name: 'TestName',
  };

  const relationship = createAccountContainerImageRelationship(
    account,
    container,
  );

  expect(relationship).toEqual({
    _class: 'HAS',
    _fromEntityKey: 'tenable_account_TestId',
    _key: 'tenable_account_TestId_has_tenable_container_image_library:alpine:latest',
    _toEntityKey: 'tenable_container_image_library:alpine:latest',
    _type: 'tenable_account_has_container_image',
  });
});

test('convert account container repository relationship', () => {
  const account: Account = {
    id: 'TestId',
    name: 'TestName',
  };

  const relationship = createAccountContainerRepositoryRelationship(
    account,
    repo,
  );

  expect(relationship).toEqual({
    _class: 'HAS',
    _fromEntityKey: 'tenable_account_TestId',
    _key: 'tenable_account_TestId_has_tenable_container_repository_library',
    _toEntityKey: 'tenable_container_repository_library',
    _type: 'tenable_account_has_container_repository',
  });
});

test('convert report entity', () => {
  const report: ContainerReport = {
    malware: [],
    sha256:
      'sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    os: 'LINUX_ALPINE',
    risk_score: 0,
    findings: [],
    os_version: '3.8.2',
    created_at: '2019-04-17T10:26:58.509Z',
    platform: 'docker',
    image_name: 'graph-tenable-app',
    updated_at: '2019-04-17T10:26:58.509Z',
    digest: 'c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    tag: 'latest',
    potentially_unwanted_programs: [],
    docker_image_id: 'f8ebac0b4322',
    os_architecture: 'AMD64',
  };

  expect(createReportEntity(report)).toEqual({
    _class: Entities.CONTAINER_REPORT._class,
    _key: 'tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    _type: Entities.CONTAINER_REPORT._type,
    _rawData: [{ name: 'default', rawData: report }],
    createdAt: 1555496818509,
    digest: 'c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    displayName: 'graph-tenable-app',
    dockerImageId: 'f8ebac0b4322',
    id: 'sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    imageName: 'graph-tenable-app',
    os: 'LINUX_ALPINE',
    osArchitecture: 'AMD64',
    osVersion: '3.8.2',
    platform: 'docker',
    riskScore: 0,
    sha256:
      'sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    tag: 'latest',
    updatedAt: 1555496818509,
    category: 'Risk Assessment',
    internal: false,
    name: 'graph-tenable-app',
    summary: 'findings: 0, malwares: 0, unwanted programs: 0',
  });
});

test('convert container image report relationship', () => {
  const report: ContainerReport = {
    malware: [],
    sha256:
      'sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    os: 'LINUX_ALPINE',
    risk_score: 0,
    findings: [],
    os_version: '3.8.2',
    created_at: '2019-04-17T10:26:58.509Z',
    platform: 'docker',
    image_name: 'graph-tenable-app',
    updated_at: '2019-04-17T10:26:58.509Z',
    digest: 'c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    tag: 'latest',
    potentially_unwanted_programs: [],
    docker_image_id: 'f8ebac0b4322',
    os_architecture: 'AMD64',
  };

  const relationship = createContainerReportRelationship(container, report);

  expect(relationship).toEqual({
    _class: 'HAS',
    _fromEntityKey: 'tenable_container_image_library:alpine:latest',
    _key: 'tenable_container_image_library:alpine:latest_has_tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    _toEntityKey:
      'tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    _type: 'tenable_container_image_has_report',
  });
});

test('container finding', () => {
  const data: ContainerFinding = {
    nvdFinding: {
      reference_id: 'findingId',
      cve: 'cve-123',
      snyk_id: 'string',
      published_date: 'string',
      modified_date: 'string',
      description: 'string',
      cvss_score: '2.3',
      cvss_vector: 'CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:N/A:H',
      access_vector: 'string',
      access_complexity: 'string',
      auth: 'string',
      availability_impact: 'string',
      confidentiality_impact: 'string',
      integrity_impact: 'string',
      cwe: 'cwe-234',
      cpe: ['string'],
      remediation: 'string',
      references: ['string'],
    },
    packages: [
      {
        name: 'string',
        version: 'string',
        type: 'string',
      },
    ],
  };

  expect(createContainerFindingEntity(data)).toEqual({
    _class: Entities.CONTAINER_FINDING._class,
    _key: 'tenable_container_finding_cve-123_cwe-234',
    _type: Entities.CONTAINER_FINDING._type,
    _rawData: [{ name: 'default', rawData: data }],
    displayName: 'cve-123/cwe-234',
    accessComplexity: 'string',
    accessVector: 'string',
    auth: 'string',
    availabilityImpact: 'string',
    category: 'string',
    confidentialityImpact: 'string',
    cve: 'cve-123',
    cvssScore: '2.3',
    cwe: 'cwe-234',
    description: 'string',
    integrityImpact: 'string',
    referenceId: 'findingId',
    remediation: 'string',
    severity: 'Low',
    numericSeverity: 2.3,
    vector: 'CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:N/A:H',
    modifiedDate: undefined,
    name: 'cve-123/cwe-234',
    open: true,
    publishedDate: undefined,
  });
});

test('convert report container vulnerability relationship', () => {
  const report: ContainerReport = {
    malware: [],
    sha256:
      'sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    os: 'LINUX_ALPINE',
    risk_score: 0,
    findings: [],
    os_version: '3.8.2',
    created_at: '2019-04-17T10:26:58.509Z',
    platform: 'docker',
    image_name: 'graph-tenable-app',
    updated_at: '2019-04-17T10:26:58.509Z',
    digest: 'c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    tag: 'latest',
    potentially_unwanted_programs: [],
    docker_image_id: 'f8ebac0b4322',
    os_architecture: 'AMD64',
  };
  const finding: ContainerFinding = {
    nvdFinding: {
      reference_id: 'findingId',
      cve: 'cve-123',
      cpe: ['string'],
      snyk_id: 'string',
      published_date: 'string',
      modified_date: 'string',
      description: 'string',
      cvss_score: 'string',
      cvss_vector: 'CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:N/A:H',
      access_vector: 'string',
      access_complexity: 'string',
      auth: 'string',
      availability_impact: 'string',
      confidentiality_impact: 'string',
      integrity_impact: 'string',
      cwe: 'cwe-234',
      remediation: 'string',
      references: ['string'],
    },
    packages: [
      {
        name: 'string',
        version: 'string',
        type: 'string',
      },
    ],
  };

  const relationship = createReportFindingRelationship(report.sha256, finding);

  expect(relationship).toEqual({
    _class: 'IDENTIFIED',
    _fromEntityKey:
      'tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    _key: 'tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc_identified_tenable_container_finding_cve-123_cwe-234',
    _toEntityKey: 'tenable_container_finding_cve-123_cwe-234',
    _type: 'tenable_container_report_identified_finding',
  });
});

test('convert container vulnerability entity', () => {
  const malware = {
    infectedFile: 'string',
    fileTypeDescriptor: 'string',
    md5: 'malwareMd5',
    sha256: 'string',
  };

  expect(createMalwareEntity(malware)).toEqual({
    _class: Entities.CONTAINER_MALWARE._class,
    _key: 'tenable_container_malware_malwareMd5',
    _type: Entities.CONTAINER_MALWARE._type,
    _rawData: [
      {
        name: 'default',
        rawData: {
          infectedFile: 'string',
          fileTypeDescriptor: 'string',
          md5: 'malwareMd5',
          sha256: 'string',
        },
      },
    ],
    fileTypeDescriptor: 'string',
    displayName: 'string',
    infectedFile: 'string',
    md5: 'malwareMd5',
    sha256: 'string',
  });
});

test('convert report container vulnerability relationship', () => {
  const report: ContainerReport = {
    malware: [],
    sha256:
      'sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    os: 'LINUX_ALPINE',
    risk_score: 0,
    findings: [],
    os_version: '3.8.2',
    created_at: '2019-04-17T10:26:58.509Z',
    platform: 'docker',
    image_name: 'graph-tenable-app',
    updated_at: '2019-04-17T10:26:58.509Z',
    digest: 'c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    tag: 'latest',
    potentially_unwanted_programs: [],
    docker_image_id: 'f8ebac0b4322',
    os_architecture: 'AMD64',
  };

  const malware: ContainerMalware = {
    infectedFile: 'string',
    fileTypeDescriptor: 'string',
    md5: 'malwareMd5',
    sha256: 'string',
  };

  const relationship = createReportMalwareRelationship(report.sha256, malware);

  expect(relationship).toEqual({
    _class: 'IDENTIFIED',
    _fromEntityKey:
      'tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    _key: 'tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc_identified_tenable_container_malware_malwareMd5',
    _toEntityKey: 'tenable_container_malware_malwareMd5',
    _type: 'tenable_container_report_identified_malware',
  });
});

test('convert container vulnerability entity', () => {
  const unwantedProgram = {
    file: 'file',
    md5: 'unwantedProgramMd5',
    sha256: 'string',
  };

  expect(createUnwantedProgramEntity(unwantedProgram)).toEqual({
    _class: Entities.CONTAINER_UNWANTED_PROGRAM._class,
    _key: 'tenable_container_unwanted_program_unwantedProgramMd5',
    _type: Entities.CONTAINER_UNWANTED_PROGRAM._type,
    _rawData: [
      {
        name: 'default',
        rawData: {
          file: 'file',
          md5: 'unwantedProgramMd5',
          sha256: 'string',
        },
      },
    ],
    file: 'file',
    displayName: 'file',
    md5: 'unwantedProgramMd5',
    sha256: 'string',
  });
});

test('convert report container vulnerability relationship', () => {
  const report: ContainerReport = {
    malware: [],
    sha256:
      'sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    os: 'LINUX_ALPINE',
    risk_score: 0,
    findings: [],
    os_version: '3.8.2',
    created_at: '2019-04-17T10:26:58.509Z',
    platform: 'docker',
    image_name: 'graph-tenable-app',
    updated_at: '2019-04-17T10:26:58.509Z',
    digest: 'c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    tag: 'latest',
    potentially_unwanted_programs: [],
    docker_image_id: 'f8ebac0b4322',
    os_architecture: 'AMD64',
  };
  const unwantedProgram: ContainerUnwantedProgram = {
    file: 'file',
    md5: 'unwantedProgramMd5',
    sha256: 'string',
  };

  const relationship = createReportUnwantedProgramRelationship(
    report.sha256,
    unwantedProgram,
  );

  expect(relationship).toEqual({
    _class: 'IDENTIFIED',
    _fromEntityKey:
      'tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    _key: 'tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc_identified_tenable_container_unwanted_program_unwantedProgramMd5',
    _toEntityKey: 'tenable_container_unwanted_program_unwantedProgramMd5',
    _type: 'tenable_container_report_identified_unwanted_program',
  });
});
