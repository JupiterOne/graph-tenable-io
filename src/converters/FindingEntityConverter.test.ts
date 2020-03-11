import { ContainerFinding } from "../tenable/types";
import {
  createContainerFindingEntities,
  createContainerFindingEntity,
} from "./FindingEntityConverter";

describe("container vulnerabilities", () => {
  const data: ContainerFinding = {
    nvdFinding: {
      reference_id: "findingId",
      cve: "cve-123",
      published_date: "string",
      modified_date: "string",
      description: "string",
      cvss_score: "2.3",
      access_vector: "string",
      access_complexity: "string",
      auth: "string",
      availability_impact: "string",
      confidentiality_impact: "string",
      integrity_impact: "string",
      cwe: "cwe-234",
      cpe: ["string"],
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
  };

  test("convert many", () => {
    createContainerFindingEntities({ "report-findings-sha": [data] });
  });

  test("convert one", () => {
    const entity = createContainerFindingEntity(data);

    expect(entity).toEqual({
      _class: "Finding",
      _key: "tenable_container_finding_cve-123_cwe-234",
      _type: "tenable_container_finding",
      _rawData: [{ name: "default", rawData: data }],
      displayName: "cve-123/cwe-234",
      accessComplexity: "string",
      accessVector: "string",
      auth: "string",
      availabilityImpact: "string",
      confidentialityImpact: "string",
      cve: "cve-123",
      cvssScore: "2.3",
      cwe: "cwe-234",
      description: "string",
      integrityImpact: "string",
      modifiedDate: "string",
      publishedDate: "string",
      referenceId: "findingId",
      remediation: "string",
      severity: "Low",
      numericSeverity: 2.3,
    });
  });
});
