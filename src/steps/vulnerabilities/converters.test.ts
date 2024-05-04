import {
  getLargestItemKeyAndByteSize,
  getMacAddresses,
  getPriority,
  getSeverity,
} from './converters';
import { AssetExport } from '../../tenable/client';

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

describe('getLargestItemKeyAndByteSize', () => {
  test('will return largest key and size when it is string', () => {
    const stringProp = new Array(700000).join('aaaaaaaaaa').toString();
    const toCheck = {
      stringProp,
      numberProp: 16,
      booleanProp: false,
      objectProp: {
        smallerStringProp: new Array(500000).join('aaaaaaaaaa').toString(),
      },
    };
    const largestItemAndKey = getLargestItemKeyAndByteSize(toCheck);
    expect(largestItemAndKey).toEqual({
      key: 'stringProp',
      size: Buffer.byteLength(JSON.stringify(stringProp)),
    });
  });

  test('will return largest key and size when it is object', () => {
    const stringProp = new Array(700000).join('aaaaaaaaaa').toString();
    const toCheck = {
      smallerStringProp: new Array(500000).join('aaaaaaaaaa').toString(),
      numberProp: 16,
      booleanProp: false,
      objectProp: {
        stringProp,
      },
    };
    const largestItemAndKey = getLargestItemKeyAndByteSize(toCheck);
    expect(largestItemAndKey).toEqual({
      key: 'objectProp',
      size: Buffer.byteLength(JSON.stringify(toCheck.objectProp)),
    });
  });
});

describe('getMacAddresses Tests', () => {
  test('should filter out duplicates and return unique MAC addresses', () => {
    const testData: AssetExport = {
      network_interfaces: [
        {
          mac_addresses: ['00:1B:44:11:3A:B7'],
          ipv4s: ['8.8.8.8'], // Public IP
        },
        {
          mac_addresses: ['00:1B:44:11:3A:B7'], // Duplicate MAC
          ipv4s: ['8.8.4.4'], // Another Public IP
        },
      ],
    } as AssetExport;
    const result = getMacAddresses(testData);
    expect(result).toEqual(['00:1B:44:11:3A:B7']); // Expect only one entry despite duplicates
  });

  test('should use interfaces with both private and public IPs, treating them as public', () => {
    const testData: AssetExport = {
      network_interfaces: [
        {
          mac_addresses: ['00:1B:44:11:3A:B8'],
          ipv4s: ['192.168.1.1', '8.8.8.8'], // Mixed private and public IPs
        },
      ],
    } as AssetExport;
    const result = getMacAddresses(testData);
    expect(result).toEqual(['00:1B:44:11:3A:B8']); // Expect no MAC addresses since private IP is present
  });

  test('should return MAC addresses only associated with public IPs even if no IPs are public in other interfaces', () => {
    const testData: AssetExport = {
      network_interfaces: [
        {
          mac_addresses: ['00:1B:44:11:3A:B9'],
          ipv4s: ['192.168.1.1'], // Private IP
        },
        {
          mac_addresses: ['00:1B:44:11:3A:BA'],
          ipv4s: ['8.8.8.8'], // Public IP
        },
      ],
    } as AssetExport;
    const result = getMacAddresses(testData);
    expect(result).toEqual(['00:1B:44:11:3A:BA']); // Only public IP associated MAC returned
  });

  test('should handle cases where no network interfaces are provided', () => {
    const testData: AssetExport = {} as AssetExport;
    const result = getMacAddresses(testData);
    expect(result).toEqual([]); // Expect no results when no data is provided
  });

  test('should properly handle entries without any IPs specified', () => {
    const testData: AssetExport = {
      network_interfaces: [
        {
          mac_addresses: ['00:1B:44:11:3A:BC'],
          ipv4s: [], // No IPs listed
          ipv6s: [], // No IPs listed
        },
      ],
    } as unknown as AssetExport;
    const result = getMacAddresses(testData);
    expect(result).toEqual([]); // No IPs mean no public IPs, thus no MACs returned
  });
});
