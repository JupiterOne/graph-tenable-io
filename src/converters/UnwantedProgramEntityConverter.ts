import {
  PotentiallyUnwantedProgramVulnerabilityEntity,
  UNWANTED_PROGRAM_ENTITY_CLASS,
  UNWANTED_PROGRAM_ENTITY_TYPE,
} from "../jupiterone/entities";
import { Dictionary, PotentiallyUnwantedProgram } from "../types";
import { generateEntityKey } from "../utils/generateKey";

export function createUnwantedProgramEntities(
  data: Dictionary<PotentiallyUnwantedProgram[]>,
): PotentiallyUnwantedProgramVulnerabilityEntity[] {
  const defaultValue: PotentiallyUnwantedProgramVulnerabilityEntity[] = [];
  const vulnerabilityArrays = Object.values(data);

  const relationships = vulnerabilityArrays.reduce(
    (acc: PotentiallyUnwantedProgramVulnerabilityEntity[], array) => {
      const relationsForOneReport: PotentiallyUnwantedProgramVulnerabilityEntity[] = array.map(
        createUnwantedProgramEntity,
      );
      return acc.concat(relationsForOneReport);
    },
    defaultValue,
  );

  return relationships;
}

function createUnwantedProgramEntity(
  vulnerability: PotentiallyUnwantedProgram,
): PotentiallyUnwantedProgramVulnerabilityEntity {
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
