import { ContainerFinding } from "../tenable/types";
import {
  createFindingEntities,
  createFindingEntity,
} from "./FindingEntityConverter";

describe("container vulnerabilities", () => {
  const data: ContainerFinding = {
    nvdFinding: {
      reference_id: "findingId",
      cve: "string",
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
      cwe: "string",
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
    createFindingEntities({ "report-findings-sha": [data] });
  });

  test("convert one", () => {
    const entity = createFindingEntity(data);

    expect(entity).toEqual({
      _class: "Vulnerability",
      _key: "tenable_finding_findingId",
      _type: "tenable_finding",
      accessComplexity: "string",
      accessVector: "string",
      auth: "string",
      availabilityImpact: "string",
      confidentialityImpact: "string",
      cve: "string",
      cvssScore: "string",
      cwe: "string",
      description: "string",
      integrityImpact: "string",
      modifiedDate: "string",
      publishedDate: "string",
      referenceId: "findingId",
      remediation: "string",
    });
  });
});
