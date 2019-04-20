import {
  FINDING_ENTITY_CLASS,
  FINDING_ENTITY_TYPE,
  FindingVulnerabilityEntity,
} from "../jupiterone/entities";
import { Dictionary, Finding } from "../types";
import { generateEntityKey } from "../utils/generateKey";

export function createFindingEntities(
  data: Dictionary<Finding[]>,
): FindingVulnerabilityEntity[] {
  const defaultValue: FindingVulnerabilityEntity[] = [];
  const vulnerabilityArrays = Object.values(data);

  const relationships = vulnerabilityArrays.reduce((acc, array) => {
    const relationsForOneReport: FindingVulnerabilityEntity[] = array.map(
      createFindingEntity,
    );
    return acc.concat(relationsForOneReport);
  }, defaultValue);

  return relationships;
}

function createFindingEntity(
  vulnerability: Finding,
): FindingVulnerabilityEntity {
  const { nvdFinding } = vulnerability;
  const findingId = nvdFinding.reference_id;
  return {
    _key: generateEntityKey(FINDING_ENTITY_TYPE, findingId),
    _type: FINDING_ENTITY_TYPE,
    _class: FINDING_ENTITY_CLASS,
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
