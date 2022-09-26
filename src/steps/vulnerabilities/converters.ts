import {
  createIntegrationEntity,
  Entity,
  IntegrationLogger,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { Entities } from '../../constants';
import { AssetExport, VulnerabilityExport } from '../../tenable/client';
import { generateEntityKey } from '../../utils/generateKey';
import { TargetEntity } from '../../utils/targetEntities';

interface KeyAndSize {
  key: string;
  size: number;
}

export function getLargestItemKeyAndByteSize(data: any): KeyAndSize {
  const largestItem: KeyAndSize = { key: '', size: 0 };
  for (const item in data) {
    if (['object', 'string'].includes(typeof item)) {
      const length = data[item]
        ? Buffer.byteLength(JSON.stringify(data[item]))
        : 0;
      if (length > largestItem.size) {
        largestItem.key = item;
        largestItem.size = length;
      }
    }
  }

  return largestItem;
}

export function createAssetEntity(
  data: AssetExport,
  logger: IntegrationLogger,
): Entity {
  try {
    const size = Buffer.byteLength(JSON.stringify(data));
    if (size > 1048576) {
      logger.info(
        {
          assetId: data.id,
          totalSize: size,
          largestItem: getLargestItemKeyAndByteSize(data),
        },
        'Encountered entity of size > 1MB',
      );
    }
  } catch (err) {
    logger.warn({ err }, 'Encountered error when checking entity size');
  }

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: Entities.ASSET._class,
        _type: Entities.ASSET._type,
        _key: data.id,

        // JupiterOne required properties
        name: data.hostnames?.[0] || data.ipv4s?.[0] || data.ipv6s?.[0],
        function: ['vulnerability-detection'],

        id: data.id,
        deletedBy: data.deleted_by || undefined,
        hasAgent: data.has_agent,
        hasPluginResults: data.has_plugin_results,
        createdAt: parseTimePropertyValue(data.created_at),
        terminatedAt: parseTimePropertyValue(data.terminated_at),
        terminatedBy: data.terminated_by,
        updatedAt: parseTimePropertyValue(data.updated_at),
        deletedAt: parseTimePropertyValue(data.deleted_at),
        firstSeenOn: parseTimePropertyValue(data.first_seen),
        lastSeenOn: parseTimePropertyValue(data.last_seen),
        firstScanTime: parseTimePropertyValue(data.first_scan_time),
        lastScanTime: parseTimePropertyValue(data.last_scan_time),
        lastAuthenticatedScanDate: parseTimePropertyValue(
          data.last_authenticated_scan_date,
        ),
        lastLicensedScanDate: parseTimePropertyValue(
          data.last_licensed_scan_date,
        ),
        lastScanId: data.last_scan_id,
        lastScheduleId: data.last_schedule_id,
        agentUuid: data.agent_uuid,
        biosUuid: data.bios_uuid,
        networkId: data.network_id,
        networkName: data.network_name,
        agentNames: data.agent_names,
        installedSoftware: data.installed_software,
        ipv4s: data.ipv4s,
        ipv6s: data.ipv6s,
        fqdns: data.fqdns,
        macAddresses: data.mac_addresses,
        netbiosNames: data.netbios_names,
        operatingSystems: data.operating_systems,
        // Provider-specific properties
        // azure
        azureResourceId: data.azure_resource_id,
        azureVmId: data.azure_vm_id,
        // gcp
        gcpProjectId: data.gcp_project_id,
        gcpInstanceId: data.gcp_instance_id,
        gcpZone: data.gcp_zone,
        // aws
        awsEc2InstanceAmiId: data.aws_ec2_instance_ami_id,
        awsEc2InstanceGroupName: data.aws_ec2_instance_group_name,
        awsEc2InstanceId: data.aws_ec2_instance_id,
        awsEc2InstanceState: data.aws_ec2_instance_state_name,
        awsEc2InstanceType: data.aws_ec2_instance_type,
        awsEc2Name: data.aws_ec2_name,
        awsEc2ProductCode: data.aws_ec2_product_code,
        awsOwnerId: data.aws_owner_id,
        awsRegion: data.aws_region,
        awsSubnetId: data.aws_subnet_id,
        awsVpcId: data.aws_vpc_id,
        awsAvailabilityZone: data.aws_availability_zone,
        // mcafee
        mcafeeEpoAgentId: data.mcafee_epo_agent_guid,
        mcafeeEpoGuid: data.mcafee_epo_guid,
        // sevicenow
        servicenowSysid: data.servicenow_sysid,
        // bigfix
        bigfixAssetId: data.bigfix_asset_id,
        tags: data.tags?.map((tag) => `${tag.key}=${tag.value}`),
        // TODO Add sources, tags, networkInterfaces
        // sources: data.sources,
        // networkInterfaces: data.network_interfaces,
      },
    },
  });
}

