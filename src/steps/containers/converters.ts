import { Entities, Relationships } from '../../constants';
import {
  Container,
  ContainerReport,
  ContainerFinding,
  ContainerMalware,
  ContainerUnwantedProgram,
} from '@jupiterone/tenable-client-nodejs';
import { Account } from '../../types';
import { normalizeCVSS2Severity } from '../vulnerabilities/converters';
import {
  generateEntityKey,
  generateRelationshipKey,
} from '../../utils/generateKey';
import getTime from '../../utils/getTime';

export function createContainerEntity(container: Container) {
  return {
    _key: generateEntityKey(Entities.CONTAINER._type, container.id),
    _type: Entities.CONTAINER._type,
    _class: Entities.CONTAINER._class,
    _rawData: [{ name: 'default', rawData: container }],
    id: container.id,
    repoId: container.repo_id,
    platform: container.platform,
    displayName: container.name,
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
  const parentKey = generateEntityKey(Entities.ACCOUNT._type, account.id);
  const childKey = generateEntityKey(Entities.CONTAINER._type, container.id);
  const relationKey = generateRelationshipKey(
    parentKey,
    Relationships.ACCOUNT_HAS_CONTAINER._class,
    childKey,
  );
  const relationship = {
    _class: Relationships.ACCOUNT_HAS_CONTAINER._class,
    _type: Relationships.ACCOUNT_HAS_CONTAINER._type,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
  return relationship;
}

export function createReportEntity(report: ContainerReport) {
  const reportId = report.sha256;
  const reportEntity = {
    _key: generateEntityKey(Entities.CONTAINER_REPORT._type, reportId),
    _type: Entities.CONTAINER_REPORT._type,
    _class: Entities.CONTAINER_REPORT._class,
    _rawData: [{ name: 'default', rawData: report }],
    id: reportId,
    displayName: report.image_name,
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
  const parentKey = generateEntityKey(Entities.CONTAINER._type, container.id);
  const childKey = generateEntityKey(
    Entities.CONTAINER_REPORT._type,
    report.sha256,
  );
  const relationKey = generateRelationshipKey(
    parentKey,
    Relationships.CONTAINER_HAS_REPORT._class,
    childKey,
  );

  const relationship = {
    _class: Relationships.CONTAINER_HAS_REPORT._class,
    _type: Relationships.CONTAINER_HAS_REPORT._type,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
  return relationship;
}

export function createContainerFindingEntity(finding: ContainerFinding) {
  const { nvdFinding } = finding;
  const { numericSeverity, severity } = normalizeCVSS2Severity(
    nvdFinding.cvss_score,
  );

  return {
    _key: containerFindingEntityKey(finding),
    _type: Entities.CONTAINER_FINDING._type,
    _class: Entities.CONTAINER_FINDING._class,
    _rawData: [{ name: 'default', rawData: finding }],
    displayName: displayName(finding),
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

export function containerFindingEntityKey(finding: ContainerFinding) {
  const { nvdFinding } = finding;
  return generateEntityKey(
    Entities.CONTAINER_FINDING._type,
    `${nvdFinding.cve}_${nvdFinding.cwe}`,
  );
}

function displayName(finding: ContainerFinding): string {
  const { nvdFinding } = finding;
  return [nvdFinding.cve, nvdFinding.cwe].filter((e) => !!e).join('/');
}

export function createReportFindingRelationship(
  reportSha256: string,
  finding: ContainerFinding,
) {
  const parentKey = generateEntityKey(
    Entities.CONTAINER_REPORT._type,
    reportSha256,
  );
  const childKey = containerFindingEntityKey(finding);
  const relationKey = generateRelationshipKey(
    parentKey,
    Relationships.REPORT_IDENTIFIED_FINDING._class,
    childKey,
  );

  return {
    _class: Relationships.REPORT_IDENTIFIED_FINDING._class,
    _type: Relationships.REPORT_IDENTIFIED_FINDING._type,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
}

export function createMalwareEntity(malware: ContainerMalware) {
  return {
    _key: malwareEntityKey(malware),
    _type: Entities.CONTAINER_MALWARE._type,
    _class: Entities.CONTAINER_MALWARE._class,
    _rawData: [{ name: 'default', rawData: malware }],
    displayName: malware.infectedFile,
    infectedFile: malware.infectedFile,
    fileTypeDescriptor: malware.fileTypeDescriptor,
    md5: malware.md5,
    sha256: malware.sha256,
  };
}

export function malwareEntityKey(malware: ContainerMalware) {
  return generateEntityKey(Entities.CONTAINER_MALWARE._type, malware.md5);
}

export function createReportMalwareRelationship(
  reportSha256: string,
  malware: ContainerMalware,
) {
  const parentKey = generateEntityKey(
    Entities.CONTAINER_REPORT._type,
    reportSha256,
  );
  const childKey = malwareEntityKey(malware);
  const relationKey = generateRelationshipKey(
    parentKey,
    Relationships.REPORT_IDENTIFIED_MALWARE._class,
    childKey,
  );

  return {
    _class: Relationships.REPORT_IDENTIFIED_MALWARE._class,
    _type: Relationships.REPORT_IDENTIFIED_MALWARE._type,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
}

export function createUnwantedProgramEntity(
  unwantedProgram: ContainerUnwantedProgram,
) {
  return {
    _key: unwantedProgramEntityKey(unwantedProgram),
    _type: Entities.CONTAINER_UNWANTED_PROGRAM._type,
    _class: Entities.CONTAINER_UNWANTED_PROGRAM._class,
    _rawData: [{ name: 'default', rawData: unwantedProgram }],
    displayName: unwantedProgram.file,
    file: unwantedProgram.file,
    md5: unwantedProgram.md5,
    sha256: unwantedProgram.sha256,
  };
}

export function unwantedProgramEntityKey(
  unwantedProgram: ContainerUnwantedProgram,
) {
  return generateEntityKey(
    Entities.CONTAINER_UNWANTED_PROGRAM._type,
    unwantedProgram.md5,
  );
}

export function createReportUnwantedProgramRelationship(
  reportSha256: string,
  unwantedProgram: ContainerUnwantedProgram,
) {
  const parentKey = generateEntityKey(
    Entities.CONTAINER_REPORT._type,
    reportSha256,
  );
  const childKey = unwantedProgramEntityKey(unwantedProgram);
  const relationKey = generateRelationshipKey(
    parentKey,
    Relationships.REPORT_IDENTIFIED_UNWANTED_PROGRAM._class,
    childKey,
  );

  return {
    _class: Relationships.REPORT_IDENTIFIED_UNWANTED_PROGRAM._class,
    _type: Relationships.REPORT_IDENTIFIED_UNWANTED_PROGRAM._type,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
}
