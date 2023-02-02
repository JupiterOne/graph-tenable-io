import { Entities, Relationships } from '../constants';
import {
  ContainerImage,
  ContainerReport,
  ContainerFinding,
  ContainerMalware,
  ContainerUnwantedProgram,
  ContainerRepository,
} from '../../tenable/client';
import { Account } from '../../types';
import { getSeverity } from '../vulnerabilities/converters';
import {
  generateEntityKey,
  generateRelationshipKey,
} from '../../utils/generateKey';
import {
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';

function generateImageKey(image: ContainerImage) {
  return `${image.repoName}:${image.name}:${image.tag}`;
}

export function createContainerRepositoryEntity(repo: ContainerRepository) {
  return createIntegrationEntity({
    entityData: {
      source: repo,
      assign: {
        _key: generateEntityKey(Entities.CONTAINER_REPOSITORY._type, repo.name),
        _type: Entities.CONTAINER_REPOSITORY._type,
        _class: Entities.CONTAINER_REPOSITORY._class,
        name: repo.name,
        displayName: repo.name,
        imagesCount: repo.imagesCount,
        labelsCount: repo.labelsCount,
        vulnerabilitiesCount: repo.vulnerabilitiesCount,
        malwareCount: repo.malwareCount,
        pullCount: repo.pullCount,
        pushCount: repo.pushCount,
        totalBytes: repo.totalBytes,
      },
    },
  });
}

export function createContainerImageEntity(image: ContainerImage) {
  return createIntegrationEntity({
    entityData: {
      source: image,
      assign: {
        _key: generateEntityKey(
          Entities.CONTAINER_IMAGE._type,
          generateImageKey(image),
        ),
        _type: Entities.CONTAINER_IMAGE._type,
        _class: Entities.CONTAINER_IMAGE._class,
        repoId: image.repoId,
        repoName: image.repoName,
        name: image.name,
        displayName: image.name,
        tag: image.tag,
        digest: image.digest,
        hasReport: image.hasReport,
        reportUrl: image.reportUrl,
        hasInventory: image.hasInventory,
        status: image.status,
        lastJobStatus: image.lastJobStatus,
        score: image.score,
        numberOfVulns: image.numberOfVulns,
        numberOfMalware: image.numberOfMalware,
        pullCount: image.pullCount,
        pushCount: image.pushCount,
        source: image.source,
        createdOn: parseTimePropertyValue(image.createdAt),
        updatedOn: parseTimePropertyValue(image.updatedAt),
        finishedOn: parseTimePropertyValue(image.finishedAt),
        uploadedOn: parseTimePropertyValue(image.uploadedAt),
        lastScannedOn: parseTimePropertyValue(image.lastScanned),
        imageHash: image.imageHash,
        size: image.size,
        'layers.size': image.layers.map((img) => img.size),
        'layers.digest': image.layers.map((img) => img.digest),
        os: image.os,
        osVersion: image.osVersion,
      },
    },
  });
}

export function createAccountContainerRepositoryRelationship(
  account: Account,
  repo: ContainerRepository,
) {
  const parentKey = generateEntityKey(Entities.ACCOUNT._type, account.id);
  const childKey = generateEntityKey(
    Entities.CONTAINER_REPOSITORY._type,
    repo.name,
  );
  const relationKey = generateRelationshipKey(
    parentKey,
    Relationships.ACCOUNT_HAS_CONTAINER_REPOSITORY._class,
    childKey,
  );
  const relationship = {
    _class: Relationships.ACCOUNT_HAS_CONTAINER_REPOSITORY._class,
    _type: Relationships.ACCOUNT_HAS_CONTAINER_REPOSITORY._type,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
  return relationship;
}

export function createAccountContainerImageRelationship(
  account: Account,
  image: ContainerImage,
) {
  const parentKey = generateEntityKey(Entities.ACCOUNT._type, account.id);
  const childKey = generateEntityKey(
    Entities.CONTAINER_IMAGE._type,
    generateImageKey(image),
  );
  const relationKey = generateRelationshipKey(
    parentKey,
    Relationships.ACCOUNT_HAS_CONTAINER_IMAGE._class,
    childKey,
  );
  const relationship = {
    _class: Relationships.ACCOUNT_HAS_CONTAINER_IMAGE._class,
    _type: Relationships.ACCOUNT_HAS_CONTAINER_IMAGE._type,
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
    name: report.image_name,
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
    createdAt: parseTimePropertyValue(report.created_at),
    updatedAt: parseTimePropertyValue(report.updated_at),
    category: 'Risk Assessment',
    summary: `findings: ${report.findings.length}, malwares: ${report.malware.length}, unwanted programs: ${report.potentially_unwanted_programs.length}`,
    // TODO: can we determine this?
    internal: false,
  };
  return reportEntity;
}

export function createContainerReportRelationship(
  image: ContainerImage,
  report: ContainerReport,
) {
  const parentKey = generateEntityKey(
    Entities.CONTAINER_IMAGE._type,
    generateImageKey(image),
  );
  const childKey = generateEntityKey(
    Entities.CONTAINER_REPORT._type,
    report.sha256,
  );
  const relationKey = generateRelationshipKey(
    parentKey,
    Relationships.CONTAINER_IMAGE_HAS_REPORT._class,
    childKey,
  );

  const relationship = {
    _class: Relationships.CONTAINER_IMAGE_HAS_REPORT._class,
    _type: Relationships.CONTAINER_IMAGE_HAS_REPORT._type,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
  return relationship;
}

export function createContainerFindingEntity(finding: ContainerFinding) {
  const { nvdFinding } = finding;
  const numericSeverity = Number(nvdFinding.cvss_score);
  const severity = getSeverity(numericSeverity);

  return {
    _key: containerFindingEntityKey(finding),
    _type: Entities.CONTAINER_FINDING._type,
    _class: Entities.CONTAINER_FINDING._class,
    _rawData: [{ name: 'default', rawData: finding }],
    category: nvdFinding.access_vector,
    displayName: displayName(finding),
    name: displayName(finding),
    referenceId: nvdFinding.reference_id,
    cve: nvdFinding.cve,
    nvdPublishedDateOn: parseTimePropertyValue(nvdFinding.published_date),
    nvdModifiedDateOn: parseTimePropertyValue(nvdFinding.modified_date),
    description: nvdFinding.description,
    cvssScore: nvdFinding.cvss_score,
    vector: nvdFinding.cvss_vector,
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
    // TODO: can we determine this?
    open: true,
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
