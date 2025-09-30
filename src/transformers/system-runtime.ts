/**
 * System Runtime Transformation Module
 * Transforms MSON models to System Runtime bundle format
 */

import type {
  MsonAttribute,
  MsonEntity,
  MsonModel,
  MsonRelationship,
  SchemaKind,
  SystemRuntimeBundle,
  SystemRuntimeMethodSignature,
  SystemRuntimeModel,
  SystemRuntimeSchema,
} from '../types.js';

/**
 * Generate a unique ID for System Runtime objects
 * @param prefix - Optional prefix for the ID
 * @returns A unique identifier string
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}${timestamp}${random}`;
}

/**
 * Determine if an attribute should be a property, link, or collection
 * @param attribute - The MSON attribute to analyze
 * @param relationships - All relationships in the model
 * @param entityId - The ID of the entity containing this attribute
 * @returns The schema kind (property/link/collection)
 */
export function determineAttributeKind(
  attribute: MsonAttribute,
  relationships: MsonRelationship[],
  entityId: string
): SchemaKind {
  // Check if this attribute is involved in a relationship
  const relatedRelationship = relationships.find(
    (rel) =>
      (rel.from === entityId || rel.to === entityId) &&
      (rel.type === 'association' || rel.type === 'aggregation' || rel.type === 'composition')
  );

  if (!relatedRelationship) {
    // No relationship, check if type looks like an entity reference
    const primitiveTypes = ['string', 'number', 'boolean', 'date', 'any', 'object', 'array'];
    const isPrimitiveType = primitiveTypes.includes(attribute.type.toLowerCase());
    return isPrimitiveType ? 'property' : 'link';
  }

  // Has relationship, check multiplicity
  const multiplicity = relatedRelationship.multiplicity?.to || '1';
  const isCollection = multiplicity.includes('*') || multiplicity.includes('..');

  return isCollection ? 'collection' : 'link';
}

/**
 * Find an entity by ID in the model
 * @param entities - Array of entities to search
 * @param entityId - The ID to find
 * @returns The entity or undefined
 */
function findEntityById(entities: MsonEntity[], entityId: string): MsonEntity | undefined {
  return entities.find((e) => e.id === entityId);
}

/**
 * Convert MSON entity to System Runtime schema
 * Enhanced to handle bidirectional relationships and complex scenarios
 * @param entity - The MSON entity to convert
 * @param relationships - All relationships in the model
 * @param allEntities - All entities in the model (for name lookup)
 * @returns System Runtime schema definition
 */
export function entityToSchema(
  entity: MsonEntity,
  relationships: MsonRelationship[],
  allEntities: MsonEntity[]
): SystemRuntimeSchema {
  const schema: SystemRuntimeSchema = {
    _id: generateId('s'),
    _name: entity.name,
    _inherit: ['_Component'],
  };

  // Add inheritance relationships (multiple inheritance support)
  const inheritanceRels = relationships.filter(
    (rel) => rel.from === entity.id && (rel.type === 'inheritance' || rel.type === 'implementation')
  );
  if (inheritanceRels.length > 0) {
    const inheritedNames = inheritanceRels
      .map((rel) => {
        const targetEntity = findEntityById(allEntities, rel.to);
        return targetEntity?.name || rel.to;
      })
      .filter((name) => name !== '_Component');

    // Remove duplicates and ensure _Component is first
    const uniqueInherited = Array.from(new Set(inheritedNames));
    schema._inherit = ['_Component', ...uniqueInherited];
  }

  // Add attributes
  for (const attr of entity.attributes) {
    const kind = determineAttributeKind(attr, relationships, entity.id);
    schema[attr.name] = kind;
  }

  // Add methods
  for (const method of entity.methods) {
    schema[method.name] = 'method';
  }

  // Add relationships as links/collections (handles bidirectional)
  const processedRelationships = new Set<string>();

  for (const rel of relationships) {
    // Skip if already processed (avoid duplicates in bidirectional relationships)
    if (processedRelationships.has(rel.id)) {
      continue;
    }

    // Process relationships where this entity is the source
    if (
      rel.from === entity.id &&
      (rel.type === 'association' || rel.type === 'aggregation' || rel.type === 'composition')
    ) {
      const multiplicity = rel.multiplicity?.to || '1';
      const isCollection = multiplicity.includes('*') || multiplicity.includes('..');
      const targetEntity = findEntityById(allEntities, rel.to);

      // Use relationship name if provided, otherwise generate from target entity
      const relationshipName =
        rel.name ||
        (isCollection
          ? `${targetEntity?.name.toLowerCase() || rel.to}s`
          : targetEntity?.name.toLowerCase() || rel.to);

      schema[relationshipName] = isCollection ? 'collection' : 'link';
      processedRelationships.add(rel.id);
    }

    // Process relationships where this entity is the target (bidirectional)
    if (
      rel.to === entity.id &&
      (rel.type === 'association' || rel.type === 'aggregation' || rel.type === 'composition')
    ) {
      const multiplicity = rel.multiplicity?.from || '1';
      const isCollection = multiplicity.includes('*') || multiplicity.includes('..');
      const sourceEntity = findEntityById(allEntities, rel.from);

      // For reverse relationships, use a different naming convention
      const relationshipName = isCollection
        ? `${sourceEntity?.name.toLowerCase() || rel.from}s`
        : sourceEntity?.name.toLowerCase() || rel.from;

      // Only add if not already defined (avoid conflicts with explicit attributes)
      if (!(relationshipName in schema)) {
        schema[relationshipName] = isCollection ? 'collection' : 'link';
      }
      processedRelationships.add(rel.id);
    }
  }

  return schema;
}

