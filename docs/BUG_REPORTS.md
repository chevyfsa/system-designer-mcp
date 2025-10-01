# System Designer MCP Tool - Bug Report & Recommendations

**Report Date:** 2025-01-30
**Reporter:** AI Assistant (Augment Agent)
**Tool Version:** System Designer MCP (Updated version as of 2025-01-30)
**Severity:** Medium to High
**Status:** Open

---

## Executive Summary

The System Designer MCP tool successfully creates MSON models after recent updates, but has several critical issues related to data preservation, ID management, validation consistency, and MSON specification compliance. While the tool can generate UML diagrams and System Runtime bundles, it loses important property metadata and has inconsistent behavior across its functions.

---

## Environment

- **Tool:** System Designer MCP
- **Functions Tested:**
  - `create_mson_model`
  - `validate_mson_model`
  - `generate_uml_diagram` (PlantUML and Mermaid)
  - `create_system_runtime_bundle`
  - `validate_system_runtime_bundle`
- **Use Case:** Creating NFL Team domain model with 4 entities and 3 relationships

---

## Issues Identified

### 🔴 CRITICAL: Property Data Loss

**Issue ID:** SDMCP-001
**Severity:** High
**Status:** Confirmed

#### Description

When creating a model with detailed property definitions in the `entities` array, all property metadata is lost in the output. The tool returns entities with empty `attributes` and `methods` arrays, completely ignoring the input properties.

#### Steps to Reproduce

```javascript
// Input
{
  "entities": [{
    "id": "team-entity",
    "name": "Team",
    "type": "class",
    "properties": [
      {
        "name": "teamID",
        "type": "string",
        "required": true,
        "description": "Unique identifier"
      }
    ]
  }]
}

// Output
{
  "entities": [{
    "id": "entity_0bf0024b-8c0a-44f4-b21a-12e6fa5cf0cb",
    "name": "Team",
    "type": "class",
    "attributes": [],  // ❌ Empty - properties lost
    "methods": []
  }]
}
```

#### Expected Behavior

Properties should be preserved and converted to `attributes` in the output format.

#### Actual Behavior

All property definitions are silently discarded.

#### Impact

- Users cannot define entity properties through the API
- Generated UML diagrams show empty classes
- System Runtime bundles lack property definitions
- Requires manual post-processing to add properties

---

### 🟡 MAJOR: Entity ID Regeneration & Reference Mismatch

**Issue ID:** SDMCP-002
**Severity:** High
**Status:** Confirmed

#### Description

The tool ignores user-provided entity IDs and generates new UUIDs, but relationship definitions still reference the original IDs, creating broken references.

#### Steps to Reproduce

```javascript
// Input
{
  "entities": [
    { "id": "team-entity", "name": "Team" },
    { "id": "names-entity", "name": "Names" }
  ],
  "relationships": [
    {
      "id": "team-names-rel",
      "from": "team-entity",  // References user-provided ID
      "to": "names-entity"
    }
  ]
}

// Output
{
  "entities": [
    { "id": "entity_0bf0024b-...", "name": "Team" },  // New UUID
    { "id": "entity_b971395f-...", "name": "Names" }
  ],
  "relationships": [
    {
      "from": "team-entity",  // ❌ Still references old ID
      "to": "names-entity"
    }
  ]
}
```

#### Expected Behavior

Either:

1. Use the user-provided IDs as-is, OR
2. Auto-generate IDs but update all references in relationships

#### Actual Behavior

IDs are regenerated but references aren't updated, creating orphaned relationships.

#### Impact

- Relationships cannot be properly validated
- UML diagrams may not show connections correctly
- Potential runtime errors when using the model

---

### 🟡 MAJOR: Validation Tool Incompatibility

**Issue ID:** SDMCP-003
**Severity:** Medium
**Status:** Confirmed

#### Description

The `validate_mson_model` function expects a different input format than what `create_mson_model` returns, making the tools incompatible.

#### Steps to Reproduce

```javascript
// Create model
const model = create_mson_model({ name: "Test", type: "class", ... });

// Try to validate the output
validate_mson_model({ model: model });

// Error: Expected fields not found
```

#### Error Output

```
❌ Validation failed:
- Invalid input: expected string, received undefined (path: id)
- Invalid input: expected string, received undefined (path: name)
- Invalid input: expected array, received undefined (path: entities)
```

#### Expected Behavior

`validate_mson_model` should accept the exact output from `create_mson_model` without modification.

#### Actual Behavior

Validation fails because it expects a different schema structure.

#### Impact

- Cannot validate created models
- Tools in the suite don't work together
- Poor developer experience

---

### 🟡 MAJOR: MSON Specification Non-Compliance

