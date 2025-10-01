# Cloudflare Workers Deployment Guide

This guide explains how to deploy the System Designer MCP Server to Cloudflare Workers as a remote MCP server.

## Overview

The System Designer MCP Server can run in two modes:

1. **Local Mode** (`src/index.ts`) - Uses stdio transport for local CLI usage
2. **Remote Mode** (`src/worker.ts`) - Uses JSON-RPC over HTTP at the single `/mcp` endpoint

Both modes provide the same 6 MCP tools with the same request/response shapes.

### Transport

- **Single endpoint**: `/mcp` handles all operations
- **Stateless**: Each request creates a new server instance (Workers-friendly)
- **Standard HTTP**: Simple POST requests with JSON-RPC 2.0 payloads

## Prerequisites

- [Bun](https://bun.sh/) JavaScript runtime
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (installed as dev dependency)
- Cloudflare account (free tier works)

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Test Locally

```bash
# Start local development server
bun run dev:worker
```

- Health check: `curl http://localhost:8787/health`
- Server info: `curl http://localhost:8787/mcp` (GET)
- JSON-RPC call (tools/list):

```bash
curl -s -X POST "http://localhost:8787/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

The server will be available at `http://localhost:8787`

### 3. Deploy to Cloudflare

```bash
# Login to Cloudflare (first time only)
bunx wrangler login

# Deploy to Cloudflare Workers
bun run deploy
```

After deployment, your MCP server will be available at:

```text
https://system-designer-mcp.<your-subdomain>.workers.dev
```

**Production Deployment:**

```text
https://system-designer-mcp.system-designer-mcp.workers.dev
```

## Configuration

### wrangler.toml

The `wrangler.toml` file configures your Cloudflare Worker:

```toml
name = "system-designer-mcp"
main = "dist/worker.js"
compatibility_date = "2025-01-30"

[build]
command = "bun run build:worker"
```

**Key Settings:**

- `name` - Worker name (will be part of your URL)
- `main` - Entry point (built from `src/worker.ts`)
- `compatibility_date` - Cloudflare Workers API version
- `build.command` - Build command to run before deployment

### Environment Variables

Currently, no environment variables are required. For future enhancements:

```toml
[vars]
# Add environment variables here
# EXAMPLE_VAR = "value"
```

## Architecture

### Transport Layer

The Workers deployment uses JSON-RPC 2.0 over standard HTTP.

- Single endpoint: `/mcp`
- GET `/mcp`: Returns server/tool info
- POST `/mcp`: Accepts JSON-RPC 2.0 payloads

### Endpoints

| Endpoint  | Method | Description                         |
| --------- | ------ | ----------------------------------- |
| `/`       | GET    | Server information and usage         |
| `/health` | GET    | Health check endpoint                |
| `/mcp`    | GET    | Server/tool info (human-readable)    |
| `/mcp`    | POST   | JSON-RPC 2.0 requests (tools, etc.) |

### Example JSON-RPC calls

- tools/list

```bash
curl -s -X POST "http://localhost:8787/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

- tools/call (create_mson_model)

```bash
curl -s -X POST "http://localhost:8787/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"create_mson_model","arguments":{"name":"Demo","type":"class","entities":[],"relationships":[]}}}'
```

## Available Tools

All 6 MCP tools are available in Workers mode:

1. **create_mson_model** - Create and validate MSON models
2. **validate_mson_model** - Validate model consistency
3. **generate_uml_diagram** - Generate PlantUML/Mermaid diagrams
4. **export_to_system_designer** - Export to System Designer format (returns JSON)
5. **create_system_runtime_bundle** - Create executable runtime bundle
6. **validate_system_runtime_bundle** - Validate runtime bundle

## Key Differences from Local Mode

### File System Operations

**Local Mode:**

- Writes files to disk (e.g., `export_to_system_designer` creates `.json` files)
- Uses `fs-extra` for file operations

**Workers Mode:**

- Returns JSON data directly in response
- No file system access (Workers V8 isolate constraint)
- All data returned via MCP protocol

### Crypto API

**Local Mode:**

- Uses Node.js `crypto` module (`randomUUID`)

**Workers Mode:**

- Uses Web Crypto API (`crypto.randomUUID()`)
- Standard Web API available in Workers

### Session Management

**Local Mode:**

- Single stdio connection per process
- No session management needed

**Workers Mode:**

- Multiple concurrent sessions
- In-memory session storage with 1-hour timeout
- For production: Consider Durable Objects for persistence

## Testing

Use simple curl requests against the single `/mcp` endpoint.

```bash
# Health check
curl http://localhost:8787/health

# Readable server info
curl http://localhost:8787/mcp

# List tools (JSON-RPC)
curl -s -X POST "http://localhost:8787/mcp" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

## Production Considerations

### Session Storage

Current implementation uses in-memory Map for sessions:

- ✅ Simple and fast
- ❌ Lost on Worker restart
- ❌ Not shared across Worker instances

**For production**, consider:

- **Durable Objects** - Persistent, coordinated session storage
- **KV Storage** - Simple key-value storage for session data
- **R2 Storage** - For larger data persistence

### CORS Configuration

Current implementation allows all origins (`Access-Control-Allow-Origin: *`):

```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
}
```

**For production**, restrict to specific origins:

```typescript
headers: {
  'Access-Control-Allow-Origin': 'https://your-client-domain.com',
}
```

### Rate Limiting

Consider adding rate limiting for production:

```toml
# In wrangler.toml
[limits]
# Limit requests per minute
# Note: Requires Cloudflare Workers Paid plan
```

### Monitoring

Enable Cloudflare Workers Analytics:

- Request volume
- Error rates
- Response times
- CPU usage

## Troubleshooting

### Worker Hangs on SSE Connection

**Symptom:** SSE endpoint returns 500 error or hangs
**Solution:** Ensure ReadableStream is properly configured with `start()` and `cancel()` methods

### Session Not Found

**Symptom:** `{"error":"Invalid or expired session"}`
**Solutions:**

- Session expired (1-hour timeout)
- Worker restarted (in-memory sessions lost)
- Establish new SSE connection to get fresh session ID

### Build Errors

**Symptom:** Build fails with module errors
**Solution:** Ensure all imports use `.js` extensions for ES modules:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
```

## Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)

## Support

For issues specific to:

- **Cloudflare Workers**: Check Cloudflare Workers documentation
- **MCP Protocol**: Refer to Model Context Protocol specification
- **This Implementation**: Open an issue in the repository
