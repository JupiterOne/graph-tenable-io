import { IntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";
import TenableClient from "./tenable/TenableClient";
import { Account, TenableIntegrationContext } from "./types";

export default async function initializeContext(
  context: IntegrationExecutionContext,
): Promise<TenableIntegrationContext> {
  const { config } = context.instance;

  const provider = new TenableClient(config.accessKey, config.secretKey);

  const { persister, graph } = context.clients.getClients();

  const account: Account = {
    id: context.instance.id,
    name: context.instance.name,
  };

  return {
    ...context,
    graph,
    persister,
    provider,
    account,
  };
}
