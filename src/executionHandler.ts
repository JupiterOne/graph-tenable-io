import {
  IntegrationExecutionContext,
  IntegrationExecutionResult,
  IntegrationInvocationEvent,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import initializeContext from "./initializeContext";
import fetchEntitiesAndRelationships from "./jupiterone/fetchEntitiesAndRelationships";
import fetchTenableData from "./tenable/fetchTenableData";
import publishChanges from "./persister/publishChanges";

export default async function executionHandler(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>,
): Promise<IntegrationExecutionResult> {
  const { graph, persister, provider } = await initializeContext(
    context,
  );

  const oldData = await fetchEntitiesAndRelationships(graph);
  const tenableData = await fetchTenableData(provider);

  return {
    operations: summarizePersisterOperationsResults(
      await publishChanges(persister, oldData, tenableData),
    ),
  };
}