export function createTargetHostEntity(data: AssetExport): TargetEntity {
  let targetFilter;

  if (data.aws_ec2_instance_id) {
    // TODO test EC2 instance mapping and attempt to build _key property
    targetFilter = {
      instanceId: data.aws_ec2_instance_id,
      _type: 'aws_instance',
    };
  } else if (data.azure_resource_id) {
    targetFilter = {
      // See createVirtualMachineEntity()  https://github.com/JupiterOne/graph-azure/blob/main/src/steps/resource-manager/compute/converters.ts#L33
      _key: data.azure_resource_id.toLowerCase(),
      _type: 'azure_vm',
    };
  } else if (data.gcp_instance_id) {
    // TODO test GCP instance mapping and attempt to build _key property
    targetFilter = {
      id: data.gcp_instance_id,
      projectId: data.gcp_project_id,
      _type: 'google_compute_instance',
    };
  } else {
    // just make sure that at least all of the mapped relationships from this integration target the same entity.
    // `ipv4`, `ipv6`, `mac_address`, and `fqdn` are all arrays, so filtering on them won't do.
    targetFilter = {
      id: data.id,
      _type: 'tenable_asset',
    };
  }

  const targetEntity = {
    // JUPITERONE REQUIRED PROPERTIES
    _class: 'Host',
    _type: 'tenable_asset',
    _key: data.id,
  };

  return {
    targetEntity: {
      ...targetEntity,
      ...targetFilter,
    },
    targetFilterKeys: [Object.keys(targetFilter)],
    skipTargetCreation: true,
  };
}

// TODO: Move these into integration SDK and push out to other scanner
// integrations
export enum FindingSeverityPriority {
  Informational = 'Informational',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
  Unknown = 'Unknown',
}

/**
 * Converts Tenable Plugin Severity Ratings or "Risk Factor" to label. See
 * https://community.tenable.com/s/article/Active-Plugins-Severity-vs-CVSS-v2-and-v3-scores
 *
 * Throws an `IntegrationError` when the Tenable severity number is not
 * recognized.
 */
export function getSeverity(numericSeverity: number): FindingSeverityPriority {
  if (numericSeverity === 0) {
    return FindingSeverityPriority.Informational;
  } else if (numericSeverity < 4) {
    return FindingSeverityPriority.Low;
  } else if (numericSeverity < 7) {
    return FindingSeverityPriority.Medium;
  } else if (numericSeverity < 10) {
    return FindingSeverityPriority.High;
  } else if (numericSeverity === 10) {
    return FindingSeverityPriority.Critical;
  } else {
    return FindingSeverityPriority.Unknown;
  }
}

/**
 * Converts Tenable Priority Ratings to label. See
 * https://docs.tenable.com/tenablesc/5_9/Content/RiskMetrics.htm#VPR
 */
export function getPriority(numericPriority: number): FindingSeverityPriority {
  if (numericPriority < 4) {
    return FindingSeverityPriority.Low;
  } else if (numericPriority < 7) {
    return FindingSeverityPriority.Medium;
  } else if (numericPriority < 9) {
    return FindingSeverityPriority.High;
  } else if (numericPriority <= 10) {
    return FindingSeverityPriority.Critical;
  } else {
    return FindingSeverityPriority.Unknown;
  }
}

/**
 * Converts NVD CVSS2 severity values to J1 normalized numeric values. See
 * https://nvd.nist.gov/vuln-metrics/cvss.
 *
 * Throws an `IntegrationError` when the CVSS2 severity value is not recognized.
 */
export function normalizeCVSS2Severity(cvss2Severity: number | string): {
  numericSeverity: number;
  severity: FindingSeverityPriority | undefined;
} {
  const numericSeverity = Number(cvss2Severity);
  let severity;
  if (numericSeverity < 4) {
    severity = FindingSeverityPriority.Low;
  } else if (numericSeverity < 7) {
    severity = FindingSeverityPriority.Medium;
  } else if (numericSeverity <= 10) {
    severity = FindingSeverityPriority.High;
  }
  return { numericSeverity, severity };
}

