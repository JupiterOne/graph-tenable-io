import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";
import { entities } from "../constants";
import { ContainerUnwantedProgram, Dictionary } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";

export interface ContainerUnwantedProgramEntity extends EntityFromIntegration {
  file: string;
  md5: string;
  sha256: string;
}

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
      entities.CONTAINER_UNWANTED_PROGRAM._type,
      unwantedProgramId,
    ),
    _type: entities.CONTAINER_UNWANTED_PROGRAM._type,
    _class: entities.CONTAINER_UNWANTED_PROGRAM._class,
    _rawData: [{ name: "default", rawData: vulnerability }],
    file: vulnerability.file,
    md5: vulnerability.md5,
    sha256: vulnerability.sha256,
  };
}
