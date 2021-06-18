import { RelationshipFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";
import { entities, relationships } from "../jupiterone/entities";
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

type ReportFindingRelationship = RelationshipFromIntegration;

export function createReportFindingRelationships(
  reports: ContainerReport[],
  findings: Dictionary<ContainerFinding[]>,
): ReportFindingRelationship[] {
  const defaultValue: ReportFindingRelationship[] = [];
  const reportFindingRelationships = reports.reduce((acc, report) => {
    const vulnerabilitiesForReport = findings[report.sha256];
    const relationsForReport = vulnerabilitiesForReport.map(item => {
      return createRelation(item, report.sha256);
    });
    return acc.concat(relationsForReport);
  }, defaultValue);
  return reportFindingRelationships;
}

function createRelation(
  vulnerability: ContainerFinding,
  reportId: string,
): ReportFindingRelationship {
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
