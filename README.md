# System Designer MCP Server

A Model Context Protocol (MCP) server that provides AI agents with tools to create, validate, and export UML system models. Built with a tool-based approach that empowers LLMs rather than trying to replace their natural language understanding capabilities.

## Features

### Core Tools

- **create_mson_model**: Create and validate MSON models from structured data
- **validate_mson_model**: Validate MSON model consistency and completeness
- **generate_uml_diagram**: Generate UML diagrams in PlantUML and Mermaid formats
- **export_to_system_designer**: Export models to System Designer application format

### Key Capabilities

- ✅ **Tool-Based Architecture**: LLMs handle understanding, server handles validation/formatting
- ✅ **Type Safety**: Comprehensive Zod schema validation for all inputs and outputs
- ✅ **Multiple UML Formats**: Support for both PlantUML and Mermaid diagram generation
- ✅ **System Designer Integration**: Direct export to System Designer macOS application
- ✅ **Comprehensive Testing**: Full test coverage for all tools and functionality

## Installation

### Prerequisites

- [Bun](https://bun.sh/) JavaScript runtime
- Node.js compatibility through Bun

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd system-designer-mcp

# Install dependencies
bun install

# Build the project
bun run build

# Run tests
bun test
```

## Quick Start

### Using the MCP Server

1. **Start the server**:

```bash
bun run dev
```

2. **Example tool usage**:

```javascript
// Create a MSON model
const model = await mcpClient.callTool('create_mson_model', {
  name: 'Student Management System',
  type: 'class',
  description: 'A system for managing students and courses',
  entities: [
    {
      id: 'student',
      name: 'Student',
      type: 'class',
      attributes: [
        { name: 'id', type: 'string', visibility: 'private' },
        { name: 'name', type: 'string', visibility: 'public' },
      ],
      methods: [{ name: 'enroll', returnType: 'void', visibility: 'public' }],
    },
  ],
  relationships: [],
});

// Generate UML diagram
const diagram = await mcpClient.callTool('generate_uml_diagram', {
  model: model.content[1].json,
  format: 'plantuml',
});

// Export to System Designer
const exported = await mcpClient.callTool('export_to_system_designer', {
  model: model.content[1].json,
  filePath: './student_system.json',
});
```

### Example MSON Model Structure

```json
{
  "id": "student_system",
  "name": "Student Management System",
  "type": "class",
  "description": "A system for managing students and courses",
  "entities": [
    {
      "id": "student",
      "name": "Student",
      "type": "class",
      "attributes": [
        {
          "name": "id",
          "type": "string",
          "visibility": "private"
        },
        {
          "name": "name",
          "type": "string",
          "visibility": "public"
        }
      ],
      "methods": [
        {
          "name": "enroll",
          "parameters": [
            {
              "name": "course",
              "type": "Course"
            }
          ],
          "returnType": "void",
          "visibility": "public"
        }
      ]
    }
  ],
  "relationships": [
    {
      "id": "enrollment",
      "from": "student",
      "to": "course",
      "type": "association",
      "multiplicity": {
        "from": "1",
        "to": "0..*"
      },
      "name": "enrolls in"
    }
  ]
}
```

## Tool Reference

### create_mson_model

Creates and validates a MSON model from structured data.

**Parameters:**

- `name` (string, required): Name of the model
- `type` (enum, required): Model type - "class", "component", "deployment", or "usecase"
- `description` (string, optional): Description of the model
- `entities` (array, required): Array of entities in the model
- `relationships` (array, optional): Array of relationships between entities

**Returns:**

- Validated MSON model with unique IDs
- Success confirmation with model statistics

### validate_mson_model

Validates MSON model consistency and completeness.

**Parameters:**

- `model` (object, required): MSON model to validate

**Returns:**

- Validation results with warnings and errors
- Entity and relationship counts
- Orphaned relationship detection

### generate_uml_diagram

Generates UML diagrams from MSON models.

**Parameters:**

- `model` (object, required): MSON model object
- `format` (enum, optional): Output format - "plantuml" (default) or "mermaid"

**Returns:**

- Generated diagram markup in requested format
- Ready-to-use PlantUML or Mermaid code

### export_to_system_designer

Exports MSON model to System Designer application format.

**Parameters:**

- `model` (object, required): MSON model to export
- `filePath` (string, optional): File path to save the exported file

**Returns:**

- Export success confirmation with file location
- System Designer-compatible JSON format

## Architecture

### Tool-Based Approach

This server uses a tool-based architecture that:

1. **Empowers LLMs**: The LLM handles understanding requirements and creating structured data
2. **Validates Input**: Server validates structured input using comprehensive Zod schemas
3. **Processes Efficiently**: Simple, fast processing without complex parsing logic
4. **Exports Flexibly**: Multiple output formats for different use cases

### Benefits Over Parser-Based Approaches

- **Simplicity**: No complex NLP parsing to maintain
- **Flexibility**: Works with any domain the LLM understands
- **Reliability**: Fewer moving parts, less error-prone
- **Performance**: Faster validation and processing
- **Extensibility**: Easy to add new tools and features

## Development

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch
```

### Building

```bash
# Build for production
bun run build

# Start production server
bun start
```

### Code Structure

```
src/
├── index.ts              # Main MCP server entry point
├── types.ts              # MSON type definitions and Zod schemas
├── tools/
│   ├── create-model.ts    # create_mson_model tool
│   ├── validate-model.ts # validate_mson_model tool
│   ├── generate-diagram.ts # generate_uml_diagram tool
│   └── export-model.ts   # export_to_system_designer tool
└── utils/
    ├── plantuml.ts       # PlantUML generation utilities
    ├── mermaid.ts        # Mermaid generation utilities
    └── validation.ts     # Model validation utilities
```

## Integration with System Designer

The server exports models in a format compatible with the System Designer macOS application:

1. **File Export**: Models are saved as JSON files
2. **Automatic Integration**: Files can be imported directly into System Designer
3. **Format Compatibility**: Uses MSON (Metamodel JavaScript Object Notation) format

## Contributing

This project follows a simple contribution model:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) for the tool integration framework
- [System Designer](https://systemdesigner.io/) for the target macOS application
- [Zod](https://zod.dev/) for type-safe validation
- [Bun](https://bun.sh/) for the fast JavaScript runtime
