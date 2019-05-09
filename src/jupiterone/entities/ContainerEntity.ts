import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export const CONTAINER_ENTITY_TYPE = "tenable_container";
export const CONTAINER_ENTITY_CLASS = "Image";

export interface ContainerEntity extends EntityFromIntegration {
  id: string;
  repoId: string;
  platform: string;
  name: string;
  size: string;
  digest: string;
  repoName: string;
  score: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  numberOfVulnerabilities: string;
}
