import { Agent } from '../../tenable/client';
import { Entities } from '../constants';
import {
  createIntegrationEntity,
  Entity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { generateEntityKey } from '../../utils/generateKey';

export function createAgentEntity(agent: Agent): Entity {
  return createIntegrationEntity({
    entityData: {
      source: agent,
      assign: {
        _class: Entities.AGENT._class,
        _type: Entities.AGENT._type,
        _key: generateEntityKey(Entities.AGENT._type, agent.id),

        // Schema required fields.
        id: String(agent.id),
        agentId: agent.id,
        displayName: agent.name,
        function: ['vulnerability-detection'],

        // Entity additional data.
        name: agent.name,
        status: agent.status,
        platform: agent.platform,
        ipAddress: agent.ip,
        linkedOn: agent.linked_on,
        lastConnectedOn: parseTimePropertyValue(agent.last_connect, 'sec'),
        lastScannedOn: parseTimePropertyValue(agent.last_scanned, 'sec'),
      },
    },
  });
}
