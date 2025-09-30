# System Runtime Integration - Implementation Handoff Guide

## Purpose

This document provides detailed implementation guidance for developers who will implement the System Runtime integration. It includes code examples, architectural decisions, and step-by-step instructions.

---

## 1. Quick Start

### Prerequisites
- Familiarity with the existing codebase structure
- Understanding of System Runtime concepts (read SYSTEM-RUNTIME-INTEGRATION-ANALYSIS.md)
- Review of gap analysis (read SYSTEM-RUNTIME-GAP-ANALYSIS.md)

### Development Environment Setup

```bash
# Ensure you have the latest dependencies
bun install

# Run existing tests to ensure baseline
bun test

# Start development server
bun run dev
```

### Recommended Reading Order
1. `SYSTEM-RUNTIME-INTEGRATION-ANALYSIS.md` - Overall strategy
2. `SYSTEM-RUNTIME-GAP-ANALYSIS.md` - Detailed gaps
3. This document - Implementation guidance
4. System Runtime documentation - https://designfirst.io/systemruntime/documentation/

---

## 2. Phase 1: Foundation & Type System

### Step 1.1: Add System Runtime Type Definitions

**File**: `src/types.ts`

Add these interfaces at the end of the file:

```typescript
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
 * System Runtime Method Signature
 * Defines method parameters and return type
 */
export interface SystemRuntimeMethodSignature {
  [paramName: string]: string; // parameter name -> type
  '=>': string; // return type
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
 */
export interface SystemRuntimeComponent {
  _id: string;
  [key: string]: any; // component properties
}

/**
 * Schema kind for determining property type
 */
export type SchemaKind = 'property' | 'link' | 'collection' | 'method';
```

### Step 1.2: Add System Runtime Zod Schemas

**File**: `src/schemas.ts`

Add these schemas after the existing MSON schemas:

```typescript
/**
 * Schema for System Runtime method signatures
 */
export const SystemRuntimeMethodSignatureSchema = z.record(z.string()).refine(
  (obj) => '=>' in obj,
  { message: 'Method signature must include "=>" for return type' }
);

/**
 * Schema for System Runtime schema definitions
 */
export const SystemRuntimeSchemaSchema = z.object({
  _id: z.string(),
  _name: z.string(),
  _inherit: z.array(z.string()).optional(),
}).passthrough(); // Allow additional properties

/**
 * Schema for System Runtime model overrides
 */
export const SystemRuntimeModelSchema = z.object({
  _id: z.string(),
  _name: z.string(),
}).passthrough(); // Allow additional properties

/**
 * Schema for System Runtime custom types
 */
export const SystemRuntimeTypeSchema = z.object({
  _id: z.string(),
  _name: z.string(),
  type: z.union([z.array(z.string()), z.record(z.string())]),
});

/**
 * Schema for System Runtime behaviors
 */
export const SystemRuntimeBehaviorSchema = z.object({
  _id: z.string(),
  component: z.string(),
  state: z.string(),
  action: z.string(),
  useCoreAPI: z.boolean(),
  core: z.boolean(),
});

/**
 * Schema for System Runtime component instances
 */
export const SystemRuntimeComponentSchema = z.object({
  _id: z.string(),
}).passthrough(); // Allow additional properties

/**
 * Schema for complete System Runtime bundles
 */
export const SystemRuntimeBundleSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  master: z.boolean().optional(),
  schemas: z.record(SystemRuntimeSchemaSchema),
  models: z.record(SystemRuntimeModelSchema),
  types: z.record(SystemRuntimeTypeSchema),
  behaviors: z.record(SystemRuntimeBehaviorSchema),
  components: z.record(z.record(SystemRuntimeComponentSchema)),
});
```

### Step 1.3: Create Transformers Module

**File**: `src/transformers/system-runtime.ts`

```typescript
import type {
  MsonModel,
  MsonEntity,
  MsonAttribute,
  MsonMethod,
  MsonRelationship,
  SystemRuntimeBundle,
  SystemRuntimeSchema,
  SystemRuntimeModel,
  SchemaKind,
} from '../types.js';

/**
 * Generate a unique ID for System Runtime objects
 */
function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}${timestamp}${random}`;
}

