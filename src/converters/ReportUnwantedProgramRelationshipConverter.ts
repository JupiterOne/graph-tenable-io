import { entities, relationships } from "../constants";
import {
  ContainerReport,
  ContainerUnwantedProgram,
  Dictionary,
} from "../tenable/types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";

export function createContainerReportUnwantedProgramRelationships(
  reports: ContainerReport[],
  unwantedPrograms: Dictionary<ContainerUnwantedProgram[]>,
) {
  const defaultValue: any[] = [];
  const unwantedProgramRelationships = reports.reduce((acc, report) => {
    const vulnerabilitiesForReport = unwantedPrograms[report.sha256];
    const relationsForReport = vulnerabilitiesForReport.map(item => {
      return createRelation(item, report.sha256);
    });
    return acc.concat(relationsForReport);
  }, defaultValue);
  return unwantedProgramRelationships;
}

function createRelation(
  vulnerability: ContainerUnwantedProgram,
  reportId: string,
) {
  const unwantedProgramId = vulnerability.md5;
  const parentKey = generateEntityKey(
    entities.CONTAINER_REPORT._type,
    reportId,
  );
  const childKey = generateEntityKey(
    entities.CONTAINER_UNWANTED_PROGRAM._type,
    unwantedProgramId,
  );
  const relationKey = generateRelationshipKey(
    parentKey,
    relationships.CONTAINER_REPORT_IDENTIFIED_UNWANTED_PROGRAM._class,
    childKey,
  );

  return {
    _class: relationships.CONTAINER_REPORT_IDENTIFIED_UNWANTED_PROGRAM._class,
    _type: relationships.CONTAINER_REPORT_IDENTIFIED_UNWANTED_PROGRAM._type,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
}
