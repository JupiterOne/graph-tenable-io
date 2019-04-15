export default function generateKey(type: string, id?: string | number) {
  return `${type}_${id}`;
}
