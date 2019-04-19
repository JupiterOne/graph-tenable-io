import {
  CONTAINER_ENTITY_TYPE,
  CONTAINER_REPORT_RELATIONSHIP_CLASS,
  CONTAINER_REPORT_RELATIONSHIP_TYPE,
  ContainerReportRelationship,
  REPORT_ENTITY_TYPE,
} from "../jupiterone/entities";
import { Container, Report } from "../tenable";
import generateKey from "../utils/generateKey";

export function createContainerReportRelationships(
  containers: Container[],
  reports: Report[],
): ContainerReportRelationship[] {
  const defaultValue: ContainerReportRelationship[] = [];

  const relationships: ContainerReportRelationship[] = containers.reduce(
    (acc, container) => {
      const report = findReport(reports, container.digest);
      if (!report) {
        return acc;
      }
      const parentKey = generateKey(CONTAINER_ENTITY_TYPE, container.id);
      const childKey = generateKey(REPORT_ENTITY_TYPE, report.sha256);
      const relationship: ContainerReportRelationship = {
        _class: CONTAINER_REPORT_RELATIONSHIP_CLASS,
        _type: CONTAINER_REPORT_RELATIONSHIP_TYPE,
        _fromEntityKey: parentKey,
        _key: `${parentKey}_has_${childKey}`,
        _toEntityKey: childKey,
      };
      return acc.concat(relationship);
    },
    defaultValue,
  );

  return relationships;
}

function findReport(reports: Report[], reportId: string) {
  return reports.find(report => report.sha256 === reportId);
}
