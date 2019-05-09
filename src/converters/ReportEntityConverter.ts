import {
  REPORT_ENTITY_CLASS,
  REPORT_ENTITY_TYPE,
  ReportEntity,
} from "../jupiterone/entities";
import { Report } from "../types";
import { generateEntityKey } from "../utils/generateKey";
import getTime from "../utils/getTime";

export function createReportEntities(data: Report[]): ReportEntity[] {
  return data.map(report => {
    const reportId = report.sha256;
    const reportEntity: ReportEntity = {
      _key: generateEntityKey(REPORT_ENTITY_TYPE, reportId),
      _type: REPORT_ENTITY_TYPE,
      _class: REPORT_ENTITY_CLASS,
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
