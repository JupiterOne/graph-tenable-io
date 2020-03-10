import { createUnwantedProgramEntities } from "./UnwantedProgramEntityConverter";

test("convert container vulnerability entity", () => {
  const data = {
    "sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc": [
      {
        file: "file",
        md5: "unwantedProgramMd5",
        sha256: "string",
      },
    ],
  };

  const entities = createUnwantedProgramEntities(data as any);

  expect(entities).toEqual([
    {
      _class: "Finding",
      _key: "tenable_container_unwanted_program_unwantedProgramMd5",
      _type: "tenable_container_unwanted_program",
      _rawData: [
        {
          name: "default",
          rawData: {
            file: "file",
            md5: "unwantedProgramMd5",
            sha256: "string",
          },
        },
      ],
      file: "file",
      md5: "unwantedProgramMd5",
      sha256: "string",
    },
  ]);
});
