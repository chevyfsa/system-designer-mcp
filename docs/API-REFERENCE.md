# System Designer MCP Server - API Reference

## Overview

The System Designer MCP Server provides four core tools for creating, validating, and exporting UML system models using the MSON (Metamodel JavaScript Object Notation) format.

## Available Tools

### 1. create_mson_model

Creates and validates a new MSON model from structured data.

#### Parameters

| Parameter       | Type   | Required | Description                                                             |
| --------------- | ------ | -------- | ----------------------------------------------------------------------- |
| `name`          | string | ✅       | Name of the model                                                       |
| `type`          | string | ✅       | Type of model to create (`class`, `component`, `deployment`, `usecase`) |
| `description`   | string | ❌       | Optional description of the model                                       |
| `entities`      | array  | ✅       | Array of entities in the model                                          |
| `relationships` | array  | ❌       | Array of relationships between entities                                 |

#### Entity Schema

Each entity in the `entities` array supports:

| Property     | Type   | Required | Description                                                      |
| ------------ | ------ | -------- | ---------------------------------------------------------------- |
| `id`         | string | ✅       | Unique identifier for the entity                                 |
| `name`       | string | ✅       | Name of the entity                                               |
| `type`       | string | ✅       | Entity type (`class`, `interface`, `enum`, `component`, `actor`) |
| `stereotype` | string | ❌       | Optional stereotype for the entity                               |
| `namespace`  | string | ❌       | Optional namespace for the entity                                |
| `attributes` | array  | ❌       | Array of entity attributes                                       |
| `methods`    | array  | ❌       | Array of entity methods                                          |

#### Attribute Schema

| Property     | Type    | Required | Default  | Description                                         |
| ------------ | ------- | -------- | -------- | --------------------------------------------------- |
| `name`       | string  | ✅       | -        | Attribute name                                      |
| `type`       | string  | ✅       | -        | Attribute data type                                 |
| `visibility` | string  | ❌       | `public` | Visibility level (`public`, `private`, `protected`) |
| `isStatic`   | boolean | ❌       | `false`  | Whether the attribute is static                     |
| `isReadOnly` | boolean | ❌       | `false`  | Whether the attribute is read-only                  |

#### Method Schema

| Property     | Type    | Required | Default  | Description                                         |
| ------------ | ------- | -------- | -------- | --------------------------------------------------- |
| `name`       | string  | ✅       | -        | Method name                                         |
| `parameters` | array   | ❌       | `[]`     | Array of method parameters                          |
| `returnType` | string  | ❌       | `void`   | Method return type                                  |
| `visibility` | string  | ❌       | `public` | Visibility level (`public`, `private`, `protected`) |
| `isStatic`   | boolean | ❌       | `false`  | Whether the method is static                        |
| `isAbstract` | boolean | ❌       | `false`  | Whether the method is abstract                      |

#### Parameter Schema

| Property | Type   | Required | Description         |
| -------- | ------ | -------- | ------------------- |
| `name`   | string | ✅       | Parameter name      |
| `type`   | string | ✅       | Parameter data type |

#### Relationship Schema

| Property       | Type   | Required | Description                                                                                                    |
| -------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------- |
| `id`           | string | ✅       | Unique identifier for the relationship                                                                         |
| `from`         | string | ✅       | Source entity ID                                                                                               |
| `to`           | string | ✅       | Target entity ID                                                                                               |
| `type`         | string | ✅       | Relationship type (`association`, `inheritance`, `implementation`, `dependency`, `aggregation`, `composition`) |
| `name`         | string | ❌       | Optional relationship name                                                                                     |
| `multiplicity` | object | ❌       | Multiplicity constraints                                                                                       |

#### Multiplicity Schema

| Property | Type   | Required | Description                                     |
| -------- | ------ | -------- | ----------------------------------------------- |
| `from`   | string | ❌       | Source multiplicity (e.g., "1", "0.._", "1.._") |
| `to`     | string | ❌       | Target multiplicity (e.g., "1", "0.._", "1.._") |

#### Returns

```typescript
{
  content: [
    {
      type: 'text',
      text: string, // Success message with model details
    },
    {
      type: 'json',
      json: MsonModel, // Complete validated model
    },
  ];
}
```

#### Example Usage

```javascript
const result = await mcpClient.callTool('create_mson_model', {
  name: 'User Management System',
  type: 'class',
  description: 'System for managing users and roles',
  entities: [
    {
      id: 'user',
      name: 'User',
      type: 'class',
      attributes: [
        { name: 'id', type: 'string', visibility: 'private' },
        { name: 'name', type: 'string', visibility: 'public' },
      ],
      methods: [{ name: 'login', returnType: 'boolean' }],
    },
  ],
  relationships: [],
});
```

---

### 2. validate_mson_model

Validates an existing MSON model for correctness and completeness.

#### Parameters

| Parameter | Type   | Required | Description                |
| --------- | ------ | -------- | -------------------------- |
| `model`   | object | ✅       | The MSON model to validate |

#### Returns

```typescript
{
  content: [
    {
      type: 'text',
      text: string, // Validation results with warnings and errors
    },
  ];
}
```

#### Validation Checks

- **Schema Validation**: Validates against MSON schema definitions
- **Business Logic**: Checks for orphaned relationships and duplicate entity names
- **ID Uniqueness**: Ensures all entity and relationship IDs are unique
- **Reference Integrity**: Validates that all relationship references exist

#### Example Usage

```javascript
const result = await mcpClient.callTool('validate_mson_model', {
  model: {
    name: 'Test Model',
    type: 'class',
    entities: [...],
    relationships: [...]
  }
});
```

