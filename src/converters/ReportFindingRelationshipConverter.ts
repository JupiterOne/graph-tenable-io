import { entities, relationships } from "../constants";
import {
  ContainerFinding,
  ContainerReport,
  Dictionary,
} from "../tenable/types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";
import { containerFindingEntityKey } from "./FindingEntityConverter";

export function createReportFindingRelationships(
  reports: ContainerReport[],
  findings: Dictionary<ContainerFinding[]>,
) {
  const defaultValue: any[] = [];
  const reportFindingRelationships = reports.reduce((acc, report) => {
    const vulnerabilitiesForReport = findings[report.sha256];
    const relationsForReport = vulnerabilitiesForReport.map(item => {
      return createRelation(item, report.sha256);
    });
    return acc.concat(relationsForReport);
  }, defaultValue);
  return reportFindingRelationships;
}

function createRelation(vulnerability: ContainerFinding, reportId: string) {
  const parentKey = generateEntityKey(
    entities.CONTAINER_REPORT._type,
    reportId,
  );
  const childKey = containerFindingEntityKey(vulnerability);
  const relationKey = generateRelationshipKey(
    parentKey,
    relationships.REPORT_IDENTIFIED_FINDING._class,
    childKey,
  );

  return {
    _class: relationships.REPORT_IDENTIFIED_FINDING._class,
    _type: relationships.REPORT_IDENTIFIED_FINDING._type,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
}
