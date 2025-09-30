# System Runtime Integration - Detailed Gap Analysis

## Overview

This document provides a detailed comparison between our current MSON model implementation and System Runtime's expected bundle format, identifying specific gaps and required transformations.

---

## 1. Data Structure Comparison

### 1.1 Model Definition Approach

**Our Current Approach: Single Unified Structure**

```typescript
interface MsonModel {
  id: string;
  name: string;
  type: 'class' | 'component' | 'deployment' | 'usecase';
  description?: string;
  entities: MsonEntity[];
  relationships: MsonRelationship[];
}

interface MsonEntity {
  id: string;
  name: string;
  type: 'class' | 'interface' | 'enum' | 'component' | 'actor';
  attributes: MsonAttribute[];
  methods: MsonMethod[];
  stereotype?: string;
  namespace?: string;
}
```

**System Runtime Approach: Two-Phase Definition**

```typescript
// Phase 1: Schema (structure definition)
interface SystemRuntimeSchema {
  _name: string;
  _inherit?: string[];
  [propertyName: string]: 'property' | 'link' | 'collection' | 'method' | any;
}

// Phase 2: Model (type override)
interface SystemRuntimeModel {
  _name: string;
  [propertyName: string]: string | string[] | MethodSignature | any;
}
```

**Gap**: We need to split our unified entity structure into separate schema and model definitions.

**Transformation Required**:
1. Extract property names from attributes → schema keys
2. Determine if each attribute is property/link/collection → schema values
3. Extract type information from attributes → model values
4. Handle methods separately in both schema and model

---

### 1.2 Attribute Representation

**Our Current Structure**:

```typescript
interface MsonAttribute {
  name: string;
  type: string;
  visibility: 'public' | 'private' | 'protected';
  isStatic: boolean;
  isReadOnly: boolean;
}

// Example:
{
  name: "firstName",
  type: "string",
  visibility: "public",
  isStatic: false,
  isReadOnly: false
}
```

**System Runtime Structure**:

```typescript
// Schema:
{
  "firstName": "property"
}

// Model:
{
  "firstName": "string"
}
```

**Gap**: System Runtime doesn't track visibility, static, or readonly modifiers.

**Transformation Required**:
1. Extract `name` → schema key
2. Determine kind (property/link/collection) → schema value
3. Extract `type` → model value
4. Store visibility/static/readonly in metadata (optional)

**Information Loss**: Visibility modifiers, static flag, readonly flag

---

### 1.3 Method Representation

**Our Current Structure**:

```typescript
interface MsonMethod {
  name: string;
  parameters: MsonParameter[];
  returnType: string;
  visibility: 'public' | 'private' | 'protected';
  isStatic: boolean;
  isAbstract: boolean;
}

interface MsonParameter {
  name: string;
  type: string;
}

// Example:
{
  name: "calculateAge",
  parameters: [
    { name: "birthDate", type: "Date" }
  ],
  returnType: "number",
  visibility: "public",
  isStatic: false,
  isAbstract: false
}
```

**System Runtime Structure**:

```typescript
// Schema:
{
  "calculateAge": "method"
}

// Model:
{
  "calculateAge": {
    "birthDate": "Date",
    "=>": "number"
  }
}
```

**Gap**: System Runtime uses positional parameters (param1, param2, param3) by default, but can use named parameters.

**Transformation Required**:
1. Extract method name → schema key with "method" value
2. Convert parameters to object with parameter names as keys
3. Add return type with "=>" key
4. Store visibility/static/abstract in metadata (optional)

**Information Loss**: Visibility modifiers, static flag, abstract flag, parameter order (if using named params)

---

### 1.4 Relationship Representation

**Our Current Structure**:

```typescript
interface MsonRelationship {
  id: string;
  from: string;
  to: string;
  type: 'association' | 'inheritance' | 'implementation' | 'dependency' | 'aggregation' | 'composition';
  multiplicity?: {
    from?: string;
    to?: string;
  };
  name?: string;
}

// Example:
{
  id: "rel1",
  from: "Student",
  to: "Course",
  type: "association",
  multiplicity: { from: "1", to: "0..*" },
  name: "enrolls in"
}
```

**System Runtime Structure**:

```typescript
// Embedded in schema:
{
  "_name": "Student",
  "courses": "collection",  // Derived from relationship
  "_inherit": []
}

// Embedded in model:
{
  "_name": "Student",
  "courses": ["Course"]  // Type derived from relationship
}
```

**Gap**: System Runtime embeds relationships in entity schemas, we use separate relationship objects.

