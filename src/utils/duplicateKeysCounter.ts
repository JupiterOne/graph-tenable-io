export default class DuplicateKeysCounter {
  private duplicateKeys: Map<string, number>;

  constructor() {
    this.duplicateKeys = new Map();
  }

  add(_type: string) {
    if (!this.duplicateKeys.has(_type)) {
      this.duplicateKeys.set(_type, 0);
    }
    const newCount = (this.duplicateKeys.get(_type) as number) + 1;
    this.duplicateKeys.set(_type, newCount);
  }

  getObject() {
    return Object.fromEntries(this.duplicateKeys);
  }

  getTotalCount() {
    return Array.from(this.duplicateKeys.values()).reduce((acc, count) => {
      return acc + count;
    }, 0);
  }
}
