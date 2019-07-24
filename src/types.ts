import {
  GraphClient,
  IntegrationExecutionContext,
  PersisterClient,
} from "@jupiterone/jupiter-managed-integration-sdk";

import TenableClient from "./tenable/TenableClient";

export interface TenableIntegrationContext extends IntegrationExecutionContext {
  graph: GraphClient;
  persister: PersisterClient;
  provider: TenableClient;
  account: Account;
}

export interface Account {
  id: string;
  name: string;
}
