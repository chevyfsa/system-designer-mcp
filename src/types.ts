/**
 * Type definitions for MSON (Model Specification Object Notation) models
 * These types represent the structure of UML models that can be created,
 * validated, and exported by the System Designer MCP Server.
 */

/**
 * Visibility levels for class members (attributes and methods)
 */
export type Visibility = 'public' | 'private' | 'protected';

/**
 * Types of entities that can be modeled
 */
export type EntityType = 'class' | 'interface' | 'enum' | 'component' | 'actor';

/**
 * Types of models that can be created
 */
export type ModelType = 'class' | 'component' | 'deployment' | 'usecase';

/**
 * Types of relationships between entities
 */
export type RelationshipType =
  | 'association'
  | 'inheritance'
  | 'implementation'
  | 'dependency'
  | 'aggregation'
  | 'composition';

/**
 * Represents an attribute (field/property) of an entity
 */
export interface MsonAttribute {
  name: string;
  type: string;
  visibility: Visibility;
  isStatic: boolean;
  isReadOnly: boolean;
}

/**
 * Represents a parameter of a method
 */
export interface MsonParameter {
  name: string;
  type: string;
}

/**
 * Represents a method (function) of an entity
 */
export interface MsonMethod {
  name: string;
  parameters: MsonParameter[];
  returnType: string;
  visibility: Visibility;
  isStatic: boolean;
  isAbstract: boolean;
}

/**
 * Represents an entity (class, interface, enum, etc.) in the model
 */
export interface MsonEntity {
  id: string;
  name: string;
  type: EntityType;
  attributes: MsonAttribute[];
  methods: MsonMethod[];
  stereotype?: string;
  namespace?: string;
  // For enum entities
  values?: string[];
}

/**
 * Represents the multiplicity of a relationship (e.g., "1", "0..*", "1..*")
 */
export interface MsonMultiplicity {
  from?: string;
  to?: string;
}

/**
 * Represents a relationship between two entities
 */
export interface MsonRelationship {
  id: string;
  from: string;
  to: string;
  type: RelationshipType;
  multiplicity?: MsonMultiplicity;
  name?: string;
}

/**
 * Represents a complete MSON model
 */
export interface MsonModel {
  id: string;
  name: string;
  type: ModelType;
  description?: string;
  entities: MsonEntity[];
  relationships: MsonRelationship[];
}

/**
 * Represents a validation warning or error
 */
export interface ValidationWarning {
  message: string;
  severity: 'warning' | 'error';
  // Optional metadata used in validations
  type?: string;
  entityId?: string;
}

// ============================================================================
// SYSTEM RUNTIME TYPES
// ============================================================================

/**
 * Schema kind for determining property type in System Runtime
 */
export type SchemaKind = 'property' | 'link' | 'collection' | 'method';

/**
 * System Runtime Method Signature
 * Defines method parameters and return type
 */
export interface SystemRuntimeMethodSignature {
  [paramName: string]: string; // parameter name -> type
  '=>': string; // return type (special key)
}

/**
 * System Runtime Schema Definition
 * Defines the structure of a component (property/link/collection/method)
 */
export interface SystemRuntimeSchema {
  _id: string;
  _name: string;
  _inherit?: string[];
  [key: string]: string | string[] | any; // property/link/collection/method or other values
}

/**
 * System Runtime Model Override
 * Defines the types for schema properties
 */
export interface SystemRuntimeModel {
  _id: string;
  _name: string;
  [key: string]: string | string[] | SystemRuntimeMethodSignature | any;
}

/**
 * System Runtime Custom Type Definition
 */
export interface SystemRuntimeType {
  _id: string;
  _name: string;
  type: string[] | Record<string, string>; // enum array or object definition
}

/**
 * System Runtime Behavior (Event Handler)
 * Represents a behavior that responds to component state changes
 */
export interface SystemRuntimeBehavior {
  _id: string;
  component: string; // component name or system id
  state: string; // method/event name
  action: string; // JavaScript code as string
  useCoreAPI: boolean;
  core: boolean;
}

/**
 * System Runtime Component Instance
 * Represents a runtime instance of a component
 */
export interface SystemRuntimeComponent {
  _id: string;
  [key: string]: any; // component properties
}

/**
 * System Runtime Bundle Structure
 * Represents a complete System Runtime system bundle
 */
export interface SystemRuntimeBundle {
  _id: string;
  name: string;
  description: string;
  version: string;
  master?: boolean;
  schemas: Record<string, SystemRuntimeSchema>;
  models: Record<string, SystemRuntimeModel>;
  types: Record<string, SystemRuntimeType>;
  behaviors: Record<string, SystemRuntimeBehavior>;
  components: Record<string, Record<string, SystemRuntimeComponent>>;
}
