import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

// TODO does the report entity simply include container details, can we really get rid of this entity?
export const CONTAINER_REPORT_ENTITY_TYPE = "tenable_container_report";
export const CONTAINER_REPORT_ENTITY_CLASS = "Assessment";

export interface ContainerReportEntity extends EntityFromIntegration {
  id: string;
  sha256: string;
  digest: string;
  dockerImageId: string;
  imageName: string;
  tag: string;
  os: string;
  platform: string;
  riskScore: number;
  osArchitecture: string;
  osVersion: string;
  createdAt: number;
  updatedAt: number;
}