**Issue ID:** SDMCP-004
**Severity:** Medium
**Status:** Design Issue

#### Description

The tool doesn't follow the official MSON (Metamodel JSON) specification as defined by System Designer/System Runtime.

#### MSON Specification (from official docs)

**Schema Format:**

```json
{
  "firstName": "property",
  "lastName": "property",
  "age": "property",
  "father": "link",
  "children": "collection",
  "fullName": "method"
}
```

**Model Format (type overrides):**

```json
{
  "firstName": "string",
  "lastName": "string",
  "age": "number",
  "father": "Person",
  "children": ["Person"],
  "fullName": {
    "=>": "string"
  }
}
```

#### Tool's Approach

The tool uses a UML class diagram abstraction layer instead of direct MSON schema/model pairs.

#### Analysis

- **Pros:** More intuitive for users familiar with UML
- **Cons:**
  - Not true MSON format
  - Loses MSON's expressiveness (property vs link vs collection)
  - Cannot leverage System Runtime's metamodel features
  - Confusing for users expecting MSON compliance

#### Recommendation

Either:

1. Rename to "UML Model Tool" to avoid MSON confusion, OR
2. Add true MSON schema/model creation functions alongside UML tools

---

### 🟢 MINOR: System Runtime Bundle Validation Issues

**Issue ID:** SDMCP-005
**Severity:** Low
**Status:** Confirmed

#### Description

The `validate_system_runtime_bundle` function expects a JSON string but receives an object, causing validation to fail.

#### Error

```
❌ Invalid JSON bundle: "[object Object]" is not valid JSON
```

#### Expected Behavior

Accept both JSON strings and JavaScript objects.

#### Actual Behavior

Only accepts JSON strings, requiring manual `JSON.stringify()`.

#### Impact

- Minor inconvenience
- Inconsistent with other tools that accept objects

---

## MSON Specification Compliance Assessment

### ❌ Schema Definition

**Status:** Not Implemented
**Issue:** No way to define MSON schemas with property/link/collection/method markers

### ❌ Model Definition

**Status:** Partially Implemented
**Issue:** Can define types but not in MSON format

### ⚠️ Type System

**Status:** Partially Implemented
**Issue:** Supports basic types but not custom types or enumerations

### ✅ UML Generation

**Status:** Working
**Note:** PlantUML and Mermaid generation works well

### ⚠️ System Runtime Bundle

**Status:** Partially Working
**Issue:** Generates bundles but loses property metadata

---

## Recommendations

### 🔴 CRITICAL PRIORITY

#### 1. Preserve Property Metadata

**Recommendation:** Implement proper property-to-attribute conversion

```typescript
// Suggested implementation
function convertPropertiesToAttributes(properties: Property[]): Attribute[] {
  return properties.map((prop) => ({
    name: prop.name,
    type: prop.type,
    required: prop.required,
    description: prop.description,
    defaultValue: prop.defaultValue,
  }));
}
```

**Benefit:** Users can actually define entity properties through the API

---

#### 2. Fix ID Management

**Recommendation:** Implement consistent ID handling strategy

**Option A - Use Provided IDs:**

```typescript
function createEntity(input: EntityInput): Entity {
  return {
    id: input.id, // Use as-is
    name: input.name,
    // ...
  };
}
```

**Option B - Auto-generate with Reference Update:**

```typescript
function createModel(input: ModelInput): Model {
  const idMap = new Map<string, string>();

  // Generate new IDs and track mapping
  const entities = input.entities.map((e) => {
    const newId = generateUUID();
    idMap.set(e.id, newId);
    return { ...e, id: newId };
  });

  // Update all relationship references
  const relationships = input.relationships.map((r) => ({
    ...r,
    from: idMap.get(r.from) || r.from,
    to: idMap.get(r.to) || r.to,
  }));

  return { entities, relationships };
}
```

**Benefit:** Relationships work correctly, no broken references

---

#### 3. Align Validation with Creation

**Recommendation:** Ensure `validate_mson_model` accepts `create_mson_model` output

```typescript
// Validation should accept this exact structure
interface ModelOutput {
  id: string;
  name: string;
  type: string;
  description?: string;
  entities: Entity[];
  relationships: Relationship[];
}
```

**Benefit:** Tools work together seamlessly

---

### 🟡 HIGH PRIORITY

#### 4. Add True MSON Support

**Recommendation:** Create separate functions for MSON schema/model creation

```typescript
// New function: Create MSON Schema
create_mson_schema({
  name: 'Person',
  schema: {
    firstName: 'property',
    lastName: 'property',
    father: 'link',
    children: 'collection',
    fullName: 'method',
  },
});

// New function: Create MSON Model (type overrides)
create_mson_model_types({
  name: 'Person',
  model: {
    firstName: 'string',
    lastName: 'string',
    father: 'Person',
    children: ['Person'],
    fullName: { '=>': 'string' },
  },
});
```

