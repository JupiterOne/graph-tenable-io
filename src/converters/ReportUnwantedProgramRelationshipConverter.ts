import {
  CONTAINER_REPORT_ENTITY_TYPE,
  CONTAINER_REPORT_UNWANTED_PROGRAM_RELATIONSHIP_CLASS,
  CONTAINER_REPORT_UNWANTED_PROGRAM_RELATIONSHIP_TYPE,
  CONTAINER_UNWANTED_PROGRAM_ENTITY_TYPE,
  ContainerReportUnwantedProgramRelationship,
} from "../jupiterone/entities";
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
): ContainerReportUnwantedProgramRelationship[] {
  const defaultValue: ContainerReportUnwantedProgramRelationship[] = [];
  const relationships = reports.reduce((acc, report) => {
    const vulnerabilitiesForReport = unwantedPrograms[report.sha256];
    const relationsForReport = vulnerabilitiesForReport.map(item => {
      return createRelation(item, report.sha256);
    });
    return acc.concat(relationsForReport);
  }, defaultValue);
  return relationships;
}

function createRelation(
  vulnerability: ContainerUnwantedProgram,
  reportId: string,
): ContainerReportUnwantedProgramRelationship {
  const unwantedProgramId = vulnerability.md5;
  const parentKey = generateEntityKey(CONTAINER_REPORT_ENTITY_TYPE, reportId);
  const childKey = generateEntityKey(
    CONTAINER_UNWANTED_PROGRAM_ENTITY_TYPE,
    unwantedProgramId,
  );
  const relationKey = generateRelationshipKey(
    parentKey,
    CONTAINER_REPORT_UNWANTED_PROGRAM_RELATIONSHIP_CLASS,
    childKey,
  );

  return {
    _class: CONTAINER_REPORT_UNWANTED_PROGRAM_RELATIONSHIP_CLASS,
    _type: CONTAINER_REPORT_UNWANTED_PROGRAM_RELATIONSHIP_TYPE,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
}
