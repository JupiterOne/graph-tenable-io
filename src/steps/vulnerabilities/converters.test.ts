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

describe('getMacAddresses', () => {
  test('returns unique MAC addresses based on FQDNs and direct list', () => {
    const data = {
      fqdns: ['example.com', 'test.com'],
      mac_addresses: ['00:11:22:33:44:55', '00:11:22:33:44:66'],
      network_interfaces: [
        {
          fqdns: ['example.com'],
          mac_addresses: ['00:AA:BB:CC:DD:EE'],
        },
        {
          fqdns: ['another.com'],
          mac_addresses: ['00:FF:EE:DD:CC:BB'],
        },
      ],
    } as AssetExport;
    expect(getMacAddresses(data)).toEqual([
      '00:AA:BB:CC:DD:EE',
      '00:11:22:33:44:55',
      '00:11:22:33:44:66',
    ]);
  });

  test('handles no FQDNs provided', () => {
    const data = {
      fqdns: [],
      mac_addresses: ['00:11:22:33:44:55'],
      network_interfaces: [
        {
          fqdns: ['example.com'],
          mac_addresses: ['00:AA:BB:CC:DD:EE'],
        },
      ],
    } as unknown as AssetExport;
    expect(getMacAddresses(data)).toEqual(['00:11:22:33:44:55']);
  });

  test('handles no network interfaces provided', () => {
    const data = {
      fqdns: ['example.com'],
      mac_addresses: ['00:11:22:33:44:55'],
      network_interfaces: [],
    } as unknown as AssetExport;
    expect(getMacAddresses(data)).toEqual(['00:11:22:33:44:55']);
  });

  test('ignores network interfaces without matching FQDNs', () => {
    const data = {
      fqdns: ['test.com'],
      mac_addresses: ['00:11:22:33:44:55'],
      network_interfaces: [
        {
          fqdns: ['example.com'],
          mac_addresses: ['00:AA:BB:CC:DD:EE'],
        },
      ],
    } as unknown as AssetExport;
    expect(getMacAddresses(data)).toEqual(['00:11:22:33:44:55']);
  });

  test('returns empty array when no FQDNs or mac_addresses are provided', () => {
    const data = {
      fqdns: [],
      mac_addresses: [],
      network_interfaces: [],
    } as unknown as AssetExport;
    expect(getMacAddresses(data)).toEqual([]);
  });

  test('removes duplicate MAC addresses', () => {
    const data = {
      fqdns: ['example.com'],
      mac_addresses: ['00:11:22:33:44:55'],
      network_interfaces: [
        {
          fqdns: ['example.com'],
          mac_addresses: ['00:11:22:33:44:55'],
        },
      ],
    } as unknown as AssetExport;
    expect(getMacAddresses(data)).toEqual(['00:11:22:33:44:55']);
  });
});
