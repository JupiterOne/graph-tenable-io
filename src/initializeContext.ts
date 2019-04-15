import {
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk";
import TenableClient from "./tenable/TenableClient";

export default async function initializeContext(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>,
) {
  const { config } = context.instance;

  const provider = new TenableClient(config.accessKey, config.secretKey);

  const { persister, graph } = context.clients.getClients();

  return {
    graph,
    persister,
    provider,
  };
}
