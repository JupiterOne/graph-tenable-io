import TenableClient from "./TenableClient";
import {
  Container,
  ContainerFinding,
  ContainerMalware,
  ContainerReport,
  ContainerUnwantedProgram,
  Dictionary,
  TenableDataModel,
} from "./types";

export default async function fetchTenableData(
  client: TenableClient,
): Promise<TenableDataModel> {
  const [containers] = await Promise.all([client.fetchContainers()]);

  const {
    reports: containerReports,
    malwares: containerMalwares,
    findings: containerFindings,
    unwantedPrograms: containerUnwantedPrograms,
  } = await fetchReportsWithContainerVulnerabilities(containers, client);

  return {
    containers,
    containerReports,
    containerMalwares,
    containerFindings,
    containerUnwantedPrograms,
  };
}

async function fetchReportsWithContainerVulnerabilities(
  containers: Container[],
  client: TenableClient,
): Promise<{
  reports: ContainerReport[];
  malwares: Dictionary<ContainerMalware[]>;
  findings: Dictionary<ContainerFinding[]>;
  unwantedPrograms: Dictionary<ContainerUnwantedProgram[]>;
}> {
  const malwares: Dictionary<ContainerMalware[]> = {};
  const findings: Dictionary<ContainerFinding[]> = {};
  const unwantedPrograms: Dictionary<ContainerUnwantedProgram[]> = {};
  const reports: ContainerReport[] = await Promise.all(
    containers.map(async item => {
      const report: ContainerReport = await client.fetchReportByImageDigest(
        item.digest,
      );

      /* istanbul ignore next */
      if (!malwares[report.sha256]) {
        malwares[report.sha256] = [];
      }
      /* istanbul ignore next */
      if (!findings[report.sha256]) {
        findings[report.sha256] = [];
      }
      /* istanbul ignore next */
      if (!unwantedPrograms[report.sha256]) {
        unwantedPrograms[report.sha256] = [];
      }

      malwares[report.sha256] = malwares[report.sha256].concat(report.malware);
      findings[report.sha256] = findings[report.sha256].concat(report.findings);
      unwantedPrograms[report.sha256] = unwantedPrograms[report.sha256].concat(
        report.potentially_unwanted_programs,
      );

      return report;
    }),
  );
  return { reports, malwares, findings, unwantedPrograms };
}
