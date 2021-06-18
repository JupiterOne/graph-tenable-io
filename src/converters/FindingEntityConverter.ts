import { entities } from "../constants";
import { ContainerFinding, Dictionary } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";
import { normalizeCVSS2Severity } from "./vulnerabilities";

export function createContainerFindingEntities(
  data: Dictionary<ContainerFinding[]>,
) {
  return Object.values(data).reduce((acc, array) => {
    return [...acc, ...array.map(createContainerFindingEntity)];
  }, [] as any[]);
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
    entities.CONTAINER_FINDING._type,
    `${nvdFinding.cve}_${nvdFinding.cwe}`,
  );
}

function displayName(vulnerability: ContainerFinding): string {
  const { nvdFinding } = vulnerability;
  return [nvdFinding.cve, nvdFinding.cwe].filter(e => !!e).join("/");
}
