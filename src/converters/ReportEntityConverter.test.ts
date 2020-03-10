import { ContainerReport } from "../tenable/types";
import { createReportEntities } from "./ReportEntityConverter";

test("convert report entity", () => {
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

  const entities = createReportEntities(reports);

  expect(entities).toEqual([
    {
      _class: "Assessment",
      _key:
        "tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc",
      _type: "tenable_container_report",
      _rawData: [{ name: "default", rawData: reports[0] }],
      createdAt: 1555496818509,
      digest:
        "c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc",
      dockerImageId: "f8ebac0b4322",
      id:
        "sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc",
      imageName: "graph-tenable-app",
      os: "LINUX_ALPINE",
      osArchitecture: "AMD64",
      osVersion: "3.8.2",
      platform: "docker",
      riskScore: 0,
      sha256:
        "sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc",
      tag: "latest",
      updatedAt: 1555496818509,
    },
  ]);
});
