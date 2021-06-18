import {
  PersisterClient,
  summarizePersisterOperationsResults,
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
import { JupiterOneDataModel } from "../jupiterone";
import { TenableDataModel } from "../tenable/types";
import { Account } from "../types";

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
  const containerOperationsResult = await persister.publishEntityOperations(
    persister.processEntities({
      oldEntities: oldData.entities.containers,
      newEntities: createContainerEntities(tenableData.containers),
    }),
  );

  const containerReportOperationsResult = await persister.publishEntityOperations(
    persister.processEntities({
      oldEntities: oldData.entities.containerReports,
      newEntities: createReportEntities(tenableData.containerReports),
    }),
  );

  const containerFindingOperationsResult = await persister.publishEntityOperations(
    persister.processEntities({
      oldEntities: oldData.entities.containerFindings,
      newEntities: createContainerFindingEntities(
        tenableData.containerFindings,
      ),
    }),
  );

  const containerMalwareOperationsResult = await persister.publishEntityOperations(
    persister.processEntities({
      oldEntities: oldData.entities.containerMalwares,
      newEntities: createMalwareEntities(tenableData.containerMalwares),
    }),
  );

  const containerUnwantedProgramsOperationsResult = await persister.publishEntityOperations(
    persister.processEntities({
      oldEntities: oldData.entities.containerUnwantedPrograms,
      newEntities: createUnwantedProgramEntities(
        tenableData.containerUnwantedPrograms,
      ),
    }),
  );

  const accountContainerRelationshipResult = await persister.publishRelationshipOperations(
    persister.processRelationships({
      oldRelationships: oldData.relationships.accountContainerRelationships,
      newRelationships: createAccountContainerRelationships(
        account,
        tenableData.containers,
      ),
    }),
  );

  const containerReportRelationshipResult = await persister.publishRelationshipOperations(
    persister.processRelationships({
      oldRelationships: oldData.relationships.containerReportRelationships,
      newRelationships: createContainerReportRelationships(
        tenableData.containers,
        tenableData.containerReports,
      ),
    }),
  );

  const reportMalwareRelationshipResult = await persister.publishRelationshipOperations(
    persister.processRelationships({
      oldRelationships: oldData.relationships.reportMalwareRelationships,
      newRelationships: createReportMalwareRelationships(
        tenableData.containerReports,
        tenableData.containerMalwares,
      ),
    }),
  );

  const reportFindingRelationshipResult = await persister.publishRelationshipOperations(
    persister.processRelationships({
      oldRelationships: oldData.relationships.reportFindingRelationships,
      newRelationships: createReportFindingRelationships(
        tenableData.containerReports,
        tenableData.containerFindings,
      ),
    }),
  );

  const reportUnwantedProgramRelationshipResult = await persister.publishRelationshipOperations(
    persister.processRelationships({
      oldRelationships:
        oldData.relationships.reportUnwantedProgramRelationships,
      newRelationships: createContainerReportUnwantedProgramRelationships(
        tenableData.containerReports,
        tenableData.containerUnwantedPrograms,
      ),
    }),
  );

  return summarizePersisterOperationsResults(
    containerOperationsResult,
    containerReportOperationsResult,
    containerFindingOperationsResult,
    containerMalwareOperationsResult,
    containerUnwantedProgramsOperationsResult,
    accountContainerRelationshipResult,
    containerReportRelationshipResult,
    reportMalwareRelationshipResult,
    reportFindingRelationshipResult,
    reportUnwantedProgramRelationshipResult,
  );
}
