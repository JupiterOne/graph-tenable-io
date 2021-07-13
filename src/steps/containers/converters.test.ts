import {
  Container,
  ContainerReport,
  ContainerFinding,
  ContainerMalware,
  ContainerUnwantedProgram,
} from '@jupiterone/tenable-client-nodejs';
import { Account } from '../../types';
import {
  createContainerEntity,
  createAccountContainerRelationship,
  createReportEntity,
  createContainerReportRelationship,
  createContainerFindingEntity,
  createReportFindingRelationship,
  createMalwareEntity,
  createReportMalwareRelationship,
  createUnwantedProgramEntity,
  createReportUnwantedProgramRelationship,
} from './converters';

test('convert container entity', () => {
  const container: Container = {
    number_of_vulnerabilities: '0',
    name: 'graph-tenable-app',
    size: '2420',
    digest:
      'sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    repo_name: 'graph-tenable-app',
    score: '0.0',
    id: '6549098203417933758',
    status: 'ready',
    created_at: '2019-04-17T10:26:58.509Z',
    repo_id: '907096124672081622',
    platform: 'Docker',
    updated_at: '2019-04-17T23:31:28.996Z',
  };

  expect(createContainerEntity(container)).toEqual({
    _class: 'Image',
    _key: 'tenable_container_6549098203417933758',
    _type: 'tenable_container',
    _rawData: [{ name: 'default', rawData: container }],
    createdAt: 1555496818509,
    digest:
      'sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    displayName: 'graph-tenable-app',
    id: '6549098203417933758',
    name: 'graph-tenable-app',
    numberOfVulnerabilities: '0',
    platform: 'Docker',
    repoId: '907096124672081622',
    repoName: 'graph-tenable-app',
    score: '0.0',
    size: '2420',
    status: 'ready',
    updatedAt: 1555543888996,
  });
});

test('convert account container relationship', () => {
  const account: Account = {
    id: 'TestId',
    name: 'TestName',
  };
  const container: Container = {
    number_of_vulnerabilities: '0',
    name: 'graph-tenable-app',
    size: '2420',
    digest:
      'sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    repo_name: 'graph-tenable-app',
    score: '0.0',
    id: '6549098203417933758',
    status: 'ready',
    created_at: '2019-04-17T10:26:58.509Z',
    repo_id: '907096124672081622',
    platform: 'Docker',
    updated_at: '2019-04-17T23:31:28.996Z',
  };

  const relationship = createAccountContainerRelationship(account, container);

  expect(relationship).toEqual({
    _class: 'HAS',
    _fromEntityKey: 'tenable_account_TestId',
    _key: 'tenable_account_TestId_has_tenable_container_6549098203417933758',
    _toEntityKey: 'tenable_container_6549098203417933758',
    _type: 'tenable_account_has_container',
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
    _class: 'Assessment',
    _key: 'tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    _type: 'tenable_container_report',
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
  });
});

test('convert container report relationship', () => {
  const container: Container = {
    number_of_vulnerabilities: '0',
    name: 'graph-tenable-app',
    size: '2420',
    digest:
      'sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    repo_name: 'graph-tenable-app',
    score: '0.0',
    id: '6549098203417933758',
    status: 'ready',
    created_at: '2019-04-17T10:26:58.509Z',
    repo_id: '907096124672081622',
    platform: 'Docker',
    updated_at: '2019-04-17T23:31:28.996Z',
  };
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
    _fromEntityKey: 'tenable_container_6549098203417933758',
    _key: 'tenable_container_6549098203417933758_has_tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    _toEntityKey:
      'tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    _type: 'tenable_container_has_container_report',
  });
});

test('container finding', () => {
  const data: ContainerFinding = {
    nvdFinding: {
      reference_id: 'findingId',
      cve: 'cve-123',
      published_date: 'string',
      modified_date: 'string',
      description: 'string',
      cvss_score: '2.3',
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
        release: 'string',
        epoch: 'string',
        rawString: 'string',
      },
    ],
  };

  expect(createContainerFindingEntity(data)).toEqual({
    _class: 'Finding',
    _key: 'tenable_container_finding_cve-123_cwe-234',
    _type: 'tenable_container_finding',
    _rawData: [{ name: 'default', rawData: data }],
    displayName: 'cve-123/cwe-234',
    accessComplexity: 'string',
    accessVector: 'string',
    auth: 'string',
    availabilityImpact: 'string',
    confidentialityImpact: 'string',
    cve: 'cve-123',
    cvssScore: '2.3',
    cwe: 'cwe-234',
    description: 'string',
    integrityImpact: 'string',
    modifiedDate: 'string',
    publishedDate: 'string',
    referenceId: 'findingId',
    remediation: 'string',
    severity: 'Low',
    numericSeverity: 2.3,
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
      published_date: 'string',
      modified_date: 'string',
      description: 'string',
      cvss_score: 'string',
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
        release: 'string',
        epoch: 'string',
        rawString: 'string',
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
    _class: 'Finding',
    _key: 'tenable_container_malware_malwareMd5',
    _type: 'tenable_container_malware',
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
    _class: 'Finding',
    _key: 'tenable_container_unwanted_program_unwantedProgramMd5',
    _type: 'tenable_container_unwanted_program',
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
