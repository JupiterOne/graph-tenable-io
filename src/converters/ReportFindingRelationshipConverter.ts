import {
  FINDING_ENTITY_TYPE,
  REPORT_ENTITY_TYPE,
  REPORT_FINDING_RELATIONSHIP_CLASS,
  REPORT_FINDING_RELATIONSHIP_TYPE,
  ReportFindingRelationship,
} from "../jupiterone/entities";
import { ContainerFinding, Dictionary, Report } from "../tenable/types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";

export function createReportFindingRelationships(
  reports: Report[],
  findings: Dictionary<ContainerFinding[]>,
): ReportFindingRelationship[] {
  const defaultValue: ReportFindingRelationship[] = [];
  const relationships = reports.reduce((acc, report) => {
    const vulnerabilitiesForReport = findings[report.sha256];
    const relationsForReport = vulnerabilitiesForReport.map(item => {
      return createRelation(item, report.sha256);
    });
    return acc.concat(relationsForReport);
  }, defaultValue);
  return relationships;
}

function createRelation(
  vulnerability: ContainerFinding,
  reportId: string,
): ReportFindingRelationship {
  const findingId = vulnerability.nvdFinding.reference_id;
  const parentKey = generateEntityKey(REPORT_ENTITY_TYPE, reportId);
  const childKey = generateEntityKey(FINDING_ENTITY_TYPE, findingId);
  const relationKey = generateRelationshipKey(
    parentKey,
    REPORT_FINDING_RELATIONSHIP_CLASS,
    childKey,
  );

  return {
    _class: REPORT_FINDING_RELATIONSHIP_CLASS,
    _type: REPORT_FINDING_RELATIONSHIP_TYPE,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
}