/**
 * Determine if an attribute should be a property, link, or collection
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
    const isPrimitiveType = ['string', 'number', 'boolean', 'date', 'any', 'object', 'array'].includes(
      attribute.type.toLowerCase()
    );
    return isPrimitiveType ? 'property' : 'link';
  }

  // Has relationship, check multiplicity
  const multiplicity = relatedRelationship.multiplicity?.to || '1';
  const isCollection = multiplicity.includes('*') || multiplicity.includes('..');

  return isCollection ? 'collection' : 'link';
}

/**
 * Convert MSON entity to System Runtime schema
 */
export function entityToSchema(
  entity: MsonEntity,
  relationships: MsonRelationship[]
): SystemRuntimeSchema {
  const schema: SystemRuntimeSchema = {
    _id: generateId('s'),
    _name: entity.name,
    _inherit: ['_Component'],
  };

  // Add inheritance relationships
  const inheritanceRels = relationships.filter(
    (rel) => rel.from === entity.id && (rel.type === 'inheritance' || rel.type === 'implementation')
  );
  if (inheritanceRels.length > 0) {
    schema._inherit = [
      '_Component',
      ...inheritanceRels.map((rel) => {
        // Find the target entity name
        return rel.to; // This should be the entity name, not ID
      }),
    ];
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

  // Add relationships as links/collections
  for (const rel of relationships) {
    if (rel.from === entity.id && rel.type === 'association') {
      const multiplicity = rel.multiplicity?.to || '1';
      const isCollection = multiplicity.includes('*') || multiplicity.includes('..');
      const relationshipName = rel.name || `${rel.to.toLowerCase()}s`;
      schema[relationshipName] = isCollection ? 'collection' : 'link';
    }
  }

  return schema;
}

/**
 * Convert MSON entity to System Runtime model override
 */
export function entityToModel(
  entity: MsonEntity,
  relationships: MsonRelationship[]
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
    const signature: Record<string, string> = {};
    for (const param of method.parameters) {
      signature[param.name] = param.type;
    }
    signature['=>'] = method.returnType;
    model[method.name] = signature;
  }

  // Add relationship types
  for (const rel of relationships) {
    if (rel.from === entity.id && rel.type === 'association') {
      const multiplicity = rel.multiplicity?.to || '1';
      const isCollection = multiplicity.includes('*') || multiplicity.includes('..');
      const relationshipName = rel.name || `${rel.to.toLowerCase()}s`;
      model[relationshipName] = isCollection ? [rel.to] : rel.to;
    }
  }

  return model;
}

/**
 * Main transformation function: Convert MSON model to System Runtime bundle
 */
export function msonToSystemRuntimeBundle(model: MsonModel): SystemRuntimeBundle {
  const bundle: SystemRuntimeBundle = {
    _id: generateId('sys'),
    name: model.name,
    description: model.description || '',
    version: '0.0.1',
    master: true,
    schemas: {},
    models: {},
    types: {},
    behaviors: {},
    components: {},
  };

  // Transform each entity
  for (const entity of model.entities) {
    const schema = entityToSchema(entity, model.relationships);
    const modelDef = entityToModel(entity, model.relationships);

    bundle.schemas[schema._id] = schema;
    bundle.models[modelDef._id] = modelDef;

    // Initialize empty components section for this entity
    bundle.components[entity.name] = {};
  }

  return bundle;
}
```

### Step 1.4: Create Validators Module

**File**: `src/validators/system-runtime.ts`

```typescript
import { SystemRuntimeBundleSchema } from '../schemas.js';
import type { SystemRuntimeBundle, ValidationWarning } from '../types.js';

/**
 * Validate a System Runtime bundle
 */
