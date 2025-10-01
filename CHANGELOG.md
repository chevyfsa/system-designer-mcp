# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-10-01

### Added
- Initial public release of the System Designer MCP Server
- Cloudflare Workers deployment using JSON-RPC over HTTP at `/mcp`
- Local stdio mode for CLI and development
- Six MCP tools: create_mson_model, validate_mson_model, generate_uml_diagram, export_to_system_designer, create_system_runtime_bundle, validate_system_runtime_bundle
- Comprehensive documentation: README, API reference, CLI guide, integration guide, Cloudflare deployment guide

### Changed
- Migrated from deprecated SSE transport to single-endpoint JSON-RPC over HTTP (`/mcp`)

### Removed
- Deprecated SSE documentation and test scripts referencing `/sse` and `/message`

