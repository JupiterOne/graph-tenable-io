import {
  CONTAINER_FINDING_ENTITY_CLASS,
  CONTAINER_FINDING_ENTITY_TYPE,
  ContainerFindingEntity,
  VULNERABILITY_FINDING_ENTITY_CLASS,
  VULNERABILITY_FINDING_ENTITY_TYPE,
  VulnerabilityFindingEntity,
} from "../jupiterone/entities";
import {
  ContainerFinding,
  Dictionary,
  ScanVulnerability,
} from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";

export function createVulnerabilityFindingEntities(
  data: Dictionary<ScanVulnerability[]>,
): VulnerabilityFindingEntity[] {
  return Object.values(data).reduce(
    (acc: VulnerabilityFindingEntity[], array) => {
      return [...acc, ...array.map(createVulnerabilityFindingEntity)];
    },
    [],
  );
}

export function createContainerFindingEntities(
  data: Dictionary<ContainerFinding[]>,
): ContainerFindingEntity[] {
  return Object.values(data).reduce((acc: ContainerFindingEntity[], array) => {
    return [...acc, ...array.map(createContainerFindingEntity)];
  }, []);
}

export function createVulnerabilityFindingEntity(
  vulnerability: ScanVulnerability,
): VulnerabilityFindingEntity {
  return {
    _key: vulnerabilityFindingEntityKey(vulnerability),
    _type: VULNERABILITY_FINDING_ENTITY_TYPE,
    _class: VULNERABILITY_FINDING_ENTITY_CLASS,
    scanId: vulnerability.scan_id,
    hostId: vulnerability.host_id,
    hostname: vulnerability.hostname,
  };
}

export function vulnerabilityFindingEntityKey(
  vulnerability: ScanVulnerability,
) {
  return generateEntityKey(
    VULNERABILITY_FINDING_ENTITY_TYPE,
    `${vulnerability.scan_id}_${vulnerability.plugin_id}_${vulnerability.host_id}`,
  );
}

export function createContainerFindingEntity(
  vulnerability: ContainerFinding,
): ContainerFindingEntity {
  const { nvdFinding } = vulnerability;
  return {
    _key: containerFindingEntityKey(vulnerability),
    _type: CONTAINER_FINDING_ENTITY_TYPE,
    _class: CONTAINER_FINDING_ENTITY_CLASS,
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
  };
}

export function containerFindingEntityKey(vulnerability: ContainerFinding) {
  const { nvdFinding } = vulnerability;
  return generateEntityKey(
    CONTAINER_FINDING_ENTITY_TYPE,
    `${nvdFinding.cve}_${nvdFinding.cwe}`,
  );
}
