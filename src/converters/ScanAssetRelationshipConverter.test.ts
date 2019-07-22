import { Asset, Host, ScanDetail } from "../tenable/types";
import { createScanAssetRelationships } from "./ScanAssetRelationshipConverter";

const scans: Array<Partial<ScanDetail>> = [
  {
    id: 1234,
    hosts: [
      {
        hostname: "dualbootpartners.com",
      },
    ] as Host[],
  },
];

const assets: Array<Partial<Asset>> = [
  {
    id: "df0f891f-f18b-4047-8fe1-6e15ca7798a8",
    fqdn: [
      "dualbootpartners.com",
      "dualbootpartnerscopy.com",
      "dualbootpartnerscopycopy.com",
    ],
  },
  {
    id: "5cf9ecff-6867-46df-bf8f-d819fc8ed0b0",
    fqdn: ["dualboot.ru"],
  },
];

const unscannedAsset: Array<Partial<Asset>> = [
  {
    id: "5cf9ecff-6867-46df-bf8f-d819fc8ed0b0",
    fqdn: ["dualbootwrong.ru"],
  },
];

describe("createScanAssetRelationship", () => {
  test("uses fqdn", () => {
    const relationships = createScanAssetRelationships(
      scans as ScanDetail[],
      assets as Asset[],
    );
    expect(relationships).toEqual([
      {
        _class: "HAS",
        _fromEntityKey: "tenable_scan_1234",
        _key:
          "tenable_scan_1234_has_tenable_asset_df0f891f-f18b-4047-8fe1-6e15ca7798a8",
        _toEntityKey: "tenable_asset_df0f891f-f18b-4047-8fe1-6e15ca7798a8",
        _type: "tenable_scan_has_tenable_asset",
      },
    ]);
  });

  test("ignores assets unrelated to scan", () => {
    const relationships = createScanAssetRelationships(
      scans as ScanDetail[],
      unscannedAsset as Asset[],
    );
    expect(relationships).toEqual([]);
  });
});
