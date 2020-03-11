import {
  CONTAINER_FINDING_ENTITY_CLASS,
  CONTAINER_FINDING_ENTITY_TYPE,
  ContainerFindingEntity,
} from "../jupiterone/entities";
import { ContainerFinding, Dictionary } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";
import { normalizeCVSS2Severity } from "./vulnerabilities";

export function createContainerFindingEntities(
  data: Dictionary<ContainerFinding[]>,
): ContainerFindingEntity[] {
  return Object.values(data).reduce((acc: ContainerFindingEntity[], array) => {
    return [...acc, ...array.map(createContainerFindingEntity)];
  }, []);
}

export function createContainerFindingEntity(
  vulnerability: ContainerFinding,
): ContainerFindingEntity {
  const { nvdFinding } = vulnerability;
  const { numericSeverity, severity } = normalizeCVSS2Severity(
    nvdFinding.cvss_score,
  );

  return {
    _key: containerFindingEntityKey(vulnerability),
    _type: CONTAINER_FINDING_ENTITY_TYPE,
    _class: CONTAINER_FINDING_ENTITY_CLASS,
    _rawData: [{ name: "default", rawData: vulnerability }],
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
    CONTAINER_FINDING_ENTITY_TYPE,
    `${nvdFinding.cve}_${nvdFinding.cwe}`,
  );
}

function displayName(vulnerability: ContainerFinding): string {
  const { nvdFinding } = vulnerability;
  return [nvdFinding.cve, nvdFinding.cwe].filter(e => !!e).join("/");
}
