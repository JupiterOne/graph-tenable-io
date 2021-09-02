import { getPriority, getSeverity, normalizeCVSS2Severity } from './converters';

describe('getSeverity from numericSeverity', () => {
  test('Informational for 0', () => {
    expect(getSeverity(0)).toEqual('Informational');
  });

  test('Low for > 0 < 4', () => {
    expect(getSeverity(0.1)).toEqual('Low');
    expect(getSeverity(3.99)).toEqual('Low');
  });

  test('Medium for >= 4 < 7', () => {
    expect(getSeverity(4)).toEqual('Medium');
    expect(getSeverity(6.99)).toEqual('Medium');
  });

  test('High for >= 7 < 10', () => {
    expect(getSeverity(7)).toEqual('High');
    expect(getSeverity(9.99)).toEqual('High');
  });

  test('Critical for 10', () => {
    expect(getSeverity(10)).toEqual('Critical');
  });

  test('for unknown severity', () => {
    expect(getSeverity(11)).toEqual('Unknown');
  });
});

describe('getPriority from numericPriority', () => {
  test('Low for < 4', () => {
    expect(getPriority(1)).toEqual('Low');
  });

  test('Medium for >= 4 and < 7', () => {
    expect(getPriority(4)).toEqual('Medium');
  });

  test('High for >= 7 and < 9', () => {
    expect(getPriority(7)).toEqual('High');
  });

  test('Critical for >= 9 and < 10', () => {
    expect(getPriority(10)).toEqual('Critical');
  });

  test('for unknown priority', () => {
    expect(getPriority(11)).toEqual('Unknown');
  });
});

describe('normalizeCVSS2Severity', () => {
  test('Low for < 4', () => {
    expect(normalizeCVSS2Severity(0)).toEqual({
      numericSeverity: 0,
      severity: 'Low',
    });
    expect(normalizeCVSS2Severity(0.1)).toEqual({
      numericSeverity: 0.1,
      severity: 'Low',
    });
    expect(normalizeCVSS2Severity(3.99)).toEqual({
      numericSeverity: 3.99,
      severity: 'Low',
    });
  });

  test('Medium for >= 4 < 7', () => {
    expect(normalizeCVSS2Severity(4)).toEqual({
      numericSeverity: 4,
      severity: 'Medium',
    });
    expect(normalizeCVSS2Severity(6.99)).toEqual({
      numericSeverity: 6.99,
      severity: 'Medium',
    });
  });

  test('High for >= 7 < 10', () => {
    expect(normalizeCVSS2Severity(7)).toEqual({
      numericSeverity: 7,
      severity: 'High',
    });
    expect(normalizeCVSS2Severity(9.99)).toEqual({
      numericSeverity: 9.99,
      severity: 'High',
    });
    expect(normalizeCVSS2Severity(10)).toEqual({
      numericSeverity: 10,
      severity: 'High',
    });
  });

  test('error for unknown severity', () => {
    expect(normalizeCVSS2Severity(11)).toEqual({
      numericSeverity: 11,
      severity: undefined,
    });
  });
});
