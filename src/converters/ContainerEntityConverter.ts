import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";
import { entities } from "../constants";
import { Container } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";
import getTime from "../utils/getTime";

export interface ContainerEntity extends EntityFromIntegration {
  id: string;
  repoId: string;
  platform: string;
  name: string;
  size: string;
  digest: string;
  repoName: string;
  score: string;
  status: string;
  createdAt: number;
  updatedAt: number;
  numberOfVulnerabilities: string;
}

export function createContainerEntities(data: Container[]): ContainerEntity[] {
  return data.map(container => {
    const containerEntity: ContainerEntity = {
      _key: generateEntityKey(entities.CONTAINER._type, container.id),
      _type: entities.CONTAINER._type,
      _class: entities.CONTAINER._class,
      _rawData: [{ name: "default", rawData: container }],
      id: container.id,
      repoId: container.repo_id,
      platform: container.platform,
      name: container.name,
      size: container.size,
      digest: container.digest,
      repoName: container.repo_name,
      score: container.score,
      status: container.status,
      createdAt: getTime(container.created_at)!,
      updatedAt: getTime(container.updated_at)!,
      numberOfVulnerabilities: container.number_of_vulnerabilities,
    };
    return containerEntity;
  });
}
