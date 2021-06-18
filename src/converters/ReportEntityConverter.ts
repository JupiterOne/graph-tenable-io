import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";
import { entities } from "../constants";
import { ContainerReport } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";
import getTime from "../utils/getTime";

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

export function createReportEntities(
  data: ContainerReport[],
): ContainerReportEntity[] {
  return data.map(report => {
    const reportId = report.sha256;
    const reportEntity: ContainerReportEntity = {
      _key: generateEntityKey(entities.CONTAINER_REPORT._type, reportId),
      _type: entities.CONTAINER_REPORT._type,
      _class: entities.CONTAINER_REPORT._class,
      _rawData: [{ name: "default", rawData: report }],
      id: reportId,
      sha256: report.sha256,
      digest: report.digest,
      dockerImageId: report.docker_image_id,
      imageName: report.image_name,
      tag: report.tag,
      os: report.os,
      platform: report.platform,
      riskScore: report.risk_score,
      osArchitecture: report.os_architecture,
      osVersion: report.os_version,
      createdAt: getTime(report.created_at)!,
      updatedAt: getTime(report.updated_at)!,
    };
    return reportEntity;
  });
}
