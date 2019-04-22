import { createFindingEntities } from "./FindingEntityConverter";

test("convert container vulnerability entity", () => {
  const data = {
    "sha256:c42a932fda50763cb2a0169dd853f071a37629cfa4a477b81b4ee87c2b0bb3dc": [
      {
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
      },
    ],
  };

  const entities = createFindingEntities(data as any);

  expect(entities).toEqual([
    {
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
    },
  ]);
});
