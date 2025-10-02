[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/chevyphillip-system-designer-mcp-badge.png)](https://mseep.ai/app/chevyphillip-system-designer-mcp)


# System Designer MCP Server

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/chevyphillip/system-designer-mcp?utm_source=oss&utm_medium=github&utm_campaign=chevyphillip%2Fsystem-designer-mcp&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
[![Verified on MseeP](https://mseep.ai/badge.svg)](https://mseep.ai/app/5d7ccf51-18ca-400a-a973-b132fa11ab92)

A Model Context Protocol (MCP) server that provides AI agents with tools to create, validate, and export UML system models and System Runtime bundles. Built with a tool-based approach that empowers LLMs to generate complete, executable System Runtime applications.

## 📚 Documentation

- [API Reference](./docs/API-REFERENCE.md) - Detailed API documentation for all MCP tools
- [System Runtime Integration Guide](./docs/SYSTEM-RUNTIME-INTEGRATION-GUIDE.md) - Complete guide to System Runtime bundle creation
- [Cloudflare Deployment Guide](./CLOUDFLARE_DEPLOYMENT.md) - Deploy to Cloudflare Workers as remote MCP server
- [CLI Guide](./docs/CLI-GUIDE.md) - Command-line interface usage and examples
- [Integration Guide](./docs/INTEGRATION-GUIDE.md) - Platform integration instructions
- [Examples](./examples/README.md) - Sample models and use cases
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project
- [Code of Conduct](./CODE_OF_CONDUCT.md) - Community guidelines and behavior expectations
- [Security Policy](./SECURITY.md) - Security vulnerability reporting and policies

## Features

### Core MSON Tools

- **create_mson_model**: Create and validate MSON models from structured data
- **validate_mson_model**: Validate MSON model consistency and completeness
- **generate_uml_diagram**: Generate UML diagrams in PlantUML and Mermaid formats
- **export_to_system_designer**: Export models to System Designer application format

### System Runtime Tools

- **create_system_runtime_bundle**: Convert MSON models to complete System Runtime bundles
- **validate_system_runtime_bundle**: Validate System Runtime bundles for correctness and compatibility

### Key Capabilities

- ✅ **Tool-Based Architecture**: LLMs handle understanding, server handles validation/formatting
- ✅ **Type Safety**: Comprehensive Zod schema validation for all inputs and outputs
- ✅ **System Runtime Integration**: Full support for System Runtime bundle generation and validation
- ✅ **Bidirectional Relationships**: Automatic bidirectional relationship creation
- ✅ **Multiple Inheritance**: Support for classes implementing multiple interfaces
- ✅ **Multiple UML Formats**: Support for both PlantUML and Mermaid diagram generation
- ✅ **System Designer Integration**: Direct export to System Designer macOS application
- ✅ **Comprehensive Testing**: 46 tests with 302 expect() calls covering all functionality
- ✅ **Critical Bug Fixes**: Resolved SDMCP-001 through SDMCP-005 (property preservation, ID management, validation consistency)
- ✅ **Streamable HTTP Transport**: Modern MCP protocol (2025-03-26 specification)
- ✅ **Stateless Operation**: Each request creates new server instance
- ✅ **Single Endpoint**: Single `/mcp` endpoint handles all operations
- ✅ **Workers Optimized**: Stateless design perfect for Cloudflare Workers

## Installation

### Prerequisites

- [Bun](https://bun.sh/) JavaScript runtime
- Node.js compatibility through Bun

### Setup

```bash
# Clone the repository
git clone https://github.com/chevyphillip/system-designer-mcp.git
cd system-designer-mcp

# Install dependencies
bun install

# Build the project
bun run build

# Run tests
bun test
```

## Quick Start

```bash
# Clone the repository
git clone https://github.com/chevyphillip/system-designer-mcp.git
cd system-designer-mcp

# Install dependencies
bun install

# Build the project
bun run build

# Run tests
bun test
```

## Deployment Options

The System Designer MCP Server can run in two modes:

### Local Mode (stdio transport)

**Start the local server**:

```bash
bun run dev
```

### Remote Mode (Cloudflare Workers)

Deploy as a remote MCP server accessible over HTTP with SSE transport:

```bash
# Test locally with Wrangler
bun run dev:worker

# Deploy to Cloudflare Workers
bunx wrangler login
bun run deploy
```

Your MCP server will be available at:

```text
https://system-designer-mcp.<your-subdomain>.workers.dev
```

**Note**: Replace `<your-subdomain>` with your actual Cloudflare Workers subdomain.

**Key Features:**

- ✅ SSE (Server-Sent Events) transport for remote access
- ✅ No authentication required (configurable)
- ✅ All 6 MCP tools available
- ✅ Returns JSON data directly (no file system)
- ✅ Automatic session management
- ✅ CORS support for web clients

**See [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) for detailed deployment instructions.**

## Usage Examples

**Example tool usage**:

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

// Create System Runtime bundle
const bundle = await mcpClient.callTool('create_system_runtime_bundle', {
  model: model.content[1].json,
  version: '1.0.0',
});

// Validate System Runtime bundle
const validation = await mcpClient.callTool('validate_system_runtime_bundle', {
  bundle: bundle.content[2].text, // JSON bundle from previous step
});
```

### CLI Usage

The server includes a CLI tool for testing and model management:

```bash
# Test System Designer integration
bun run src/cli.ts test-integration

# Export a test model
bun run src/cli.ts export-model MyModel "Test model description"

# Show configuration
bun run src/cli.ts config
```

See the [CLI Guide](./docs/CLI-GUIDE.md) for detailed usage instructions.

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

For detailed API documentation, see the [API Reference](./docs/API-REFERENCE.md).

### Available Tools

- **create_mson_model** - Create and validate MSON models from structured data with automatic ID generation and relationship mapping
- **validate_mson_model** - Validate MSON model consistency and completeness with detailed error messages and relationship validation
- **generate_uml_diagram** - Generate UML diagrams in PlantUML and Mermaid formats
- **export_to_system_designer** - Export models to System Designer application format
- **create_system_runtime_bundle** - Convert MSON models to complete System Runtime bundles with schemas, models, types, behaviors, and components
- **validate_system_runtime_bundle** - Validate System Runtime bundles for correctness and compatibility

## Platform Integration

The server can be integrated with various platforms:

- **Claude Desktop** - Native MCP integration
- **VS Code** - Extension development support
- **Web Applications** - React/Node.js integration
- **CLI Tools** - Command-line interface

See the [Integration Guide](./docs/INTEGRATION-GUIDE.md) for detailed setup instructions.

## Architecture

### Modular Structure

The codebase follows SOLID principles with clear separation of concerns:

- **`src/types.ts`** - TypeScript type definitions for MSON models
- **`src/schemas.ts`** - Zod validation schemas for all data structures
- **`src/tools.ts`** - MCP tool registration using modern SDK patterns
- **`src/index.ts`** - Local MCP server with stdio transport (Node.js/Bun)
- **`src/worker.ts`** - Remote MCP server with SSE transport (Cloudflare Workers)
- **`src/cli.ts`** - Command-line interface for testing and integration
- **`src/integration/`** - System Designer app integration
- **`src/transformers/`** - MSON to System Runtime transformation logic
- **`src/validators/`** - System Runtime bundle validation logic

### Modern MCP SDK Patterns

The server uses the modern MCP TypeScript SDK (v1.18.2) patterns:

1. **`server.registerTool()`** - Modern tool registration API (not legacy `server.tool()`)
2. **Zod Input Schemas** - Type-safe input validation with Zod schema shapes
3. **Title Metadata** - Each tool includes a `title` field for better UX
4. **Type Inference** - Handler methods use Zod-inferred types for parameters

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

```text
src/
├── types.ts                    # TypeScript type definitions for MSON models
├── schemas.ts                  # Zod validation schemas for all data structures
├── tools.ts                    # MCP tool registration using modern SDK patterns
├── index.ts                    # Local MCP server (stdio transport)
├── worker.ts                   # Remote MCP server (SSE transport for Workers)
├── cli.ts                      # Command-line interface
├── integration/
│   └── system-designer.ts     # System Designer app integration
├── transformers/
│   └── system-runtime.ts      # MSON to System Runtime transformation
└── validators/
    └── system-runtime.ts      # System Runtime bundle validation

test/
└── tool-based.test.ts         # Comprehensive test suite

docs/
├── API-REFERENCE.md           # Detailed API documentation
├── CLI-GUIDE.md              # CLI usage guide
├── INTEGRATION-GUIDE.md      # Platform integration guide
└── SYSTEM-RUNTIME-INTEGRATION-GUIDE.md  # System Runtime guide

examples/
├── banking-system.json        # Sample banking system model
├── banking-system-plantuml.puml  # PlantUML output example
├── banking-system-mermaid.md  # Mermaid output example
└── README.md                  # Example documentation

CLOUDFLARE_DEPLOYMENT.md       # Cloudflare Workers deployment guide
test-worker.sh                 # Automated testing script for Workers
wrangler.toml                  # Cloudflare Workers configuration
```

## Integration with System Designer

The server exports models in a format compatible with the System Designer macOS application:

1. **File Export**: Models are saved as JSON files
2. **Automatic Integration**: Files can be imported directly into System Designer
3. **Format Compatibility**: Uses MSON (Metamodel JavaScript Object Notation) format

## Recent Changes & Improvements

### Latest Updates (v1.0.0)
- 🎯 **Critical Bug Fixes (SDMCP-001-005)**: Resolved property preservation, ID mapping, validation consistency, and bundle compatibility issues
- 🔧 **Enhanced Error Messages**: Added detailed, actionable error messages with specific fix suggestions and examples
- 🛡️ **Relationship Validation**: Proactive validation prevents orphaned references with clear guidance
- 🔄 **Flexible Input Handling**: Support for both 'properties' and 'attributes' in entity definitions
- 📋 **Comprehensive Bug Reports**: Detailed documentation of all issues and resolutions in `docs/BUG_REPORTS.md`
- 🆕 **System Runtime Tools**: Added complete System Runtime bundle creation and validation functionality

### Previous Features
- 🏗️ **Modular Architecture**: Complete refactoring for SOLID principles compliance
- 🧪 **Enhanced Testing**: 46 tests with 302 assertions covering all functionality including edge cases
- 🚀 **Cloudflare Workers Support**: Remote MCP server deployment with modern JSON-RPC transport
- 🔄 **Modern MCP SDK**: Updated to latest MCP TypeScript SDK (v1.18.2) patterns
- 📊 **Documentation**: Complete API reference, integration guides, and deployment documentation

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Setting up the development environment
- Running tests and code quality checks
- Code style guidelines
- Submitting pull requests
- Reporting issues

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Acknowledgments

- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) for the tool integration framework
- [System Designer](https://systemdesigner.io/) for the target macOS application
- [Zod](https://zod.dev/) for type-safe validation
- [Bun](https://bun.sh/) for the fast JavaScript runtime
