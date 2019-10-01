import {
  ContainerFinding,
  ContainerReport,
  Dictionary,
} from "../tenable/types";
import { createReportFindingRelationships } from "./ReportFindingRelationshipConverter";

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
  const findings: Dictionary<ContainerFinding[]> = {
    "sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc": [
      {
        nvdFinding: {
          reference_id: "findingId",
          cve: "cve-123",
          cpe: ["string"],
          published_date: "string",
          modified_date: "string",
          description: "string",
          cvss_score: "string",
          access_vector: "string",
          access_complexity: "string",
          auth: "string",
          availability_impact: "string",
          confidentiality_impact: "string",
          integrity_impact: "string",
          cwe: "cwe-234",
          remediation: "string",
          references: ["string"],
        },
        packages: [
          {
            name: "string",
            version: "string",
            release: "string",
            epoch: "string",
            rawString: "string",
          },
        ],
      },
    ],
  };

  const relationships = createReportFindingRelationships(reports, findings);

  expect(relationships).toEqual([
    {
      _class: "IDENTIFIED",
      _fromEntityKey:
        "tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc",
      _key:
        "tenable_container_report_sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc_identified_tenable_container_finding_cve-123_cwe-234",
      _toEntityKey: "tenable_container_finding_cve-123_cwe-234",
      _type: "tenable_container_report_identified_finding",
    },
  ]);
});
