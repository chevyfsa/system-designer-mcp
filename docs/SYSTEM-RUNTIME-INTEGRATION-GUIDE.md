# System Runtime Integration Guide

## Overview

This guide explains how to use the System Designer MCP Server to create, validate, and export System Runtime bundles. The integration enables LLMs to generate complete, executable System Runtime applications from MSON models.

## Table of Contents

- [Quick Start](#quick-start)
- [MSON to System Runtime Mapping](#mson-to-system-runtime-mapping)
- [Transformation Rules](#transformation-rules)
- [MCP Tools](#mcp-tools)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Quick Start

### 1. Create an MSON Model

```javascript
const model = {
  name: "My Application",
  type: "class",
  description: "A sample application",
  entities: [
    {
      id: "user",
      name: "User",
      type: "class",
      attributes: [
        { name: "username", type: "string", visibility: "public" },
        { name: "email", type: "string", visibility: "public" }
      ],
      methods: [
        {
          name: "login",
          parameters: [{ name: "password", type: "string" }],
          returnType: "boolean",
          visibility: "public"
        }
      ]
    }
  ],
  relationships: []
};
```

### 2. Transform to System Runtime Bundle

Use the `create_system_runtime_bundle` MCP tool:

```javascript
{
  "model": model,
  "version": "1.0.0"  // Optional, defaults to "0.0.1"
}
```

### 3. Validate the Bundle

Use the `validate_system_runtime_bundle` MCP tool:

```javascript
{
  "bundle": generatedBundle
}
```

## MSON to System Runtime Mapping

### Entity Transformation

MSON entities are transformed into System Runtime schemas and models:

| MSON Element | System Runtime Schema | System Runtime Model |
|--------------|----------------------|---------------------|
| Entity name | `_name` | `_name` |
| Attributes (primitive) | `property` | Type string (e.g., `"string"`) |
| Attributes (entity ref) | `link` | Entity name (e.g., `"User"`) |
| Attributes (collection) | `collection` | Array of entity name (e.g., `["Post"]`) |
| Methods | `method` | Method signature with `=>` |
| Inheritance | `_inherit` array | N/A |

### Relationship Transformation

| MSON Relationship | System Runtime Representation |
|-------------------|------------------------------|
| Association (1:1) | `link` in schema, entity name in model |
| Association (1:*) | `collection` in schema, array in model |
| Inheritance | Added to `_inherit` array |
| Aggregation | Same as association |
| Composition | Same as association |

### Attribute Kind Detection

The transformer automatically determines whether an attribute should be a `property`, `link`, or `collection`:

1. **Property**: Primitive types (string, number, boolean, date, any, object, array)
2. **Link**: Entity references with 1:1 or *:1 multiplicity
3. **Collection**: Entity references with 1:* or *:* multiplicity

## Transformation Rules

### 1. Bidirectional Relationships

Relationships are automatically made bidirectional:

```javascript
// MSON: User -> Post (1:*)
{
  from: "user",
  to: "post",
  type: "association",
  multiplicity: { from: "1", to: "0..*" }
}

// System Runtime Result:
// User schema: { posts: "collection" }
// User model: { posts: ["Post"] }
// Post schema: { user: "link" }
// Post model: { user: "User" }
```

### 2. Multiple Inheritance

Classes can inherit from multiple interfaces:

```javascript
// MSON
{
  relationships: [
    { from: "impl", to: "interfaceA", type: "implementation" },
    { from: "impl", to: "interfaceB", type: "implementation" }
  ]
}

// System Runtime
{
  _inherit: ["_Component", "InterfaceA", "InterfaceB"]
}
```

### 3. Method Signatures

Methods are transformed with parameter types and return types:

```javascript
// MSON
{
  name: "greet",
  parameters: [
    { name: "message", type: "string" },
    { name: "times", type: "number" }
  ],
  returnType: "void"
}

// System Runtime Model
{
  greet: {
    message: "string",
    times: "number",
    "=>": "void"
  }
}
```

### 4. Self-Referential Relationships

Tree structures and recursive relationships are supported:

```javascript
// MSON: TreeNode -> TreeNode (1:*)
{
  from: "treenode",
  to: "treenode",
  type: "association",
  multiplicity: { from: "1", to: "0..*" },
  name: "children"
}

// System Runtime
// TreeNode schema: { children: "collection" }
// TreeNode model: { children: ["TreeNode"] }
```

## MCP Tools

### create_system_runtime_bundle

Converts an MSON model to a complete System Runtime bundle.

**Input:**
```javascript
{
  "model": MsonModel,      // Required: The MSON model to convert
  "version": "1.0.0"       // Optional: Semver version string (default: "0.0.1")
}
```

**Output:**
- Success message with bundle statistics
- Complete System Runtime bundle in JSON format
- Validation warnings (if any)

### validate_system_runtime_bundle

Validates a System Runtime bundle for correctness and compatibility.

**Input:**
```javascript
{
  "bundle": SystemRuntimeBundle  // Required: The bundle to validate
}
```

**Output:**
- Validation status (valid/invalid)
- List of errors (if any)
- List of warnings (if any)

**Validation Checks:**
- Schema validation (Zod)
- Schema reference validation
- Component type validation
- Behavior reference validation
- Unique ID validation
- Circular inheritance detection
- Method signature validation

## Examples

### Example 1: Simple Class Model

```javascript
const model = {
  name: "Person System",
  type: "class",
  entities: [{
    id: "person",
    name: "Person",
    type: "class",
    attributes: [
      { name: "firstName", type: "string", visibility: "public" },
      { name: "lastName", type: "string", visibility: "public" }
    ],
    methods: [{
      name: "getFullName",
      parameters: [],
      returnType: "string",
      visibility: "public"
    }]
  }],
  relationships: []
};

// Transform
const bundle = await create_system_runtime_bundle({ model, version: "1.0.0" });

// Result: Complete System Runtime bundle with:
// - 1 schema (Person)
// - 1 model (Person)
// - Empty types, behaviors, components sections
```

### Example 2: Relationships

```javascript
const model = {
  name: "Blog System",
  type: "class",
  entities: [
    {
      id: "user",
      name: "User",
      type: "class",
      attributes: [{ name: "username", type: "string", visibility: "public" }],
      methods: []
    },
    {
      id: "post",
      name: "Post",
      type: "class",
      attributes: [{ name: "title", type: "string", visibility: "public" }],
      methods: []
    }
  ],
  relationships: [{
    id: "rel1",
    from: "user",
    to: "post",
    type: "association",
    multiplicity: { from: "1", to: "0..*" },
    name: "posts"
  }]
};

// Transform creates bidirectional relationship:
// User.posts: collection of Post
// Post.user: link to User
```

## Best Practices

### 1. Use Semantic Versioning

Always specify a version when creating bundles:

```javascript
create_system_runtime_bundle({ model, version: "1.2.3" })
```

### 2. Validate Before Export

Always validate bundles before using them:

```javascript
const bundle = create_system_runtime_bundle({ model });
const validation = validate_system_runtime_bundle({ bundle });

if (!validation.isValid) {
  // Handle errors
}
```

### 3. Handle Warnings

Pay attention to validation warnings - they indicate potential issues:

```javascript
if (validation.warnings.length > 0) {
  console.log("Warnings:", validation.warnings);
}
```

### 4. Use Descriptive Names

Use clear, descriptive names for entities and relationships:

```javascript
// Good
{ name: "enrolledCourses", from: "student", to: "course" }

// Avoid
{ name: "rel1", from: "e1", to: "e2" }
```

### 5. Test with Example Models

Test your transformations with the provided example models:

```bash
bun test test/integration/example-models.test.ts
```

## Troubleshooting

### Common Issues

**Issue**: "Bundle validation failed: Schema references non-existent schema"
- **Cause**: Model references an entity that doesn't exist
- **Solution**: Ensure all relationship targets exist in the entities array

**Issue**: "Circular inheritance detected"
- **Cause**: Inheritance chain forms a loop
- **Solution**: Review inheritance relationships and remove circular references

**Issue**: "Duplicate ID found"
- **Cause**: Multiple objects have the same `_id`
- **Solution**: IDs are auto-generated; this shouldn't happen. Report as a bug.

## Next Steps

- See [API Reference](./API-REFERENCE.md) for detailed tool documentation
- Check [examples/](../examples/) for more complex models
- Read [SYSTEM-RUNTIME-GAP-ANALYSIS.md](./SYSTEM-RUNTIME-GAP-ANALYSIS.md) for implementation details

