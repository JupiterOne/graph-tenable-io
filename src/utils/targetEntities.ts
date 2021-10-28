import {
  createMappedRelationship,
  Entity,
  MappedRelationship,
  RelationshipClass,
  RelationshipDirection,
  TargetEntityProperties,
  TargetFilterKey,
} from '@jupiterone/integration-sdk-core';

export type TargetEntity = {
  targetEntity: TargetEntityProperties & { _key: string; _type: string };
  targetFilterKeys: TargetFilterKey[];
  skipTargetCreation?: boolean;
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
    skipTargetCreation: options.to.skipTargetCreation,
  });
}

export function createRelationshipFromTargetEntity(options: {
  from: TargetEntity;
  _class: RelationshipClass;
  to: Entity;
}): MappedRelationship {
  return createMappedRelationship({
    source: options.to,
    _class: options._class,
    target: options.from.targetEntity,
    targetFilterKeys: options.from.targetFilterKeys,
    skipTargetCreation: options.from.skipTargetCreation,
    relationshipDirection: RelationshipDirection.REVERSE,
  });
}
