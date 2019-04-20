import {
  REPORT_ENTITY_TYPE,
  REPORT_UNWANTED_PROGRAM_RELATIONSHIP_CLASS,
  REPORT_UNWANTED_PROGRAM_RELATIONSHIP_TYPE,
  ReportUnwantedProgramRelationship,
  UNWANTED_PROGRAM_ENTITY_TYPE,
} from "../jupiterone/entities";
import { Dictionary, PotentiallyUnwantedProgram, Report } from "../types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";

export function createReportUnwantedProgramRelationships(
  reports: Report[],
  unwantedPrograms: Dictionary<PotentiallyUnwantedProgram[]>,
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
  vulnerability: PotentiallyUnwantedProgram,
  reportId: string,
): ReportUnwantedProgramRelationship {
  const unwantedProgramId = vulnerability.md5;
  const parentKey = generateEntityKey(REPORT_ENTITY_TYPE, reportId);
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
