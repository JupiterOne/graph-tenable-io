import { RelationshipFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";
import { entities, relationships } from "../constants";
import { RecentScanSummary, User } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";

export type UserScanRelationship = RelationshipFromIntegration;

export function createUserScanRelationships(
  scans: RecentScanSummary[],
  users: User[],
): UserScanRelationship[] {
  const defaultValue: UserScanRelationship[] = [];

  const userScanRelationships: UserScanRelationship[] = scans.reduce(
    (acc, scan) => {
      const user = findUser(users, scan.owner);
      if (!user) {
        return acc;
      }
      const parentKey = generateEntityKey(entities.USER._type, user.id);
      const childKey = generateEntityKey(entities.SCAN._type, scan.id);
      const relationship: UserScanRelationship = {
        _class: relationships.USER_OWNS_SCAN._class,
        _type: relationships.USER_OWNS_SCAN._type,
        _fromEntityKey: parentKey,
        _key: `${parentKey}_owns_${childKey}`,
        _toEntityKey: childKey,
      };
      return acc.concat(relationship);
    },
    defaultValue,
  );

  return userScanRelationships;
}

function findUser(users: User[], username: string): User | undefined {
  return users.find(user => user.username === username);
}
