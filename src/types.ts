import {
  GraphClient,
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
  PersisterClient,
} from "@jupiterone/jupiter-managed-integration-sdk";

import TenableClient, { Account } from "./tenable/TenableClient";

export interface TenableIntegrationContext
  extends IntegrationExecutionContext<IntegrationInvocationEvent> {
  graph: GraphClient;
  persister: PersisterClient;
  provider: TenableClient;
  account: Account;
}
