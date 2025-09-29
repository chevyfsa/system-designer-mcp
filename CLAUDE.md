
Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## Project: System Designer MCP Server

### Overview
Building an MCP server that provides AI agents with tools to create, validate, and export UML system models using a tool-based approach that empowers LLMs rather than trying to replace their natural language understanding capabilities.

### Architecture
- **MCP Server**: Provides structured tools for AI agents to create system models
- **Tool-Based Approach**: LLM creates structured data → Server validates/processes → Exports to multiple formats
- **No Natural Language Parsing**: LLM handles understanding, server handles validation and formatting
- **Integration**: File-based communication with System Designer macOS application
- **Runtime**: Bun JavaScript runtime with TypeScript and Zod validation

### Development Phases
1. **Phase 1**: Understanding MCP (Week 1) - Learning-focused MCP basics ✅ **COMPLETED**
2. **Phase 2**: Tool-Based Approach (Week 2) - LLM-empowering tools architecture ✅ **COMPLETED**
3. **Phase 3**: UML Diagram Generation (Week 3) - Visual output generation ✅ **COMPLETED**
4. **Phase 4**: Complete Integration (Week 4) - Full testing and documentation ✅ **COMPLETED**

### Key Files Structure
```
src/
├── index.ts              # Main MCP server entry point ✅ COMPLETED
├── types.ts              # MSON type definitions and Zod schemas ✅ COMPLETED
├── tools/                # MCP tool implementations (embedded in index.ts)
│   ├── create_mson_model    # Create and validate MSON models ✅ COMPLETED
│   ├── validate_mson_model  # Validate model consistency ✅ COMPLETED
│   ├── generate_uml_diagram # Generate UML diagrams ✅ COMPLETED
│   └── export_to_system_designer # Export to app format ✅ COMPLETED
└── utils/               # Utility functions (embedded in index.ts)
    ├── plantuml.ts       # PlantUML generation utilities ✅ COMPLETED
    ├── mermaid.ts        # Mermaid generation utilities ✅ COMPLETED
    └── validation.ts     # Model validation utilities ✅ COMPLETED
```

### Architectural Change
**Previous Approach (Parser-Based)**:
- Natural language input → Server-side parsing → MSON model
- Complex NLP processing and pattern matching
- Deterministic rules for entity extraction
- Limited flexibility and high maintenance

**Current Approach (Tool-Based)**:
- LLM creates structured MSON model → Server validates → Processes → Exports
- LLM handles understanding, server handles validation/formatting
- Simple, maintainable tools with clear responsibilities
- Maximum flexibility for any domain the LLM understands

### Benefits of Tool-Based Approach
- **Simplicity**: No complex parsing logic to maintain
- **Flexibility**: Works with any domain the LLM understands (student systems, trucking, etc.)
- **Reliability**: Fewer moving parts, less error-prone
- **Performance**: Faster validation and processing
- **Extensibility**: Easy to add new tools and features

### Available Tools
1. **create_mson_model**: Create and validate MSON models from structured data
2. **validate_mson_model**: Validate MSON model consistency and completeness
3. **generate_uml_diagram**: Generate UML diagrams in PlantUML and Mermaid formats
4. **export_to_system_designer**: Export models to System Designer application format

### Learning Approach
This project demonstrates the proper MCP architecture pattern:
- **Empower LLMs**: Let LLMs handle what they're good at (understanding requirements)
- **Validate Input**: Use comprehensive Zod schemas for type safety
- **Simple Tools**: Each tool has a single, clear responsibility
- **Multiple Outputs**: Support various export formats for different use cases

### Integration Strategy
- **File-based**: Write MSON files to System Designer's data directory
- **Electron app**: System Designer is Electron-based, can integrate via file system
- **No direct API**: Use file operations and potentially AppleScript for app refresh
- **Data directory**: `~/Library/Application Support/System Designer/`

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";

// import .css files directly and it works
import './index.css';

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.
