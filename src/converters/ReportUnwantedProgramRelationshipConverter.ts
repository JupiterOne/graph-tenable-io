import { RelationshipFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";
import { entities, relationships } from "../jupiterone/entities";
import {
  ContainerReport,
  ContainerUnwantedProgram,
  Dictionary,
} from "../tenable/types";
import {
  generateEntityKey,
  generateRelationshipKey,
} from "../utils/generateKey";

type ContainerReportUnwantedProgramRelationship = RelationshipFromIntegration;

export function createContainerReportUnwantedProgramRelationships(
  reports: ContainerReport[],
  unwantedPrograms: Dictionary<ContainerUnwantedProgram[]>,
): ContainerReportUnwantedProgramRelationship[] {
  const defaultValue: ContainerReportUnwantedProgramRelationship[] = [];
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
): ContainerReportUnwantedProgramRelationship {
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
