import {
  ASSESSMENT_ENTITY_TYPE,
  USER_ENTITY_TYPE,
  USER_HAS_ASSESSMENT_RELATIONSHIP_CLASS,
  USER_HAS_ASSESSMENT_RELATIONSHIP_TYPE,
  UserAssessmentRelationship,
} from "../jupiterone/entities";
import { Scan, User } from "../tenable";
import generateKey from "../utils/generateKey";

export function createUserAssessmentRelationships(
  scans: Scan[],
  users: User[],
): UserAssessmentRelationship[] {
  const defaultValue: UserAssessmentRelationship[] = [];

  const relationships: UserAssessmentRelationship[] = scans.reduce(
    (acc, scan) => {
      const user = findUser(users, scan.owner);
      if (!user) {
        return acc;
      }
      const parentKey = generateKey(USER_ENTITY_TYPE, user.id);
      const childKey = generateKey(ASSESSMENT_ENTITY_TYPE, scan.id);
      const relationship: UserAssessmentRelationship = {
        _class: USER_HAS_ASSESSMENT_RELATIONSHIP_CLASS,
        _type: USER_HAS_ASSESSMENT_RELATIONSHIP_TYPE,
        _fromEntityKey: parentKey,
        _key: `${parentKey}_owns_${childKey}`,
        _toEntityKey: childKey,
      };
      return acc.concat(relationship);
    },
    defaultValue,
  );

  return relationships;
}

function findUser(users: User[], username: string) {
  return users.find(user => user.username === username);
}