/**
 * Convert MSON entity to System Runtime model override
 * Enhanced to handle bidirectional relationships and complex scenarios
 * @param entity - The MSON entity to convert
 * @param relationships - All relationships in the model
 * @param allEntities - All entities in the model (for name lookup)
 * @returns System Runtime model definition
 */
export function entityToModel(
  entity: MsonEntity,
  relationships: MsonRelationship[],
  allEntities: MsonEntity[]
): SystemRuntimeModel {
  const model: SystemRuntimeModel = {
    _id: generateId('m'),
    _name: entity.name,
  };

  // Add attribute types
  for (const attr of entity.attributes) {
    const kind = determineAttributeKind(attr, relationships, entity.id);
    if (kind === 'property') {
      model[attr.name] = attr.type;
    } else if (kind === 'link') {
      model[attr.name] = attr.type; // Entity name
    } else if (kind === 'collection') {
      model[attr.name] = [attr.type]; // Array of entity name
    }
  }

  // Add method signatures
  for (const method of entity.methods) {
    const signature: SystemRuntimeMethodSignature = {
      '=>': method.returnType,
    };
    for (const param of method.parameters) {
      signature[param.name] = param.type;
    }
    model[method.name] = signature;
  }

  // Add relationship types (handles bidirectional)
  const processedRelationships = new Set<string>();

  for (const rel of relationships) {
    // Skip if already processed (avoid duplicates in bidirectional relationships)
    if (processedRelationships.has(rel.id)) {
      continue;
    }

    // Process relationships where this entity is the source
    if (
      rel.from === entity.id &&
      (rel.type === 'association' || rel.type === 'aggregation' || rel.type === 'composition')
    ) {
      const multiplicity = rel.multiplicity?.to || '1';
      const isCollection = multiplicity.includes('*') || multiplicity.includes('..');
      const targetEntity = findEntityById(allEntities, rel.to);
      const targetName = targetEntity?.name || rel.to;

      // Use relationship name if provided, otherwise generate from target entity
      const relationshipName =
        rel.name || (isCollection ? `${targetName.toLowerCase()}s` : targetName.toLowerCase());

      model[relationshipName] = isCollection ? [targetName] : targetName;
      processedRelationships.add(rel.id);
    }

    // Process relationships where this entity is the target (bidirectional)
    if (
      rel.to === entity.id &&
      (rel.type === 'association' || rel.type === 'aggregation' || rel.type === 'composition')
    ) {
      const multiplicity = rel.multiplicity?.from || '1';
      const isCollection = multiplicity.includes('*') || multiplicity.includes('..');
      const sourceEntity = findEntityById(allEntities, rel.from);
      const sourceName = sourceEntity?.name || rel.from;

      // For reverse relationships, use a different naming convention
      const relationshipName = isCollection
        ? `${sourceName.toLowerCase()}s`
        : sourceName.toLowerCase();

      // Only add if not already defined (avoid conflicts with explicit attributes)
      if (!(relationshipName in model)) {
        model[relationshipName] = isCollection ? [sourceName] : sourceName;
      }
      processedRelationships.add(rel.id);
    }
  }

  return model;
}

/**
 * Generate bundle metadata from MSON model
 * @param model - The MSON model
 * @param version - Optional version string (defaults to 0.0.1)
 * @returns Bundle metadata object
 */
export function generateBundleMetadata(
  model: MsonModel,
  version: string = '0.0.1'
): Pick<SystemRuntimeBundle, '_id' | 'name' | 'description' | 'version' | 'master'> {
  return {
    _id: generateId('sys'),
    name: model.name,
    description: model.description || `System Runtime bundle for ${model.name}`,
    version,
    master: true,
  };
}

/**
 * Main transformation function: Convert MSON model to System Runtime bundle
 * @param model - The MSON model to convert
 * @param version - Optional version string (defaults to 0.0.1)
 * @returns Complete System Runtime bundle
 */
export function msonToSystemRuntimeBundle(model: MsonModel, version?: string): SystemRuntimeBundle {
  const metadata = generateBundleMetadata(model, version);

  const bundle: SystemRuntimeBundle = {
    ...metadata,
    schemas: {},
    models: {},
    types: {},
    behaviors: {},
    components: {},
  };

  // Transform each entity
  for (const entity of model.entities) {
    const schema = entityToSchema(entity, model.relationships, model.entities);
    const modelDef = entityToModel(entity, model.relationships, model.entities);

    bundle.schemas[schema._id] = schema;
    bundle.models[modelDef._id] = modelDef;

    // Initialize empty components section for this entity
    bundle.components[entity.name] = {};
  }

  return bundle;
}
