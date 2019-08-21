import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

import {
  FindingSeverityNormal,
  FindingSeverityNormalName,
} from "../../converters";

export const VULNERABILITY_FINDING_ENTITY_TYPE =
  "tenable_vulnerability_finding";
export const VULNERABILITY_FINDING_ENTITY_CLASS = "Finding";

export const CONTAINER_FINDING_ENTITY_TYPE = "tenable_container_finding";
export const CONTAINER_FINDING_ENTITY_CLASS = "Finding";

export interface VulnerabilityFindingEntity extends EntityFromIntegration {
  scanId: number;
  scanUuid: string;

  assetUuid: string;
  hostId: number;
  hostname: string;

  pluginFamily: string;
  pluginId: number;
  pluginName: string;

  tenableSeverity: number;
  numericSeverity: FindingSeverityNormal;
  severity: FindingSeverityNormalName;

  open: boolean;
  // TODO something similar to https://bitbucket.org/lifeomic/jupiter-docs/pull-requests/217#Lguides/entity-relationship-mappings.mdT311
  // may be necessary, see if placing all in targets will create relationships
  // targetIps: string[],
  // targetFqdns: string[],
  // include fqdn, ip addresses - everything
  targets: string[] | undefined;
  firstSeenOn: number | undefined;
  lastSeenOn: number | undefined;
}

export interface ContainerFindingEntity extends EntityFromIntegration {
  referenceId?: string;
  cve: string;
  publishedDate: string;
  modifiedDate: string;
  description: string;
  cvssScore: string;
  accessVector: string;
  accessComplexity: string;
  auth: string;
  availabilityImpact: string;
  confidentialityImpact: string;
  integrityImpact: string;
  cwe: string;
  remediation: string;
}
