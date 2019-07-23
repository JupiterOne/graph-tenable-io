import { ContainerFinding, ScanVulnerability } from "../tenable/types";
import {
  createContainerFindingEntities,
  createContainerFindingEntity,
  createVulnerabilityFindingEntities,
  createVulnerabilityFindingEntity,
} from "./FindingEntityConverter";

describe("scan vulnerabilities", () => {
  const data: ScanVulnerability = {
    count: 1,
    host_id: 2,
    hostname: "host.name",
    plugin_family: "Web Scanner",
    plugin_id: 3,
    plugin_name: "Scanner Plugin",
    scan_id: 4,
    severity: 0,
  };

  test("convert many", () => {
    createVulnerabilityFindingEntities({ "host.name": [data] });
  });

  test("convert one", () => {
    const entity = createVulnerabilityFindingEntity(data);

    expect(entity).toEqual({
      _class: "Vulnerability",
      _key: "tenable_vulnerability_finding_4_3_2",
      _type: "tenable_vulnerability_finding",
      scanId: 4,
      hostId: 2,
      hostname: "host.name",
    });
  });
});

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
    createContainerFindingEntities({ "report-findings-sha": [data] });
  });

  test("convert one", () => {
    const entity = createContainerFindingEntity(data);

    expect(entity).toEqual({
      _class: "Vulnerability",
      _key: "tenable_container_finding_findingId",
      _type: "tenable_container_finding",
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
