# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that provides AI agents with tools to create, validate, and export UML system models. The project uses a tool-based approach that empowers LLMs rather than trying to replace their natural language understanding capabilities.

## Essential Commands

### Development

```bash
# Start development server with watch mode
bun run dev

# Run tests
bun test
bun test --watch

# Build for production
bun run build
bun start

# Code quality
bun run lint          # Check for linting errors
bun run lint:fix      # Fix linting errors
bun run format        # Format code with Prettier
bun run format:check  # Check formatting without changes
```

### Testing

```bash
# Run all tests
bun test

# Run in watch mode for development
bun test --watch
```

## Architecture

### Single-File Structure

- **Main Entry**: `src/index.ts` - Contains all MCP server logic, tools, and utilities
- **No Separate Tool Files**: All tool implementations are embedded in the main file
- **No Separate Utility Files**: All helper functions are inline

### Tool-Based Architecture

The server follows a tool-based approach where:

1. **LLM handles understanding** - Natural language → structured MSON model
2. **Server handles validation** - Zod schemas ensure type safety
3. **Server processes and exports** - Multiple output formats

### Available Tools

- `create_mson_model` - Create and validate MSON models from structured data
- `validate_mson_model` - Validate MSON model consistency and completeness
- `generate_uml_diagram` - Generate UML diagrams in PlantUML and Mermaid formats
- `export_to_system_designer` - Export models to System Designer application format

## Key Technical Details

### Runtime

- **Bun JavaScript Runtime** - All commands use `bun` instead of `node`
- **TypeScript** - Full type safety with strict mode enabled
- **Zod Validation** - Comprehensive schema validation for all tool inputs/outputs

### Dependencies

- `@modelcontextprotocol/sdk` - MCP server framework
- `zod` - Type-safe validation schemas

### Code Style

- **ESLint** - TypeScript linting with recommended rules
- **Prettier** - Code formatting with 100-character line width
- **Semi-colons** - Enabled
- **Single quotes** - Enabled
- **Trailing commas** - ES5 style

### MSON Model Structure

Models use Zod schemas with these key components:

- **Entities** - Classes, interfaces, enums with attributes and methods
- **Relationships** - Associations, inheritance, dependencies between entities
- **Validation** - Automatic ID generation, orphan detection, consistency checks

## Development Patterns

### Testing Approach

- Tests in `test/` directory use Bun's built-in test runner
- Tool-based testing validates MCP server functionality
- Test data includes proper IDs to avoid validation errors

### Code Organization

- Single large file with clear section comments
- Zod schemas defined at the top for type safety
- Tool handlers as separate functions within the main file
- Utility functions inline where used

### Integration Patterns

- File-based communication with System Designer macOS app
- Exports to multiple formats (JSON, PlantUML, Mermaid)
- No direct API dependencies - uses file system operations

## Important Notes

- Always use `bun` commands instead of `npm` or `node`
- The main server logic is entirely in `src/index.ts`
- No separate tool files exist despite directory structure
- Zod schemas provide comprehensive validation
- Tool-based approach means LLM creates structured data, server validates/exports
