import {
  GraphClient,
  IntegrationActionName,
  IntegrationExecutionContext,
  IntegrationExecutionResult,
  PersisterClient,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import initializeContext from "./initializeContext";
import fetchEntitiesAndRelationships from "./jupiterone/fetchEntitiesAndRelationships";
import publishChanges from "./persister/publishChanges";
import fetchTenableData from "./tenable/fetchTenableData";
import { TenableIntegrationContext } from "./types";

export default async function executionHandler(
  context: IntegrationExecutionContext,
): Promise<IntegrationExecutionResult> {
  const actionFunction = ACTIONS[context.event.action.name];
  if (actionFunction) {
    return await actionFunction(await initializeContext(context));
  } else {
    return {};
  }
}

async function synchronize(
  context: TenableIntegrationContext,
): Promise<IntegrationExecutionResult> {
  const { graph, persister, provider, account } = context;

  const oldData = await fetchEntitiesAndRelationships(graph);
  const tenableData = await fetchTenableData(provider);

  return {
    operations: summarizePersisterOperationsResults(
      await removeDeprecatedEntities(graph, persister),
      await publishChanges(persister, oldData, tenableData, account),
    ),
  };
}

async function removeDeprecatedEntities(
  graph: GraphClient,
  persister: PersisterClient,
): Promise<PersisterOperationsResult> {
  const results = await Promise.all(
    ["tenable_webapp_vulnerability", "tenable_finding"].map(async t => {
      const entitiesToDelete = await graph.findEntitiesByType(t);
      return persister.publishEntityOperations(
        persister.processEntities(entitiesToDelete, []),
      );
    }),
  );
  return summarizePersisterOperationsResults(...results);
}

type ActionFunction = (
  context: TenableIntegrationContext,
) => Promise<IntegrationExecutionResult>;

interface ActionMap {
  [actionName: string]: ActionFunction | undefined;
}

const ACTIONS: ActionMap = {
  [IntegrationActionName.INGEST]: synchronize,
};
