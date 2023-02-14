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
  const { from, _class, to } = options;
  return createMappedRelationship({
    source: from,
    _class: _class,
    _type: `${from._type}_${_class.toLowerCase()}_${to.targetEntity._type}`,
    target: to.targetEntity,
    targetFilterKeys: to.targetFilterKeys,
    skipTargetCreation: to.skipTargetCreation,
  });
}

export function createRelationshipFromTargetEntity(options: {
  from: TargetEntity;
  _class: RelationshipClass;
  to: Entity;
}): MappedRelationship {
  const { from, _class, to } = options;
  return createMappedRelationship({
    source: to,
    _class: _class,
    _type: `${to._type}_${_class.toLowerCase()}_${from.targetEntity._type}`,
    target: from.targetEntity,
    targetFilterKeys: from.targetFilterKeys,
    skipTargetCreation: from.skipTargetCreation,
    relationshipDirection: RelationshipDirection.REVERSE,
  });
}
