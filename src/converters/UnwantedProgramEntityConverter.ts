import {
  ContainerUnwantedProgramVulnerabilityEntity,
  UNWANTED_PROGRAM_ENTITY_CLASS,
  UNWANTED_PROGRAM_ENTITY_TYPE,
} from "../jupiterone/entities";
import { ContainerUnwantedProgram, Dictionary } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";

export function createUnwantedProgramEntities(
  data: Dictionary<ContainerUnwantedProgram[]>,
): ContainerUnwantedProgramVulnerabilityEntity[] {
  const defaultValue: ContainerUnwantedProgramVulnerabilityEntity[] = [];
  const vulnerabilityArrays = Object.values(data);

  const relationships = vulnerabilityArrays.reduce(
    (acc: ContainerUnwantedProgramVulnerabilityEntity[], array) => {
      const relationsForOneReport: ContainerUnwantedProgramVulnerabilityEntity[] = array.map(
        createUnwantedProgramEntity,
      );
      return acc.concat(relationsForOneReport);
    },
    defaultValue,
  );

  return relationships;
}

function createUnwantedProgramEntity(
  vulnerability: ContainerUnwantedProgram,
): ContainerUnwantedProgramVulnerabilityEntity {
  const unwantedProgramId = vulnerability.md5;
  return {
    _key: generateEntityKey(UNWANTED_PROGRAM_ENTITY_TYPE, unwantedProgramId),
    _type: UNWANTED_PROGRAM_ENTITY_TYPE,
    _class: UNWANTED_PROGRAM_ENTITY_CLASS,
    file: vulnerability.file,
    md5: vulnerability.md5,
    sha256: vulnerability.sha256,
  };
}
