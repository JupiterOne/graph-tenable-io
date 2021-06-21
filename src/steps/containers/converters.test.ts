import { Container, ContainerReport } from '../../tenable/types';
import { Account } from '../../types';
import {
  createContainerEntity,
  createAccountContainerRelationship,
  createReportEntity,
  createContainerReportRelationship,
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

  const containerEntity = createContainerEntity(container);

  expect(containerEntity).toEqual({
    _class: 'Image',
    _key: 'tenable_container_6549098203417933758',
    _type: 'tenable_container',
    _rawData: [{ name: 'default', rawData: container }],
    createdAt: 1555496818509,
    digest:
      'sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
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

  const relationships = createAccountContainerRelationship(account, container);

  expect(relationships).toEqual({
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

  const entities = createReportEntity(report);

  expect(entities).toEqual({
    _class: 'Assessment',
    _key: 'tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    _type: 'tenable_container_report',
    _rawData: [{ name: 'default', rawData: report }],
    createdAt: 1555496818509,
    digest: 'c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
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

  const relationships = createContainerReportRelationship(container, report);

  expect(relationships).toEqual({
    _class: 'HAS',
    _fromEntityKey: 'tenable_container_6549098203417933758',
    _key: 'tenable_container_6549098203417933758_has_tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    _toEntityKey:
      'tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc',
    _type: 'tenable_container_has_container_report',
  });
});
