import {
  GraphClient,
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
  PersisterClient,
} from "@jupiterone/jupiter-managed-integration-sdk";

import TenableClient from "./tenable/TenableClient";

export interface TenableExecutionContext
  extends IntegrationExecutionContext<IntegrationInvocationEvent> {
  graph: GraphClient;
  persister: PersisterClient;
  provider: TenableClient;
}
