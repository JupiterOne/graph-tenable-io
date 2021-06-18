import { entities } from "../constants";
import { ContainerUnwantedProgram, Dictionary } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";

export function createUnwantedProgramEntities(
  data: Dictionary<ContainerUnwantedProgram[]>,
) {
  const defaultValue: any[] = [];
  const vulnerabilityArrays = Object.values(data);

  const relationships = vulnerabilityArrays.reduce((acc, array) => {
    const relationsForOneReport = array.map(createUnwantedProgramEntity);
    return acc.concat(relationsForOneReport);
  }, defaultValue);

  return relationships;
}

function createUnwantedProgramEntity(vulnerability: ContainerUnwantedProgram) {
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
