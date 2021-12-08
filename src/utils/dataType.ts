export function toNum(v?: string | number | undefined): number | undefined {
  if (typeof v === 'number' || typeof v === 'undefined') return v;
  const num = parseInt(v);

  if (isNaN(num)) {
    throw new Error(`Unable able to convert string to number (input=${v})`);
  }

  return num;
}
