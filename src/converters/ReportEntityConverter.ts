import {
  REPORT_ENTITY_CLASS,
  REPORT_ENTITY_TYPE,
  ReportEntity,
} from "../jupiterone/entities";
import { Report } from "../tenable";
import generateKey from "../utils/generateKey";

export function createReportEntities(data: Report[]): ReportEntity[] {
  return data.map(report => {
    const reportId = report.sha256;
    const reportEntity: ReportEntity = {
      _key: generateKey(REPORT_ENTITY_TYPE, reportId),
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
      createdAt: report.created_at,
      updatedAt: report.updated_at,
    };
    return reportEntity;
  });
}
