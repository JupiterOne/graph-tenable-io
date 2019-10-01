import {
  ContainerReport,
  ContainerUnwantedProgram,
  Dictionary,
} from "../tenable/types";
import { createContainerReportUnwantedProgramRelationships } from "./ReportUnwantedProgramRelationshipConverter";

test("convert report container vulnerability relationship", () => {
  const reports: ContainerReport[] = [
    {
      malware: [],
      sha256:
        "sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc",
      os: "LINUX_ALPINE",
      risk_score: 0,
      findings: [],
      os_version: "3.8.2",
      created_at: "2019-04-17T10:26:58.509Z",
      platform: "docker",
      image_name: "graph-tenable-app",
      updated_at: "2019-04-17T10:26:58.509Z",
      digest:
        "c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc",
      tag: "latest",
      potentially_unwanted_programs: [],
      docker_image_id: "f8ebac0b4322",
      os_architecture: "AMD64",
    },
  ];
  const unwantedPrograms: Dictionary<ContainerUnwantedProgram[]> = {
    "sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc": [
      {
        file: "file",
        md5: "unwantedProgramMd5",
        sha256: "string",
      },
    ],
  };

  const relationships = createContainerReportUnwantedProgramRelationships(
    reports,
    unwantedPrograms,
  );

  expect(relationships).toEqual([
    {
      _class: "IDENTIFIED",
      _fromEntityKey:
        "tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc",
      _key:
        "tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc_identified_tenable_container_unwanted_program_unwantedProgramMd5",
      _toEntityKey: "tenable_container_unwanted_program_unwantedProgramMd5",
      _type: "tenable_container_report_identified_unwanted_program",
    },
  ]);
});
