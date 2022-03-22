import { generateEntityKey, generateRelationshipKey } from './generateKey';

describe('generateEntityKey', () => {
  test('missing type', () => {
    expect(() => {
      generateEntityKey(undefined as any, 1);
    }).toThrow(/type undefined, id 1/i);
  });

  test('missing id', () => {
    expect(() => {
      generateEntityKey('type_value', undefined as any);
    }).toThrow(/type type_value, id undefined/i);
  });
});

describe('generateRelationshipKey', () => {
  test('missing leftKey', () => {
    expect(() => {
      generateRelationshipKey(undefined as any, 'CLASS', 'right_key');
    }).toThrow(/leftKey undefined, relationClass CLASS, rightKey right_key/);
  });

  test('missing relationClass', () => {
    expect(() => {
      generateRelationshipKey('left_key', undefined as any, 'right_key');
    }).toThrow(/leftKey left_key, relationClass undefined, rightKey right_key/);
  });

  test('missing rightKey', () => {
    expect(() => {
      generateRelationshipKey('left_key', 'CLASS', undefined as any);
    }).toThrow(/leftKey left_key, relationClass CLASS, rightKey undefined/);
  });
});
