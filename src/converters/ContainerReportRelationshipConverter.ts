import {
  CONTAINER_ENTITY_TYPE,
  CONTAINER_REPORT_RELATIONSHIP_CLASS,
  CONTAINER_REPORT_RELATIONSHIP_TYPE,
  ContainerReportRelationship,
  REPORT_ENTITY_TYPE,
} from "../jupiterone/entities";
import { Container, ContainerReport } from "../tenable/types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";

export function createContainerReportRelationships(
  containers: Container[],
  reports: ContainerReport[],
): ContainerReportRelationship[] {
  const defaultValue: ContainerReportRelationship[] = [];

  const relationships: ContainerReportRelationship[] = containers.reduce(
    (acc, container) => {
      const report = findReport(reports, container.digest);
      if (!report) {
        return acc;
      }
      const parentKey = generateEntityKey(CONTAINER_ENTITY_TYPE, container.id);
      const childKey = generateEntityKey(REPORT_ENTITY_TYPE, report.sha256);
      const relationKey = generateRelationshipKey(
        parentKey,
        CONTAINER_REPORT_RELATIONSHIP_CLASS,
        childKey,
      );

      const relationship: ContainerReportRelationship = {
        _class: CONTAINER_REPORT_RELATIONSHIP_CLASS,
        _type: CONTAINER_REPORT_RELATIONSHIP_TYPE,
        _fromEntityKey: parentKey,
        _key: relationKey,
        _toEntityKey: childKey,
      };
      return acc.concat(relationship);
    },
    defaultValue,
  );

  return relationships;
}

function findReport(reports: ContainerReport[], reportId: string) {
  return reports.find(report => report.sha256 === reportId);
}
