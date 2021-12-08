import { toNum } from './dataType';

describe('#toNum', () => {
  test('should return `undefined` if `undefined` supplied', () => {
    expect(toNum(undefined)).toEqual(undefined);
  });

  test('should return `number` if `number` supplied', () => {
    expect(toNum(5)).toEqual(5);
  });

  test('should throw if invalid data type supplied supplied', () => {
    expect(() => toNum(true as unknown as string)).toThrowError(
      `Unable able to convert string to number (input=true)`,
    );
  });

  test('should convert `string` to `number`', () => {
    expect(toNum('5')).toEqual(5);
  });
});
