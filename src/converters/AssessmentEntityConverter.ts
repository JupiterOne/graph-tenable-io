import {
  ASSESSMENT_ENTITY_CLASS,
  ASSESSMENT_ENTITY_TYPE,
  AssessmentEntity,
} from "../jupiterone/entities";
import { Scan } from "../tenable";
import generateKey from "../utils/generateKey";

export function createAssessmentEntities(data: Scan[]): AssessmentEntity[] {
  return data.map(item => {
    const assessmentEntity: AssessmentEntity = {
      _key: generateKey(ASSESSMENT_ENTITY_TYPE, item.id),
      _type: ASSESSMENT_ENTITY_TYPE,
      _class: ASSESSMENT_ENTITY_CLASS,
      id: item.id,
      legacy: item.legacy,
      permissions: item.permissions,
      type: item.type,
      read: item.read,
      lastModificationDate: item.last_modification_date,
      creationDate: item.creation_date,
      status: item.status,
      uuid: item.uuid,
      shared: item.shared,
      userPermissions: item.user_permissions,
      owner: item.owner,
      scheduleUuid: item.schedule_uuid,
      timezone: item.timezone,
      rrules: item.rrules,
      starttime: item.starttime,
      enabled: item.enabled,
      control: item.control,
      name: item.name,
    };

    return assessmentEntity;
  });
}