**Transformation Required**:
1. Process all relationships to determine which add links/collections to entities
2. For inheritance: Add to `_inherit` array in schema
3. For associations: Determine if link or collection based on multiplicity
4. For aggregation/composition: Treat as collections
5. For dependencies: Document in metadata (no direct System Runtime equivalent)
6. For implementation: Add to `_inherit` array

**Mapping Rules**:
- `inheritance` → `_inherit` array entry
- `association` with multiplicity "1" or "0..1" → `link` in schema, entity name in model
- `association` with multiplicity "*" or "0..*" or "1..*" → `collection` in schema, `[EntityName]` in model
- `aggregation` → `collection` (System Runtime doesn't distinguish from association)
- `composition` → `collection` (System Runtime doesn't distinguish from association)
- `dependency` → No direct mapping (could use metadata or comments)
- `implementation` → `_inherit` array entry (for interfaces)

**Information Loss**: Relationship names, multiplicity details, distinction between aggregation/composition/association

---

## 2. Bundle Structure Comparison

### 2.1 Top-Level Structure

**Our Current Export**:

```json
{
  "version": "1.0",
  "type": "system_designer_model",
  "metadata": {
    "name": "Student System",
    "modelType": "class",
    "description": "...",
    "createdAt": "2025-09-29T...",
    "exportedBy": "system-designer-mcp"
  },
  "model": {
    "id": "...",
    "name": "Student System",
    "type": "class",
    "entities": [...],
    "relationships": [...]
  }
}
```

**System Runtime Bundle**:

```json
{
  "_id": "unique-system-id",
  "name": "Student System",
  "description": "",
  "version": "0.0.1",
  "master": true,
  "schemas": {...},
  "models": {...},
  "types": {...},
  "behaviors": {...},
  "components": {...}
}
```

**Gap**: Completely different top-level structure. Our export is a wrapper, not a System Runtime bundle.

**Transformation Required**:
1. Generate `_id` (unique identifier)
2. Extract `name` from model
3. Extract `description` from model
4. Set `version` (default "0.0.1" or from metadata)
5. Set `master` to true
6. Transform entities → `schemas` and `models` sections
7. Create empty `types` section (or populate if custom types defined)
8. Create empty `behaviors` section (or populate if behaviors provided)
9. Create empty `components` section (or populate if instances provided)

---

### 2.2 Schemas Section

**What We Have**: Entity definitions with attributes and methods

**What System Runtime Needs**:

```json
{
  "schemas": {
    "schema-unique-id": {
      "_id": "schema-unique-id",
      "_name": "Student",
      "_inherit": ["_Component"],
      "firstName": "property",
      "lastName": "property",
      "courses": "collection",
      "enroll": "method"
    }
  }
}
```

**Transformation Required**:
1. For each entity, create a schema object
2. Generate unique `_id` for schema
3. Set `_name` to entity name
4. Set `_inherit` to ["_Component"] by default, add inheritance relationships
5. For each attribute, add key with "property", "link", or "collection" value
6. For each method, add key with "method" value
7. Process relationships to add links/collections

---

### 2.3 Models Section

**What We Have**: Entity type information in attributes

**What System Runtime Needs**:

```json
{
  "models": {
    "model-unique-id": {
      "_id": "model-unique-id",
      "_name": "Student",
      "firstName": "string",
      "lastName": "string",
      "courses": ["Course"],
      "enroll": {
        "course": "Course",
        "=>": "void"
      }
    }
  }
}
```

**Transformation Required**:
1. For each entity, create a model object
2. Generate unique `_id` for model
3. Set `_name` to entity name
4. For each attribute, add key with type value
5. For links, use entity name as type
6. For collections, use `[EntityName]` as type
7. For methods, create object with parameter types and return type

---

### 2.4 Types Section

**What We Have**: Nothing (we don't support custom types yet)

**What System Runtime Needs**:

```json
{
  "types": {
    "type-unique-id": {
      "_id": "type-unique-id",
      "_name": "country",
      "type": ["France", "Belgium", "Luxembourg"]
    }
  }
}
```

**Gap**: We don't support custom type definitions.

**New Capability Needed**: Tool to define custom types (enums, complex types)

---

### 2.5 Behaviors Section

**What We Have**: Nothing (we only define method signatures, not implementations)

**What System Runtime Needs**:

```json
{
  "behaviors": {
    "behavior-unique-id": {
      "_id": "behavior-unique-id",
      "component": "Student",
      "state": "enroll",
      "action": "(course) => { this.courses().push(course); }",
      "useCoreAPI": false,
      "core": false
    }
  }
}
```

**Gap**: We don't support behavior (method implementation) definitions.

**New Capability Needed**: Tool to add behaviors with JavaScript code strings

---

### 2.6 Components Section

**What We Have**: Nothing (we only define structure, not instances)

**What System Runtime Needs**:

```json
{
  "components": {
    "Student": {
      "student-1": {
        "_id": "student-1",
        "firstName": "John",
        "lastName": "Doe",
        "courses": []
      }
    }
  }
}
```

**Gap**: We don't support component instance definitions.

**New Capability Needed**: Tool to create component instances

---

## 3. Feature Comparison Matrix

| Feature | Our Implementation | System Runtime | Status | Priority |
|---------|-------------------|----------------|--------|----------|
| Entity/Schema Definition | ✅ Full support | ✅ Required | ✅ Compatible | High |
| Attribute Types | ✅ Full support | ✅ Required | ⚠️ Needs mapping | High |
| Method Signatures | ✅ Full support | ✅ Required | ⚠️ Needs mapping | High |
| Relationships | ✅ Full support | ⚠️ Embedded | ⚠️ Needs transformation | High |
| Inheritance | ✅ Via relationships | ✅ _inherit array | ⚠️ Needs transformation | High |
| Visibility Modifiers | ✅ Full support | ❌ Not supported | ⚠️ Information loss | Low |
| Static Members | ✅ Full support | ❌ Not supported | ⚠️ Information loss | Low |
| Abstract Members | ✅ Full support | ❌ Not supported | ⚠️ Information loss | Low |
| Custom Types | ❌ Not supported | ✅ Full support | ❌ Missing | Medium |
| Behaviors/Implementations | ❌ Not supported | ✅ Full support | ❌ Missing | High |
| Component Instances | ❌ Not supported | ✅ Full support | ❌ Missing | Medium |
| Bundle Export | ⚠️ Custom format | ✅ Native format | ❌ Incompatible | Critical |
| NoSQL Database | ❌ Not supported | ✅ Full support | ❌ Out of scope | Low |

**Legend**:
- ✅ Fully supported
- ⚠️ Partially supported or needs work
- ❌ Not supported

---

## 4. Transformation Complexity Assessment

### High Complexity (7-10 days each)
1. **Relationship Processing**: Bidirectional, circular, multiple inheritance
2. **Bundle Generation**: Orchestrating all transformations correctly
3. **Behavior Support**: Handling JavaScript code strings, validation

### Medium Complexity (3-5 days each)
4. **Entity to Schema**: Determining property/link/collection kinds
5. **Entity to Model**: Type mapping and method signatures
6. **Component Instances**: Creating and validating instances

### Low Complexity (1-2 days each)
7. **Metadata Generation**: IDs, versions, timestamps
8. **Custom Types**: Simple enum and object type definitions
9. **Validation**: Schema validation with Zod

---

## 5. Information Preservation Strategy

### Information That Can Be Preserved
- Entity names and types
- Attribute names and types
- Method names, parameters, and return types
- Relationship types and targets
- Inheritance hierarchies
- Model descriptions

### Information That Will Be Lost
- Visibility modifiers (public/private/protected)
- Static member flags
- Abstract member flags
- Readonly flags
- Relationship names
- Detailed multiplicity (beyond link vs collection)
- Distinction between aggregation/composition/association

### Mitigation Strategy
1. **Metadata Extension**: Store lost information in custom metadata fields
2. **Documentation**: Clearly document what information is preserved vs. lost
3. **Round-Trip Warning**: Warn users that MSON → System Runtime → MSON is lossy
4. **Validation**: Validate that critical information is preserved

---

## 6. Recommendations

### Immediate Actions (Phase 1)
1. ✅ Fix `export_to_system_designer` to output true System Runtime bundles
2. ✅ Implement core transformation logic (entity → schema/model)
3. ✅ Handle relationship processing correctly

### Short-Term Enhancements (Phase 2-3)
4. ✅ Add behavior support for method implementations
5. ✅ Add component instance creation
6. ✅ Add custom type definitions

### Long-Term Considerations (Future)
7. ⚠️ Consider bidirectional transformation (System Runtime → MSON)
8. ⚠️ Consider runtime API integration (db queries, system management)
9. ⚠️ Consider metadata preservation for round-trip scenarios

---

## 7. Success Metrics

1. **Transformation Accuracy**: 100% of valid MSON models transform to valid System Runtime bundles
2. **Information Preservation**: ≥90% of critical information preserved
3. **Test Coverage**: ≥95% code coverage for transformation logic
4. **Performance**: Transform 100-entity model in <1 second
5. **Validation**: 100% of invalid bundles rejected by validation

---

**Document Version**: 1.0  
**Date**: 2025-09-29  
**Last Updated**: 2025-09-29

