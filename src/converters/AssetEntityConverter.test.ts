import { createAssetEntities } from "./AssetEntityConverter";

test("convert application entities", () => {
  const assets: any[] = [
    {
      id: "df0f891f-f18b-4047-8fe1-6e15ca7798a8",
      has_agent: false,
      last_seen: "2019-04-15T12:16:15.622Z",
      sources: [
        {
          name: "WAS",
          first_seen: "2019-04-12T10:48:54.822Z",
          last_seen: "2019-04-12T10:48:54.822Z",
        },
        {
          name: "NESSUS_SCAN",
          first_seen: "2019-04-15T12:16:15.622Z",
          last_seen: "2019-04-15T12:16:15.622Z",
        },
      ],
      ipv4: ["185.203.72.17"],
      ipv6: [],
      fqdn: [
        "dualbootpartners.com",
        "dualbootpartnerscopy.com",
        "dualbootpartnerscopycopy.com",
      ],
      netbios_name: [],
      operating_system: [],
      agent_name: [],
      aws_ec2_name: [],
      mac_address: [],
    },
    {
      id: "5cf9ecff-6867-46df-bf8f-d819fc8ed0b0",
      has_agent: false,
      last_seen: "2019-04-15T12:16:15.622Z",
      sources: [
        {
          name: "WAS",
          first_seen: "2019-04-12T10:48:00.711Z",
          last_seen: "2019-04-12T10:48:00.711Z",
        },
        {
          name: "NESSUS_SCAN",
          first_seen: "2019-04-15T12:16:15.622Z",
          last_seen: "2019-04-15T12:16:15.622Z",
        },
      ],
      ipv4: ["18.221.79.150"],
      ipv6: [],
      fqdn: ["dualboot.ru"],
      netbios_name: [],
      operating_system: [
        "Linux Kernel 2.2",
        "Linux Kernel 2.4",
        "Linux Kernel 2.6",
      ],
      agent_name: [],
      aws_ec2_name: [],
      mac_address: [],
    },
  ];

  const entities = createAssetEntities(assets);

  expect(entities).toEqual([
    {
      _class: "Application",
      _key: "tenable_asset_df0f891f-f18b-4047-8fe1-6e15ca7798a8",
      _type: "tenable_asset",
      fqdn:
        "dualbootpartners.com, dualbootpartnerscopy.com, dualbootpartnerscopycopy.com",
      hasAgent: false,
      id: "df0f891f-f18b-4047-8fe1-6e15ca7798a8",
      lastSeen: 1555330575622,
    },
    {
      _class: "Application",
      _key: "tenable_asset_5cf9ecff-6867-46df-bf8f-d819fc8ed0b0",
      _type: "tenable_asset",
      fqdn: "dualboot.ru",
      hasAgent: false,
      id: "5cf9ecff-6867-46df-bf8f-d819fc8ed0b0",
      lastSeen: 1555330575622,
    },
  ]);
});
