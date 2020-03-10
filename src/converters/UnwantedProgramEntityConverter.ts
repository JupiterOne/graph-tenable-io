import {
  CONTAINER_UNWANTED_PROGRAM_ENTITY_CLASS,
  CONTAINER_UNWANTED_PROGRAM_ENTITY_TYPE,
  ContainerUnwantedProgramEntity,
} from "../jupiterone/entities";
import { ContainerUnwantedProgram, Dictionary } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";

export function createUnwantedProgramEntities(
  data: Dictionary<ContainerUnwantedProgram[]>,
): ContainerUnwantedProgramEntity[] {
  const defaultValue: ContainerUnwantedProgramEntity[] = [];
  const vulnerabilityArrays = Object.values(data);

  const relationships = vulnerabilityArrays.reduce(
    (acc: ContainerUnwantedProgramEntity[], array) => {
      const relationsForOneReport: ContainerUnwantedProgramEntity[] = array.map(
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
): ContainerUnwantedProgramEntity {
  const unwantedProgramId = vulnerability.md5;
  return {
    _key: generateEntityKey(
      CONTAINER_UNWANTED_PROGRAM_ENTITY_TYPE,
      unwantedProgramId,
    ),
    _type: CONTAINER_UNWANTED_PROGRAM_ENTITY_TYPE,
    _class: CONTAINER_UNWANTED_PROGRAM_ENTITY_CLASS,
    _rawData: [{ name: "default", rawData: vulnerability }],
    file: vulnerability.file,
    md5: vulnerability.md5,
    sha256: vulnerability.sha256,
  };
}
