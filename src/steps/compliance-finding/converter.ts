import { Entities } from '../constants';
import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { generateEntityKey } from '../../utils/generateKey';

export function createComplianceFindingEntity(complianceChunk): Entity {
  return createIntegrationEntity({
    entityData: {
      source: complianceChunk,
      assign: {
        _class: Entities.COMPLIANCE_FINDINGS._class,
        _type: Entities.COMPLIANCE_FINDINGS._type,
        _key: generateEntityKey(
          Entities.COMPLIANCE_FINDINGS._type,
          complianceChunk.uuid,
        ),

        // Schema required fields.
        category: ['network', 'host'],
        severity: ['low', 'medium'],
        numericSeverity: [1, 2],
        id: String(complianceChunk.id),
        agentId: complianceChunk.id,
        displayName: complianceChunk.name,
        open: complianceChunk.state === 'OPEN',

        // Entity additional data.
        name: complianceChunk.name,
        status: complianceChunk.status,
        firstSeen: complianceChunk.first_seen,
        lastSeen: complianceChunk.last_seen,
        agentName: complianceChunk.agent_name,
      },
    },
  });
}
