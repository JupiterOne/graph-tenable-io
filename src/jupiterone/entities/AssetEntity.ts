import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export const ASSET_ENTITY_TYPE = "tenable_asset";
export const ASSET_ENTITY_CLASS = "Application";

export interface AssetEntity extends EntityFromIntegration {
  id: string;
  hasAgent: boolean;
  lastSeen: number;
  fqdn: string;
}