export function validateSystemRuntimeBundle(bundle: unknown): {
  isValid: boolean;
  warnings: ValidationWarning[];
  bundle?: SystemRuntimeBundle;
} {
  const warnings: ValidationWarning[] = [];

  // Schema validation
  const result = SystemRuntimeBundleSchema.safeParse(bundle);
  if (!result.success) {
    return {
      isValid: false,
      warnings: [
        {
          message: `Bundle schema validation failed: ${result.error.message}`,
          severity: 'error',
        },
      ],
    };
  }

  const validatedBundle = result.data;

  // Semantic validation
  // TODO: Add semantic validation (schema refs, component types, etc.)

  return {
    isValid: warnings.filter((w) => w.severity === 'error').length === 0,
    warnings,
    bundle: validatedBundle,
  };
}
```

### Step 1.5: Write Unit Tests

**File**: `test/transformers/system-runtime.test.ts`

```typescript
import { describe, expect, test } from 'bun:test';
import {
  determineAttributeKind,
  entityToSchema,
  entityToModel,
  msonToSystemRuntimeBundle,
} from '../src/transformers/system-runtime';
import type { MsonEntity, MsonAttribute, MsonRelationship } from '../src/types';

describe('System Runtime Transformers', () => {
  describe('determineAttributeKind', () => {
    test('should identify primitive types as properties', () => {
      const attr: MsonAttribute = {
        name: 'firstName',
        type: 'string',
        visibility: 'public',
        isStatic: false,
        isReadOnly: false,
      };
      const kind = determineAttributeKind(attr, [], 'entity1');
      expect(kind).toBe('property');
    });

    // Add more tests...
  });

  // Add more test suites...
});
```

---

## 3. Implementation Tips

### Working with SDK Type Constraints

When registering new tools, you'll encounter SDK type constraints. Use this pattern:

```typescript
// In tools.ts
server.registerTool(
  'create_system_runtime_bundle',
  {
    title: 'Create System Runtime Bundle',
    description: 'Convert MSON model to System Runtime bundle format',
    // @ts-expect-error - SDK type constraints are too strict for complex nested schemas
    inputSchema: {
      model: z.unknown().describe('The MSON model to convert'),
    },
  },
  // @ts-expect-error - Type inference from Zod schema
  async (params) => handlers.handleCreateSystemRuntimeBundle(params)
);
```

### Handling Circular References

System Runtime handles circular references naturally through IDs. Example:

```typescript
// Person references Person (father/mother)
const schema = {
  _name: 'Person',
  father: 'link',
  mother: 'link',
};

const model = {
  _name: 'Person',
  father: 'Person', // References same type
  mother: 'Person',
};
```

### Testing Strategy

1. **Unit tests**: Test each transformer function independently
2. **Integration tests**: Test complete MSON → bundle transformation
3. **Validation tests**: Test bundle validation logic
4. **Example tests**: Use banking system example to verify real-world scenarios

---

## 4. Common Pitfalls

### Pitfall 1: Forgetting to Handle Bidirectional Relationships

```typescript
// WRONG: Only adding relationship to one entity
if (rel.from === entity.id) {
  schema[rel.name] = 'link';
}

// RIGHT: Consider both directions
if (rel.from === entity.id || rel.to === entity.id) {
  const isFrom = rel.from === entity.id;
  const targetEntity = isFrom ? rel.to : rel.from;
  schema[rel.name || targetEntity.toLowerCase()] = 'link';
}
```

### Pitfall 2: Not Generating Unique IDs

```typescript
// WRONG: Using predictable IDs
const schema = { _id: entity.name, ... };

// RIGHT: Generate unique IDs
const schema = { _id: generateId('s'), ... };
```

### Pitfall 3: Forgetting Default _inherit

```typescript
// WRONG: No default inheritance
const schema = { _name: entity.name };

// RIGHT: Always inherit from _Component
const schema = { _name: entity.name, _inherit: ['_Component'] };
```

---

## 5. Next Steps After Phase 1

Once Phase 1 is complete:

1. Run all tests: `bun test`
2. Verify type definitions compile: `bun run build`
3. Review code with team
4. Proceed to Phase 2: Core Transformation Logic

---

## 6. Resources

- System Runtime Docs: https://designfirst.io/systemruntime/documentation/
- MCP SDK Docs: https://modelcontextprotocol.io/
- Zod Docs: https://zod.dev/
- Project README: `README.md`
- Architecture Guide: `.augment/rules/ARCHITECTURE.md`

---

## 7. Questions & Support

For questions during implementation:

1. Review the analysis documents first
2. Check System Runtime documentation
3. Look at existing code patterns in the codebase
4. Consult with team lead

---

**Document Version**: 1.0  
**Date**: 2025-09-29  
**For**: Phase 1 Implementation

