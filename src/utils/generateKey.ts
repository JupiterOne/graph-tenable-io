import { IntegrationError } from "@jupiterone/jupiter-managed-integration-sdk";

export function generateEntityKey(type: string, id: string | number) {
  if (!type || !id) {
    throw new IntegrationError(
      `Failed to generate valid entity key: type ${type}, id ${id}}`,
    );
  }
  return `${type}_${id}`;
}

export function generateRelationshipKey(
  leftKey: string,
  relationClass: string,
  rightKey: string,
) {
  if (!leftKey || !relationClass || !rightKey) {
    throw new IntegrationError(
      `Failed to generate valid relationship key: leftKey ${leftKey}, relationClass ${relationClass}, rightKey ${rightKey}`,
    );
  }
  return `${leftKey}_${relationClass.toLowerCase()}_${rightKey}`;
}
