export function generateEntityKey(type: string, id: string | number) {
  return `${type}_${id}`;
}

export function generateRelationshipKey(
  parentKey: string,
  relationClass: string,
  childKey: string,
) {
  return `${parentKey}_${relationClass.toLowerCase()}_${childKey}`;
}