**Benefit:**

- True MSON compliance
- Leverage full System Runtime capabilities
- Clear separation between UML and MSON approaches

---

#### 5. Improve Error Messages

**Recommendation:** Provide detailed, actionable error messages

**Current:**

```
Invalid input: expected string, received undefined (path: id)
```

**Suggested:**

```
Missing required field 'id' in model definition.
Expected: A unique identifier string for the model
Example: "model_nfl_teams_001"
Received: undefined

Tip: The create_mson_model function should automatically generate this,
but validate_mson_model requires it explicitly.
```

**Benefit:** Better developer experience, faster debugging

---

### 🟢 MEDIUM PRIORITY

#### 6. Add Relationship Validation

**Recommendation:** Validate relationship references before creating them

```typescript
function validateRelationships(
  entities: Entity[],
  relationships: Relationship[]
): ValidationResult {
  const entityIds = new Set(entities.map((e) => e.id));
  const errors = [];

  for (const rel of relationships) {
    if (!entityIds.has(rel.from)) {
      errors.push(`Relationship '${rel.id}' references unknown entity '${rel.from}'`);
    }
    if (!entityIds.has(rel.to)) {
      errors.push(`Relationship '${rel.id}' references unknown entity '${rel.to}'`);
    }
  }

  return { valid: errors.length === 0, errors };
}
```

**Benefit:** Catch errors early, prevent invalid models

---

#### 7. Support Flexible Input Formats

**Recommendation:** Accept both objects and JSON strings in validation functions

```typescript
function validate_system_runtime_bundle(input: object | string) {
  const bundle = typeof input === 'string' ? JSON.parse(input) : input;
  // ... validation logic
}
```

**Benefit:** More flexible, user-friendly API

---

#### 8. Add Comprehensive Examples

**Recommendation:** Include working examples in tool documentation

```markdown
## Example: Creating a Complete Model

### Step 1: Create the model

const model = create_mson_model({
name: "BlogSystem",
type: "class",
entities: [
{
id: "post",
name: "Post",
type: "class",
properties: [
{ name: "title", type: "string", required: true },
{ name: "content", type: "string", required: true }
]
}
]
});

### Step 2: Generate UML

const uml = generate_uml_diagram({ model, format: "mermaid" });

### Step 3: Create System Runtime bundle

const bundle = create_system_runtime_bundle({ model });
```

**Benefit:** Users can quickly understand and use the tool

---

### 🔵 LOW PRIORITY (Nice to Have)

#### 9. Add Method Support

Currently methods are not well-supported. Add proper method definition:

```typescript
interface Method {
  name: string;
  parameters: Parameter[];
  returnType: string;
  description?: string;
}
```

#### 10. Support Inheritance

Add support for class inheritance in the model:

```typescript
interface Entity {
  // ... existing fields
  inherits?: string[]; // IDs of parent entities
}
```

#### 11. Add Export Formats

Support exporting to additional formats:

- TypeScript interfaces
- JSON Schema
- OpenAPI/Swagger definitions
- Database DDL (SQL)

---

## Testing Recommendations

### Unit Tests Needed

1. Property preservation through create → validate → bundle pipeline
2. ID consistency across all operations
3. Relationship reference validation
4. MSON format compliance
5. Error message clarity

### Integration Tests Needed

1. Full workflow: create → validate → generate UML → create bundle
2. Round-trip: create model → export → import → verify equality
3. System Designer import compatibility

---

## Conclusion

The System Designer MCP tool shows promise but needs significant improvements to be production-ready. The most critical issues are:

1. **Property data loss** - Makes the tool unusable for real modeling
2. **ID management** - Creates broken relationships
3. **Tool incompatibility** - Functions don't work together

### Immediate Actions Required

1. Fix property preservation (SDMCP-001)
2. Fix ID management (SDMCP-002)
3. Align validation with creation (SDMCP-003)

### Long-term Improvements

1. Add true MSON support (SDMCP-004)
2. Improve documentation and examples
3. Add comprehensive test coverage

### MSON Compliance Verdict

**Current Status:** ❌ Not MSON Compliant
**Recommendation:** Either achieve full compliance or rebrand as "UML Model Tool"

---

## Additional Resources

- [System Designer Official Docs](https://designfirst.io/systemdesigner/)
- [MSON Specification](https://designfirst.io/systemruntime/documentation/docs/en/design-your-model)
- [System Runtime Documentation](https://designfirst.io/systemruntime/)

---

**Report End**