export function getTargetsForAsset(asset: AssetExport): string[] {
  return [asset.fqdns, asset.ipv4s, asset.ipv6s, asset.mac_addresses].reduce(
    (a, e) => [...a, ...e],
  );
}

export function createVulnerabilityEntity(
  vuln: VulnerabilityExport,
  targetsForAsset: string[],
  logger: IntegrationLogger,
): Entity {
  const numericPriority = vuln.plugin.vpr && vuln.plugin.vpr.score;
  const priority = numericPriority && getPriority(numericPriority);
  try {
    const size = Buffer.byteLength(JSON.stringify(vuln));
    if (size > 1048576) {
      logger.info(
        {
          asset_uuid: vuln.asset.uuid,
          cves: vuln.plugin.cve,
          scanId: vuln.scan.uuid,
          pluginId: vuln.plugin.id,
          totalSize: size,
          largetsItem: getLargestItemKeyAndByteSize(vuln),
        },
        'Encountered entity of size > 1MB',
      );
    }
  } catch (err) {
    logger.warn({ err }, 'Encountered error when checking entity size');
  }
  return createIntegrationEntity({
    entityData: {
      source: vuln,
      assign: {
        _key: generateEntityKey(
          Entities.VULNERABILITY._type,
          `${vuln.scan.uuid}_${vuln.plugin.id}_${vuln.asset.uuid}`,
        ),
        _type: Entities.VULNERABILITY._type,
        _class: Entities.VULNERABILITY._class,
        // schema
        name: vuln.plugin.name,
        category: vuln.asset.device_type,
        status: vuln.state,
        severity: vuln.plugin.risk_factor,
        numericSeverity: vuln.plugin.cvss3_base_score,
        vector: vuln.plugin.cvss3_vector?.raw || '',
        // Add targets for mapping rules.
        targets: targetsForAsset,
        open: vuln.state === 'OPEN',
        references: vuln.plugin.see_also,

        // additional asset properties can be added
        'asset.uuid': vuln.asset.uuid,
        assetHostname: vuln.asset.hostname,
        assetIpv4: vuln.asset.ipv4,
        assetDeviceType: vuln.asset.device_type,
        assetMacAddress: vuln.asset.mac_address,
        agentId: vuln.asset.agent_uuid,
        firstFound: parseTimePropertyValue(vuln.first_found),
        lastFound: parseTimePropertyValue(vuln.last_found),
        // additional plugin properties can be added
        'plugin.id': vuln.plugin.id,
        stigSeverity: vuln.plugin.stig_severity,
        'port.port': vuln.port.port,
        'port.protocol': vuln.port.protocol,
        'port.service': vuln.port.service,
        vprScore: numericPriority,
        riskFactor: vuln.plugin.risk_factor,
        // additional scan properties can be added
        'scan.uuid': vuln.scan.uuid,
        'scan.startedAt': parseTimePropertyValue(vuln.scan.started_at),
        'scan.completedAt': parseTimePropertyValue(vuln.scan.completed_at),
        severityDefaultId: vuln.severity_default_id,
        severityId: vuln.severity_id,
        severityModificationType: vuln.severity_modification_type,
        state: vuln.state,
        exploitAvailable: vuln.plugin.exploit_available,
        exploitFrameworkCanvas: vuln.plugin.exploit_framework_canvas,
        exploitFrameworkCore: vuln.plugin.exploit_framework_core,
        exploitFrameworkD2Elliot: vuln.plugin.exploit_framework_d2_elliot,
        exploitFrameworkExploithub: vuln.plugin.exploit_framework_exploithub,
        exploitFrameworkMetasploit: vuln.plugin.exploit_framework_metasploit,
        exploitabilityEase: vuln.plugin.exploitability_ease,
        exploitedByMalware: vuln.plugin.exploited_by_malware,
        exploitedByNessus: vuln.plugin.exploited_by_nessus,

        // data model properties
        numericPriority,
        priority,
        firstSeenOn: parseTimePropertyValue(vuln.first_found),
        lastSeenOn: parseTimePropertyValue(vuln.last_found),
      },
    },
  });
}

export function createTargetCveEntities(
  data: VulnerabilityExport,
): TargetEntity[] {
  const cves: string[] | undefined = data.plugin.cve;
  return (cves || []).map((cve) => {
    return {
      targetEntity: {
        _class: 'Vulnerability',
        _type: 'cve',
        _key: cve.toLowerCase(),
        name: cve.toUpperCase(),
        displayName: cve.toUpperCase(),
      },
      targetFilterKeys: [['_type', '_key']],
    };
  });
}