---

### 3. generate_uml_diagram

Generates UML diagram markup from an MSON model.

#### Parameters

| Parameter | Type   | Required | Default    | Description                           |
| --------- | ------ | -------- | ---------- | ------------------------------------- |
| `model`   | object | ✅       | -          | The MSON model to generate UML from   |
| `format`  | string | ❌       | `plantuml` | Output format (`plantuml`, `mermaid`) |

#### Returns

```typescript
{
  content: [
    {
      type: 'text',
      text: string, // Success message with diagram markup
    },
  ];
}
```

#### Supported Formats

**PlantUML**: Generates PlantUML class diagram markup

- Supports class, interface, and enum types
- Includes visibility modifiers and stereotypes
- Handles relationships with multiplicity

**Mermaid**: Generates Mermaid class diagram markup

- Web-compatible format
- Works with GitHub, GitLab, and Mermaid Live Editor
- Simplified notation for online platforms

#### Example Usage

```javascript
// Generate PlantUML
const plantumlResult = await mcpClient.callTool('generate_uml_diagram', {
  model: msonModel,
  format: 'plantuml',
});

// Generate Mermaid
const mermaidResult = await mcpClient.callTool('generate_uml_diagram', {
  model: msonModel,
  format: 'mermaid',
});
```

---

### 4. export_to_system_designer

Exports MSON model to System Designer application format.

#### Parameters

| Parameter  | Type   | Required | Description                                  |
| ---------- | ------ | -------- | -------------------------------------------- |
| `model`    | object | ✅       | The MSON model to export                     |
| `filePath` | string | ❌       | Optional file path to save the exported file |

#### Returns

```typescript
{
  content: [
    {
      type: 'text',
      text: string, // Export confirmation with file path
    },
  ];
}
```

#### Export Features

- **Format Compatibility**: Converts MSON to System Designer's JSON format
- **File Management**: Saves to specified path or default location
- **Integration Ready**: Direct import into System Designer macOS app
- **Metadata Preservation**: Maintains all model properties and relationships

#### Example Usage

```javascript
const result = await mcpClient.callTool('export_to_system_designer', {
  model: msonModel,
  filePath: './models/exported-system.json',
});
```

---

## Data Types

### MsonModel

```typescript
interface MsonModel {
  id: string;
  name: string;
  type: 'class' | 'component' | 'deployment' | 'usecase';
  description?: string;
  entities: MsonEntity[];
  relationships: MsonRelationship[];
}
```

### MsonEntity

```typescript
interface MsonEntity {
  id: string;
  name: string;
  type: 'class' | 'interface' | 'enum' | 'component' | 'actor';
  stereotype?: string;
  namespace?: string;
  attributes: MsonAttribute[];
  methods: MsonMethod[];
}
```

### MsonAttribute

```typescript
interface MsonAttribute {
  name: string;
  type: string;
  visibility: 'public' | 'private' | 'protected';
  isStatic: boolean;
  isReadOnly: boolean;
}
```

### MsonMethod

```typescript
interface MsonMethod {
  name: string;
  parameters: MsonParameter[];
  returnType: string;
  visibility: 'public' | 'private' | 'protected';
  isStatic: boolean;
  isAbstract: boolean;
}
```

### MsonRelationship

```typescript
interface MsonRelationship {
  id: string;
  from: string;
  to: string;
  type:
    | 'association'
    | 'inheritance'
    | 'implementation'
    | 'dependency'
    | 'aggregation'
    | 'composition';
  name?: string;
  multiplicity?: MsonMultiplicity;
}
```

## Error Handling

All tools return standardized error responses:

```typescript
{
  content: [
    {
      type: 'text',
      text: string  // Error message
    }
  ],
  isError: boolean
}
```

### Common Errors

- **Validation Error**: Invalid model structure or schema violations
- **Reference Error**: Orphaned relationships or missing entity references
- **Format Error**: Unsupported UML format or invalid parameters
- **File Error**: Export file access or write permissions

## Best Practices

### Model Creation

1. **Use Unique IDs**: Ensure all entity and relationship IDs are unique
2. **Validate Before Export**: Always validate models before generating UML or exporting
3. **Provide Descriptions**: Include meaningful descriptions for better documentation
4. **Use Appropriate Types**: Choose the correct entity and relationship types

### Relationship Management

1. **Check References**: Ensure all relationship references point to valid entities
2. **Use Multiplicity**: Define cardinality constraints where appropriate
3. **Name Relationships**: Provide clear names for complex relationships

### UML Generation

1. **Choose Right Format**: Use PlantUML for complex diagrams, Mermaid for web display
2. **Validate First**: Always validate models before generating UML
3. **Check Output**: Review generated markup for correctness

## Integration Examples

### Complete Workflow

```javascript
// 1. Create a model
const model = await mcpClient.callTool('create_mson_model', {
  name: 'E-commerce System',
  type: 'class',
  entities: [...],
  relationships: [...]
});

// 2. Validate the model
const validation = await mcpClient.callTool('validate_mson_model', {
  model: model.content[1].json
});

// 3. Generate UML diagrams
const plantuml = await mcpClient.callTool('generate_uml_diagram', {
  model: model.content[1].json,
  format: 'plantuml'
});

// 4. Export to System Designer
const export = await mcpClient.callTool('export_to_system_designer', {
  model: model.content[1].json
});
```

## Version History

- **v1.0.0**: Initial release with core MCP tools
- Support for MSON model creation and validation
- PlantUML and Mermaid diagram generation
- System Designer integration
