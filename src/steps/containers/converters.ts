import { entities, relationships } from '../../constants';
import {
  Container,
  ContainerReport,
  ContainerFinding,
} from '../../tenable/types';
import { Account } from '../../types';
import { normalizeCVSS2Severity } from '../../converters/vulnerabilities';
import {
  generateEntityKey,
  generateRelationshipKey,
} from '../../utils/generateKey';
import getTime from '../../utils/getTime';

export function createContainerEntity(container: Container) {
  return {
    _key: generateEntityKey(entities.CONTAINER._type, container.id),
    _type: entities.CONTAINER._type,
    _class: entities.CONTAINER._class,
    _rawData: [{ name: 'default', rawData: container }],
    id: container.id,
    repoId: container.repo_id,
    platform: container.platform,
    name: container.name,
    size: container.size,
    digest: container.digest,
    repoName: container.repo_name,
    score: container.score,
    status: container.status,
    createdAt: getTime(container.created_at)!,
    updatedAt: getTime(container.updated_at)!,
    numberOfVulnerabilities: container.number_of_vulnerabilities,
  };
}

export function createAccountContainerRelationship(
  account: Account,
  container: Container,
) {
  const parentKey = generateEntityKey(entities.ACCOUNT._type, account.id);
  const childKey = generateEntityKey(entities.CONTAINER._type, container.id);
  const relationKey = generateRelationshipKey(
    parentKey,
    relationships.ACCOUNT_HAS_CONTAINER._class,
    childKey,
  );
  const relationship = {
    _class: relationships.ACCOUNT_HAS_CONTAINER._class,
    _type: relationships.ACCOUNT_HAS_CONTAINER._type,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
  return relationship;
}

export function createReportEntity(report: ContainerReport) {
  const reportId = report.sha256;
  const reportEntity = {
    _key: generateEntityKey(entities.CONTAINER_REPORT._type, reportId),
    _type: entities.CONTAINER_REPORT._type,
    _class: entities.CONTAINER_REPORT._class,
    _rawData: [{ name: 'default', rawData: report }],
    id: reportId,
    sha256: report.sha256,
    digest: report.digest,
    dockerImageId: report.docker_image_id,
    imageName: report.image_name,
    tag: report.tag,
    os: report.os,
    platform: report.platform,
    riskScore: report.risk_score,
    osArchitecture: report.os_architecture,
    osVersion: report.os_version,
    createdAt: getTime(report.created_at)!,
    updatedAt: getTime(report.updated_at)!,
  };
  return reportEntity;
}

export function createContainerReportRelationship(
  container: Container,
  report: ContainerReport,
) {
  const parentKey = generateEntityKey(entities.CONTAINER._type, container.id);
  const childKey = generateEntityKey(
    entities.CONTAINER_REPORT._type,
    report.sha256,
  );
  const relationKey = generateRelationshipKey(
    parentKey,
    relationships.CONTAINER_HAS_REPORT._class,
    childKey,
  );

  const relationship = {
    _class: relationships.CONTAINER_HAS_REPORT._class,
    _type: relationships.CONTAINER_HAS_REPORT._type,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
  return relationship;
}

export function createContainerFindingEntity(vulnerability: ContainerFinding) {
  const { nvdFinding } = vulnerability;
  const { numericSeverity, severity } = normalizeCVSS2Severity(
    nvdFinding.cvss_score,
  );

  return {
    _key: containerFindingEntityKey(vulnerability),
    _type: entities.CONTAINER_FINDING._type,
    _class: entities.CONTAINER_FINDING._class,
    _rawData: [{ name: 'default', rawData: vulnerability }],
    displayName: displayName(vulnerability),
    referenceId: nvdFinding.reference_id,
    cve: nvdFinding.cve,
    publishedDate: nvdFinding.published_date,
    modifiedDate: nvdFinding.modified_date,
    description: nvdFinding.description,
    cvssScore: nvdFinding.cvss_score,
    accessVector: nvdFinding.access_vector,
    accessComplexity: nvdFinding.access_complexity,
    auth: nvdFinding.auth,
    availabilityImpact: nvdFinding.availability_impact,
    confidentialityImpact: nvdFinding.confidentiality_impact,
    integrityImpact: nvdFinding.integrity_impact,
    cwe: nvdFinding.cwe,
    remediation: nvdFinding.remediation,
    numericSeverity,
    severity,
  };
}

export function containerFindingEntityKey(vulnerability: ContainerFinding) {
  const { nvdFinding } = vulnerability;
  return generateEntityKey(
    entities.CONTAINER_FINDING._type,
    `${nvdFinding.cve}_${nvdFinding.cwe}`,
  );
}

function displayName(vulnerability: ContainerFinding): string {
  const { nvdFinding } = vulnerability;
  return [nvdFinding.cve, nvdFinding.cwe].filter((e) => !!e).join('/');
}

export function createReportFindingRelationship(
  reportSha256: string,
  vulnerability: ContainerFinding,
) {
  const parentKey = generateEntityKey(
    entities.CONTAINER_REPORT._type,
    reportSha256,
  );
  const childKey = containerFindingEntityKey(vulnerability);
  const relationKey = generateRelationshipKey(
    parentKey,
    relationships.REPORT_IDENTIFIED_FINDING._class,
    childKey,
  );

  return {
    _class: relationships.REPORT_IDENTIFIED_FINDING._class,
    _type: relationships.REPORT_IDENTIFIED_FINDING._type,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
}
