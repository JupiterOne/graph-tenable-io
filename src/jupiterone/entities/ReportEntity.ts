import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export const REPORT_ENTITY_TYPE = "tenable_report";
export const REPORT_ENTITY_CLASS = "Assessment";

export interface ReportEntity extends EntityFromIntegration {
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
  createdAt: string;
  updatedAt: string;
}
