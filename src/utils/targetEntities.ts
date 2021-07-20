import {
  createMappedRelationship,
  Entity,
  MappedRelationship,
  RelationshipClass,
  TargetEntityProperties,
  TargetFilterKey,
} from '@jupiterone/integration-sdk-core';

export type TargetEntity = {
  targetEntity: TargetEntityProperties & { _key: string; _type: string };
  targetFilterKeys: TargetFilterKey[];
};

export function createRelationshipToTargetEntity(options: {
  from: Entity;
  _class: RelationshipClass;
  to: TargetEntity;
}): MappedRelationship {
  return createMappedRelationship({
    source: options.from,
    _class: options._class,
    target: options.to.targetEntity,
    targetFilterKeys: options.to.targetFilterKeys,
  });
}
