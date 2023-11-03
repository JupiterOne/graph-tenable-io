import {
  createIntegrationEntity,
  Entity,
  IntegrationLogger,
  parseTimePropertyValue,
  assignTags,
} from '@jupiterone/integration-sdk-core';
import { Entities } from '../constants';
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

export function createAssetEntity(data: AssetExport): Entity {
  const entity = createIntegrationEntity({
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
        createdOn: parseTimePropertyValue(data.created_at),
        terminatedOn: parseTimePropertyValue(data.terminated_at),
        terminatedBy: data.terminated_by,
        updatedOn: parseTimePropertyValue(data.updated_at),
        deletedOn: parseTimePropertyValue(data.deleted_at),
        firstSeenOn: parseTimePropertyValue(data.first_seen),
        lastSeenOn: parseTimePropertyValue(data.last_seen),
        firstScanTimeOn: parseTimePropertyValue(data.first_scan_time),
        lastScanTimeOn: parseTimePropertyValue(data.last_scan_time),
        lastAuthenticatedScanDateOn: parseTimePropertyValue(
          data.last_authenticated_scan_date,
        ),
        lastLicensedScanDateOn: parseTimePropertyValue(
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
        // TODO Add sources, tags, networkInterfaces
        // sources: data.sources,
        // networkInterfaces: data.network_interfaces,
      },
    },
  });
  const perKeyCount = {};
  const parsedTags: {
    key?: string;
    value?: string;
  }[] = [];
  data.tags?.forEach((tag) => {
    if (perKeyCount[tag.key]) {
      parsedTags.push({
        key: `${tag.key}.${perKeyCount[tag.key]}`,
        value: tag.value,
      });
    } else {
      parsedTags.push({
        key: tag.key,
        value: tag.value,
      });
    }
    perKeyCount[tag.key] = perKeyCount[tag.key] ?? 0 + 1;
  });
  assignTags(entity, parsedTags);
  return entity;
}

export function createTargetHostEntity(
  data: AssetExport,
): TargetEntity | undefined {
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
    return undefined;
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

export function getTargetsForAsset(asset: AssetExport): string[] {
  return [asset.fqdns, asset.ipv4s, asset.ipv6s, asset.mac_addresses].reduce(
    (a, e) => [...a, ...e],
  );
}

export function createVulnerabilityEntity(
  vuln: VulnerabilityExport,
  logger: IntegrationLogger,
): Entity {
  const numericPriority = vuln.plugin.vpr && vuln.plugin.vpr.score;
  const priority = numericPriority && getPriority(numericPriority);

  delete vuln.output;

  return createIntegrationEntity({
    entityData: {
      source: vuln,
      assign: {
        _key: generateEntityKey(
          Entities.VULNERABILITY._type,
          `${vuln.scan.uuid}_${vuln.plugin.id}_${vuln.asset.uuid}_${vuln.port.port}_${vuln.port.protocol}`,
        ),
        _type: Entities.VULNERABILITY._type,
        _class: Entities.VULNERABILITY._class,
        // schema
        name: vuln.plugin.name,
        category: vuln.asset.device_type,
        status: vuln.state,
        severity: vuln.severity,
        numericSeverity: vuln.plugin.cvss3_base_score,
        vector: vuln.plugin.cvss3_vector?.raw || undefined,
        cve: vuln.plugin.cve || undefined,
        cpe: vuln.plugin.cpe || undefined,
        description: vuln.plugin.description,
        recommendation: vuln.plugin.solution,
        impact: vuln.plugin.synopsis,
        open: vuln.state === 'OPEN',
        references: vuln.plugin.see_also,

        // Add targets for mapping rules.
        targets: [vuln.asset.ipv4],

        // additional asset properties can be added
        'asset.uuid': vuln.asset.uuid,
        assetHostname: vuln.asset.hostname,
        assetIpv4: vuln.asset.ipv4,
        assetDeviceType: vuln.asset.device_type,
        assetMacAddress: vuln.asset.mac_address,
        agentId: vuln.asset.agent_uuid,
        firstFoundOn: parseTimePropertyValue(vuln.first_found),
        lastFoundOn: parseTimePropertyValue(vuln.last_found),
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
        'scan.startedOn': parseTimePropertyValue(vuln.scan.started_at),
        'scan.completedOn': parseTimePropertyValue(vuln.scan.completed_at),
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
        upsupportedByVendor: vuln.plugin.unsupported_by_vendor,
        exploitedByNessus: vuln.plugin.exploited_by_nessus,
        // data model properties
        numericPriority,
        priority,
        firstSeenOn: parseTimePropertyValue(vuln.first_found),
        lastSeenOn: parseTimePropertyValue(vuln.last_found),
        lastFixedOn: parseTimePropertyValue(vuln.last_fixed),

        // vulnerability prioritization properties
        cvss3BaseScore: vuln.plugin.cvss3_base_score,
        cvss3TemporalScore: vuln.plugin.cvss3_temporal_score,

        cvssBaseScore: vuln.plugin.cvss_base_score,
        cvssTemporalScore: vuln.plugin.cvss_temporal_score,

        cvss3Vector: vuln.plugin.cvss3_vector?.raw,
        cvssVector: vuln.plugin.cvss_vector?.raw,
        hasPatch: vuln.plugin.has_patch,
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
        _class: ['Vulnerability'],
        _type: 'cve',
        _key: cve.toLowerCase(),
        name: cve.toUpperCase(),
        displayName: cve.toUpperCase(),
      },
      targetFilterKeys: [['_type', '_key']],
    };
  });
}
