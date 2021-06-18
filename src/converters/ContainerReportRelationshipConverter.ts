import { RelationshipFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";
import { entities, relationships } from "../constants";
import { Container, ContainerReport } from "../tenable/types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";

type ContainerReportRelationship = RelationshipFromIntegration;

export function createContainerReportRelationships(
  containers: Container[],
  reports: ContainerReport[],
): ContainerReportRelationship[] {
  const defaultValue: ContainerReportRelationship[] = [];

  const containerReportRelationships: ContainerReportRelationship[] = containers.reduce(
    (acc, container) => {
      const report = findReport(reports, container.digest);
      if (!report) {
        return acc;
      }
      const parentKey = generateEntityKey(
        entities.CONTAINER._type,
        container.id,
      );
      const childKey = generateEntityKey(
        entities.CONTAINER_REPORT._type,
        report.sha256,
      );
      const relationKey = generateRelationshipKey(
        parentKey,
        relationships.CONTAINER_HAS_REPORT._class,
        childKey,
      );

      const relationship: ContainerReportRelationship = {
        _class: relationships.CONTAINER_HAS_REPORT._class,
        _type: relationships.CONTAINER_HAS_REPORT._type,
        _fromEntityKey: parentKey,
        _key: relationKey,
        _toEntityKey: childKey,
      };
      return acc.concat(relationship);
    },
    defaultValue,
  );

  return containerReportRelationships;
}

function findReport(reports: ContainerReport[], reportId: string) {
  return reports.find(report => report.sha256 === reportId);
}
