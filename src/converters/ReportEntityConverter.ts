import {
  CONTAINER_REPORT_ENTITY_CLASS,
  CONTAINER_REPORT_ENTITY_TYPE,
  ContainerReportEntity,
} from "../jupiterone/entities";
import { ContainerReport } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";
import getTime from "../utils/getTime";

export function createReportEntities(
  data: ContainerReport[],
): ContainerReportEntity[] {
  return data.map(report => {
    const reportId = report.sha256;
    const reportEntity: ContainerReportEntity = {
      _key: generateEntityKey(CONTAINER_REPORT_ENTITY_TYPE, reportId),
      _type: CONTAINER_REPORT_ENTITY_TYPE,
      _class: CONTAINER_REPORT_ENTITY_CLASS,
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
