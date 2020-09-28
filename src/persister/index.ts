import {
  EntityFromIntegration,
  EntityOperation,
  PersisterClient,
  RelationshipOperation,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  createAccountContainerRelationships,
  createContainerEntities,
  createContainerFindingEntities,
  createContainerReportRelationships,
  createContainerReportUnwantedProgramRelationships,
  createMalwareEntities,
  createReportEntities,
  createReportFindingRelationships,
  createReportMalwareRelationships,
  createUnwantedProgramEntities,
} from "../converters";
import {
  JupiterOneDataModel,
  JupiterOneEntitiesData,
  JupiterOneRelationshipsData,
} from "../jupiterone";
import { TenableDataModel } from "../tenable/types";
import { Account } from "../types";

type EntityDataNames = keyof JupiterOneEntitiesData;
type RelationshipDataNames = keyof JupiterOneRelationshipsData;

export async function publishChanges({
  persister,
  account,
  oldData,
  tenableData,
}: {
  persister: PersisterClient;
  account: Account;
  oldData: JupiterOneDataModel;
  tenableData: TenableDataModel;
}) {
  const newData = convert(tenableData, account);

  const entities = createEntitiesOperations(
    oldData.entities,
    newData.entities,
    persister,
  );
  const relationships = createRelationshipsOperations(
    oldData.relationships,
    newData.relationships,
    persister,
  );

  return await persister.publishPersisterOperations([entities, relationships]);
}

function createEntitiesOperations(
  oldData: JupiterOneEntitiesData,
  newData: JupiterOneEntitiesData,
  persister: PersisterClient,
): EntityOperation[] {
  const dataNames = Object.keys(oldData) as EntityDataNames[];

  return dataNames.reduce((operations: EntityOperation[], dataName) => {
    const oldEntities = oldData[dataName];
    const newEntities = newData[dataName];

    return [
      ...operations,
      ...persister.processEntities<EntityFromIntegration>({
        oldEntities,
        newEntities,
      }),
    ];
  }, []);
}

function createRelationshipsOperations(
  oldData: JupiterOneRelationshipsData,
  newData: JupiterOneRelationshipsData,
  persister: PersisterClient,
): RelationshipOperation[] {
  const defaultOperations: RelationshipOperation[] = [];
  const relationships = Object.keys(oldData) as RelationshipDataNames[];

  return relationships.reduce((operations, relationshipName) => {
    const oldRelationships = oldData[relationshipName];
    const newRelationships = newData[relationshipName];

    return [
      ...operations,
      ...persister.processRelationships({
        oldRelationships,
        newRelationships,
      }),
    ];
  }, defaultOperations);
}

export function convert(
  tenableDataModel: TenableDataModel,
  account: Account,
): JupiterOneDataModel {
  return {
    entities: convertEntities(tenableDataModel),
    relationships: convertRelationships(tenableDataModel, account),
  };
}

export function convertEntities(
  tenableDataModel: TenableDataModel,
): JupiterOneEntitiesData {
  return {
    containers: createContainerEntities(tenableDataModel.containers),
    containerReports: createReportEntities(tenableDataModel.containerReports),
    containerMalwares: createMalwareEntities(
      tenableDataModel.containerMalwares,
    ),
    containerFindings: createContainerFindingEntities(
      tenableDataModel.containerFindings,
    ),
    containerUnwantedPrograms: createUnwantedProgramEntities(
      tenableDataModel.containerUnwantedPrograms,
    ),
  };
}

export function convertRelationships(
  tenableDataModel: TenableDataModel,
  account: Account,
): JupiterOneRelationshipsData {
  return {
    accountContainerRelationships: createAccountContainerRelationships(
      account,
      tenableDataModel.containers,
    ),
    containerReportRelationships: createContainerReportRelationships(
      tenableDataModel.containers,
      tenableDataModel.containerReports,
    ),
    reportMalwareRelationships: createReportMalwareRelationships(
      tenableDataModel.containerReports,
      tenableDataModel.containerMalwares,
    ),
    reportFindingRelationships: createReportFindingRelationships(
      tenableDataModel.containerReports,
      tenableDataModel.containerFindings,
    ),
    reportUnwantedProgramRelationships: createContainerReportUnwantedProgramRelationships(
      tenableDataModel.containerReports,
      tenableDataModel.containerUnwantedPrograms,
    ),
  };
}
