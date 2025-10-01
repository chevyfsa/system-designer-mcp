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

### CLI Usage

```bash
# Test System Designer integration
bun run src/cli.ts test-integration

# Export a test model
bun run src/cli.ts export-model MyModel "Test model description"

# Show configuration
bun run src/cli.ts config
```

## Architecture

### Modular Structure (Post-Refactoring)

The codebase follows SOLID principles with clear separation of concerns:

- **`src/types.ts`** - TypeScript type definitions for MSON models and System Runtime bundles
- **`src/schemas.ts`** - Zod validation schemas for all data structures with flexible input handling
- **`src/tools.ts`** - MCP tool registration using modern SDK patterns
- **`src/index.ts`** - Main MCP server class with tool handler methods and ID mapping logic
- **`src/cli.ts`** - Command-line interface for testing and integration
- **`src/worker.ts`** - Cloudflare Workers implementation with modern JSON-RPC transport
- **`src/integration/system-designer.ts`** - System Designer app integration
- **`src/transformers/system-runtime.ts`** - MSON to System Runtime transformation logic
- **`src/validators/system-runtime.ts`** - System Runtime bundle validation

### Modern MCP SDK Patterns

The server uses the modern MCP TypeScript SDK (v1.18.2) patterns:

1. **`server.registerTool()`** - Modern tool registration API (not legacy `server.tool()`)
2. **Zod Input Schemas** - Type-safe input validation with Zod schema shapes
3. **Title Metadata** - Each tool includes a `title` field for better UX
4. **Type Inference** - Handler methods use Zod-inferred types for parameters

### Tool-Based Architecture

The server follows a tool-based approach where:

1. **LLM handles understanding** - Natural language → structured MSON model
2. **Server handles validation** - Zod schemas ensure type safety
3. **Server processes and exports** - Multiple output formats

### Available Tools

All tools use `server.registerTool()` with Zod input schemas:

- `create_mson_model` - Create and validate MSON models from structured data with automatic ID generation and relationship mapping
- `validate_mson_model` - Validate MSON model consistency and completeness with detailed error messages and relationship validation
- `generate_uml_diagram` - Generate UML diagrams in PlantUML and Mermaid formats
- `export_to_system_designer` - Export models to System Designer application format
- `create_system_runtime_bundle` - Convert MSON models to complete System Runtime bundles
- `validate_system_runtime_bundle` - Validate System Runtime bundles for correctness and compatibility

## Key Technical Details

### Runtime

- **Bun JavaScript Runtime** - All commands use `bun` instead of `node`
- **TypeScript** - Full type safety with strict mode enabled
- **Zod Validation** - Comprehensive schema validation for all tool inputs/outputs

### Dependencies

- `@modelcontextprotocol/sdk` - MCP server framework
- `zod` - Type-safe validation schemas
- `fs-extra` - Enhanced file system operations
- `commander` - CLI framework for command-line interface

### Code Style

- **ESLint** - TypeScript linting with recommended rules, configured for both source and test files
- **Prettier** - Code formatting with 100-character line width
- **Semi-colons** - Enabled
- **Single quotes** - Enabled
- **Trailing commas** - ES5 style
- **TypeScript** - Strict mode enabled, ES2022 target, CommonJS modules

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
- Tests access private methods using `@ts-expect-error` comments

### Code Organization

- **Modular structure** with clear separation of concerns following SOLID principles
- **Type definitions** in `src/types.ts` for all MSON model interfaces
- **Zod schemas** in `src/schemas.ts` for validation and type inference
- **Tool registration** in `src/tools.ts` using modern `registerTool()` API
- **Handler methods** in `src/index.ts` as part of the main server class
- **CLI** separated into `src/cli.ts` for testing and integration
- **Integration** module in `src/integration/` for System Designer specific functionality

### Integration Patterns

