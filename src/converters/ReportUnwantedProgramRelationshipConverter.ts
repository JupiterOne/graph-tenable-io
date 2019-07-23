import {
  CONTAINER_REPORT_ENTITY_TYPE,
  REPORT_UNWANTED_PROGRAM_RELATIONSHIP_CLASS,
  REPORT_UNWANTED_PROGRAM_RELATIONSHIP_TYPE,
  ReportUnwantedProgramRelationship,
  UNWANTED_PROGRAM_ENTITY_TYPE,
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

export function createReportUnwantedProgramRelationships(
  reports: ContainerReport[],
  unwantedPrograms: Dictionary<ContainerUnwantedProgram[]>,
): ReportUnwantedProgramRelationship[] {
  const defaultValue: ReportUnwantedProgramRelationship[] = [];
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
): ReportUnwantedProgramRelationship {
  const unwantedProgramId = vulnerability.md5;
  const parentKey = generateEntityKey(CONTAINER_REPORT_ENTITY_TYPE, reportId);
  const childKey = generateEntityKey(
    UNWANTED_PROGRAM_ENTITY_TYPE,
    unwantedProgramId,
  );
  const relationKey = generateRelationshipKey(
    parentKey,
    REPORT_UNWANTED_PROGRAM_RELATIONSHIP_CLASS,
    childKey,
  );

  return {
    _class: REPORT_UNWANTED_PROGRAM_RELATIONSHIP_CLASS,
    _type: REPORT_UNWANTED_PROGRAM_RELATIONSHIP_TYPE,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
}
