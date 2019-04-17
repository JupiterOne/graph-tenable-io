import {
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk";
import TenableClient, { Account } from "./tenable/TenableClient";

export default async function initializeContext(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>,
) {
  const { config } = context.instance;

  const provider = new TenableClient(config.accessKey, config.secretKey);

  const { persister, graph } = context.clients.getClients();

  const account: Account = {
    id: context.instance.id,
    name: config.accountName || context.instance.name,
  };

  return {
    graph,
    persister,
    provider,
    account,
  };
}
