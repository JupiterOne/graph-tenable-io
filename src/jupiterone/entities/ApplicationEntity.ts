import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export const APPLICATION_ENTITY_TYPE = "tenable_asset";
export const APPLICATION_ENTITY_CLASS = "Application";

export interface ApplicationEntity extends EntityFromIntegration {
  id: string;
  hasAgent: boolean;
  lastSeen: string;
  fqdn: string;
}