- File-based communication with System Designer macOS app
- Exports to multiple formats (JSON, PlantUML, Mermaid)
- No direct API dependencies - uses file system operations
- Integration module handles System Designer specific functionality

### Error Handling

- Comprehensive Zod validation with detailed, actionable error messages and fix suggestions
- Automatic ID generation for missing entity IDs with relationship mapping
- Orphan detection ensures relationships reference valid entities
- Graceful fallbacks for file system operations
- Flexible input handling (supports both 'properties' and 'attributes' in entity definitions)
- Enhanced validation with specific guidance for common errors
- System Runtime bundle validation with clear error reporting

## Important Notes

- Always use `bun` commands instead of `npm` or `node`
- The main server logic is in `src/index.ts` with handler methods
- Tool registration is in `src/tools.ts` using modern `registerTool()` API
- Zod schemas are in `src/schemas.ts` for validation and type inference
- Type definitions are in `src/types.ts` for all MSON model interfaces
- Tool-based approach means LLM creates structured data, server validates/exports
- Test files must include proper entity IDs to pass validation
- ESLint is configured to ignore `dist/` and `node_modules/` directories
- The SDK has strict type constraints for `inputSchema` - use `@ts-expect-error` for complex nested schemas

## Code Quality and Maintenance

### Linting and Type Safety

- **ESLint**: Configured for TypeScript with strict rules. Use `bun run lint` to check.
- **TypeScript**: Strict mode enabled for maximum type safety
- **Cloudflare Workers**: Use `/* eslint-disable no-undef */` for Workers global types
- **Unused Variables**: Prefix with underscore (`_variable`) or remove to satisfy linter

### Cleanup Best Practices

- **Script Files**: Console statements in `scripts/` are acceptable for user feedback
- **Source Files**: Avoid debug `console.log` in production code
- **Import Organization**: No unused imports - all dependencies are actively used
- **Error Handling**: Comprehensive Zod validation with detailed error messages

### Development Workflow

1. **Before Changes**: Run `bun run lint` to check code quality
2. **During Development**: Use `bun test --watch` for continuous testing
3. **After Changes**: Run `bun run lint && bun test && bun run build` to validate
4. **Cleanup**: Remove unused variables, fix lint errors, maintain type safety

### Testing Requirements

- All test data must include valid entity IDs
- Tests access private methods using `@ts-expect-error` comments
- 46 tests with 302 expect() calls covering all functionality
- Both local MCP server and Cloudflare Workers implementations tested
- Updated tests match new error message formats and validation improvements
- Comprehensive coverage for System Runtime bundle creation and validation

### Production Deployment

- **Local Mode**: Use `bun run dev` for stdio transport development
- **Cloudflare Workers**: Use `bun run deploy` for remote JSON-RPC transport
- **Stateless Design**: Workers are stateless - each request creates new server instance
- **Modern Transport**: Updated from SSE to Streamable HTTP JSON-RPC transport
- **Configuration**: Update `claude-desktop-config.json` for local development setup

## Recent Improvements & Bug Fixes

### Critical Issues Resolved (SDMCP-001-005)
- **Property Data Loss (SDMCP-001)**: Entity properties now preserved in output through flexible schema handling
- **Entity ID Regeneration (SDMCP-002)**: Proper ID mapping ensures relationships work with auto-generated IDs
- **Validation Tool Incompatibility (SDMCP-003)**: Tools now work seamlessly with consistent input/output formats
- **System Runtime Bundle Issues (SDMCP-005)**: Flexible validation accepts both object and string formats

### Best Practices Learned
- **User-Friendly Error Messages**: Provide specific fix suggestions and examples in validation errors
- **Flexible Input Handling**: Support multiple property names for better user experience
- **Proactive Validation**: Fail fast on relationship issues to prevent invalid models
- **Comprehensive Testing**: Update tests alongside error message changes for consistency
- **Documentation**: Maintain detailed bug reports for troubleshooting and future reference
