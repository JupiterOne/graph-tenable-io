import { Agent } from '../../tenable/client';
import { Entities } from '../constants';
import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';

export function createAgentEntity(agent: Agent): Entity {
  return createIntegrationEntity({
    entityData: {
      source: agent,
      assign: {
        _class: Entities.AGENT._class,
        _type: Entities.AGENT._type,
        _key: String(agent.id),

        // Schema required fields.
        displayName: agent.name,
        function: ['vulnerability-detection'],

        // Entity additional data.
        status: agent.status,
        platform: agent.platform,
        ipAddress: agent.ip,
        linkedOn: agent.linked_on,
        lastConnect: agent.last_connect,
        lastScanned: agent.last_scanned,
      },
    },
  });
}
