import {
  SCAN_ENTITY_TYPE,
  USER_ENTITY_TYPE,
  USER_OWNS_SCAN_RELATIONSHIP_CLASS,
  USER_OWNS_SCAN_RELATIONSHIP_TYPE,
  UserScanRelationship,
} from "../jupiterone/entities";
import { Scan, User } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";

export function createUserScanRelationships(
  scans: Scan[],
  users: User[],
): UserScanRelationship[] {
  const defaultValue: UserScanRelationship[] = [];

  const relationships: UserScanRelationship[] = scans.reduce((acc, scan) => {
    const user = findUser(users, scan.owner);
    if (!user) {
      return acc;
    }
    const parentKey = generateEntityKey(USER_ENTITY_TYPE, user.id);
    const childKey = generateEntityKey(SCAN_ENTITY_TYPE, scan.id);
    const relationship: UserScanRelationship = {
      _class: USER_OWNS_SCAN_RELATIONSHIP_CLASS,
      _type: USER_OWNS_SCAN_RELATIONSHIP_TYPE,
      _fromEntityKey: parentKey,
      _key: `${parentKey}_owns_${childKey}`,
      _toEntityKey: childKey,
    };
    return acc.concat(relationship);
  }, defaultValue);

  return relationships;
}

function findUser(users: User[], username: string): User | undefined {
  return users.find(user => user.username === username);
}
