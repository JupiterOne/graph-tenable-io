import { entities, relationships } from '../../constants';
import { Container } from '../../tenable/types';
import { Account } from '../../types';
import {
  generateEntityKey,
  generateRelationshipKey,
} from '../../utils/generateKey';
import getTime from '../../utils/getTime';

export function createAccountContainerRelationship(
  account: Account,
  container: Container,
) {
  const parentKey = generateEntityKey(entities.ACCOUNT._type, account.id);
  const childKey = generateEntityKey(entities.CONTAINER._type, container.id);
  const relationKey = generateRelationshipKey(
    parentKey,
    relationships.ACCOUNT_HAS_CONTAINER._class,
    childKey,
  );
  const relationship = {
    _class: relationships.ACCOUNT_HAS_CONTAINER._class,
    _type: relationships.ACCOUNT_HAS_CONTAINER._type,
    _fromEntityKey: parentKey,
    _key: relationKey,
    _toEntityKey: childKey,
  };
  return relationship;
}

export function createAccountContainerRelationships(
  account: Account,
  containers: Container[],
) {
  const accountContainerRelationships = containers.map((container) => {
    return createAccountContainerRelationship(account, container);
  });
  return accountContainerRelationships;
}

export function createContainerEntities(data: Container[]) {
  return data.map((container) => {
    return createContainerEntity(container);
  });
}

export function createContainerEntity(container: Container) {
  return {
    _key: generateEntityKey(entities.CONTAINER._type, container.id),
    _type: entities.CONTAINER._type,
    _class: entities.CONTAINER._class,
    _rawData: [{ name: 'default', rawData: container }],
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
}
