export default function getUnique(array: any[], uniqueField: string) {
  const set = new Set();
  return array
    .map((item, index) => {
      if (set.has(item[uniqueField])) {
        return false;
      } else {
        set.add(item[uniqueField]);
        return index;
      }
    })
    .filter(e => e)
    .map(e => array[e as number]);
}
