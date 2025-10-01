# System Designer MCP Server - Integration Guide

## Overview

This guide covers integrating the System Designer MCP Server with various applications and platforms. The server provides a standardized interface for creating and managing UML system models.

## Quick Start

### Prerequisites

- Node.js 18+ or Bun runtime
- System Designer macOS app (for native integration)
- MCP client library or compatible client

### Basic Setup

```bash
# Install the server
git clone <repository-url>
cd system-designer-mcp
bun install

# Test the server
bun test
```

## MCP Integration

### Client Configuration

Configure your MCP client to connect to the System Designer server:

```json
{
  "mcpServers": {
    "system-designer": {
      "command": "bun",
      "args": ["run", "src/index.ts"],
      "env": {}
    }
  }
}
```

### Basic Usage

```javascript
// Initialize MCP client
const client = new MCPClient();

// Connect to System Designer server
await client.connect('system-designer');

// Create a model
const model = await client.callTool('create_mson_model', {
  name: 'E-commerce System',
  type: 'class',
  entities: [
    {
      id: 'user',
      name: 'User',
      type: 'class',
      attributes: [
        { name: 'id', type: 'string', visibility: 'private' },
        { name: 'email', type: 'string', visibility: 'public' },
      ],
    },
  ],
});

// Generate UML diagram
const diagram = await client.callTool('generate_uml_diagram', {
  model: model.content[1].json,
  format: 'plantuml',
});
```

## Platform Integration

### 1. Claude Desktop Integration

Add to your Claude Desktop MCP configuration (see examples/claude-desktop-config.example.json):

```json
{
  "mcpServers": {
    "system-designer": {
      "command": "bun",
      "args": ["run", "/path/to/system-designer-mcp/src/index.ts"],
      "cwd": "/path/to/system-designer-mcp"
    }
  }
}
```

### 2. VS Code Integration

#### Extension Development

```typescript
// VS Code extension integrating with System Designer MCP
import * as vscode from 'vscode';
import { MCPClient } from 'mcp-client';

export function activate(context: vscode.ExtensionContext) {
  const client = new MCPClient();

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('system-designer.createModel', async () => {
      await client.connect('system-designer');
      // Show UI for model creation
    })
  );
}
```

#### Settings Configuration

```json
{
  "systemDesigner.server": {
    "command": "bun",
    "args": ["run", "src/index.ts"],
    "cwd": "${workspaceFolder}/system-designer-mcp"
  }
}
```

### 3. Web Application Integration

#### React Component Example

```typescript
import React, { useState, useEffect } from 'react';
import { MCPClient } from 'mcp-client';

const SystemDesignerIntegration: React.FC = () => {
  const [client, setClient] = useState<MCPClient | null>(null);
  const [models, setModels] = useState<any[]>([]);

  useEffect(() => {
    const initClient = async () => {
      const mcpClient = new MCPClient();
      await mcpClient.connect('system-designer');
      setClient(mcpClient);
    };

    initClient();
  }, []);

  const createModel = async (modelData: any) => {
    if (!client) return;

    const result = await client.callTool('create_mson_model', modelData);
    setModels(prev => [...prev, result.content[1].json]);
  };

  return (
    <div>
      <ModelCreator onCreateModel={createModel} />
      <ModelList models={models} />
    </div>
  );
};
```

### 4. Node.js Application Integration

#### Express.js Middleware

```typescript
import express from 'express';
import { MCPClient } from 'mcp-client';

const app = express();
const mcpClient = new MCPClient();

// Initialize MCP connection
app.use(async (req, res, next) => {
  if (!mcpClient.isConnected) {
    await mcpClient.connect('system-designer');
  }
  next();
});

// API endpoint for model creation
app.post('/api/models', async (req, res) => {
  try {
    const result = await mcpClient.callTool('create_mson_model', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for UML generation
app.post('/api/models/:id/diagram', async (req, res) => {
  try {
    const { format = 'plantuml' } = req.body;
    const result = await mcpClient.callTool('generate_uml_diagram', {
      model: { id: req.params.id },
      format,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## System Designer App Integration

### Native macOS Integration

The server includes built-in integration with the System Designer macOS application:

```typescript
import { SystemDesignerIntegration } from './src/integration/system-designer.js';

const integration = new SystemDesignerIntegration();

// Test integration
const result = await integration.testIntegration();

if (result.canWriteModels) {
  // Export model to System Designer
  await integration.exportMsonModel('MyModel', modelContent);
}
```

### Configuration Options

```typescript
const config = {
  appDataPath: '/Users/user/Library/Application Support/System Designer',
  modelsPath: '/Users/user/Library/Application Support/System Designer/models',
  autoRefresh: true,
};

const integration = new SystemDesignerIntegration(config);
```

## Testing Integration

### Unit Tests

```typescript
import { SystemDesignerMCPServer } from '../src/index.js';

describe('System Designer Integration', () => {
  let server: SystemDesignerMCPServer;

  beforeEach(() => {
    server = new SystemDesignerMCPServer();
  });

  test('should create valid MSON model', async () => {
    const result = await server['handleCreateMsonModel']({
      name: 'Test Model',
      type: 'class',
      entities: [],
    });

    expect(result.content).toHaveLength(2);
    expect(result.content[0].type).toBe('text');
    expect(result.content[1].type).toBe('json');
  });
});
```

### Integration Tests

```typescript
import { MCPClient } from 'mcp-client';

describe('MCP Integration', () => {
  let client: MCPClient;

  beforeAll(async () => {
    client = new MCPClient();
    await client.connect('system-designer');
  });

  test('should handle tool calls', async () => {
    const result = await client.callTool('create_mson_model', {
      name: 'Integration Test',
      type: 'class',
      entities: [
        {
          id: 'test',
          name: 'TestEntity',
          type: 'class',
        },
      ],
    });

    expect(result.content[1].json.name).toBe('Integration Test');
  });
});
```

## Error Handling

### Common Integration Issues

#### Connection Errors

```typescript
try {
  await client.connect('system-designer');
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    console.error('Server not running. Start with: bun run src/index.ts');
  } else if (error.code === 'ENOENT') {
    console.error('Server executable not found');
  }
}
```

#### Tool Call Errors

```typescript
try {
  const result = await client.callTool('create_mson_model', invalidData);
} catch (error) {
  if (error.message.includes('validation')) {
    console.error('Invalid model data:', error.details);
  } else {
    console.error('Tool call failed:', error.message);
  }
}
```

### Retry Logic

```typescript
async function callWithRetry(client: MCPClient, tool: string, args: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.callTool(tool, args);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## Performance Optimization

### Connection Pooling

```typescript
class MCPConnectionPool {
  private clients: MCPClient[] = [];
  private maxClients: number = 5;

  async getClient(): Promise<MCPClient> {
    if (this.clients.length < this.maxClients) {
      const client = new MCPClient();
      await client.connect('system-designer');
      this.clients.push(client);
      return client;
    }

    return this.clients[Math.floor(Math.random() * this.clients.length)];
  }
}
```

### Caching Results

```typescript
class ModelCache {
  private cache = new Map<string, any>();
  private ttl = 5 * 60 * 1000; // 5 minutes

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.ttl) {
      return item.data;
    }
    return null;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}
```

## Security Considerations

### Input Validation

```typescript
function validateModelInput(input: any): boolean {
  // Basic validation
  if (!input.name || typeof input.name !== 'string') return false;
  if (!input.type || !['class', 'component', 'deployment', 'usecase'].includes(input.type))
    return false;

  // Validate entities
  if (input.entities && !Array.isArray(input.entities)) return false;

  return true;
}
```

### File System Security

```typescript
import { join, resolve } from 'path';

function safeFilePath(basePath: string, filename: string): string {
  // Prevent directory traversal
  const safeFilename = filename.replace(/[^a-zA-Z0-9-_]/g, '_');
  return resolve(basePath, safeFilename);
}
```

## Monitoring and Logging

### Request Logging

```typescript
class MCPLogger {
  private logs: Array<{
    timestamp: Date;
    tool: string;
    args: any;
    success: boolean;
    duration: number;
  }> = [];

  async logCall(tool: string, args: any, fn: Function): Promise<any> {
    const start = Date.now();
    let success = false;

    try {
      const result = await fn(args);
      success = true;
      return result;
    } finally {
      const duration = Date.now() - start;
      this.logs.push({
        timestamp: new Date(),
        tool,
        args,
        success,
        duration,
      });
    }
  }
}
```

### Health Checks

```typescript
async function healthCheck(client: MCPClient): Promise<{
  status: 'healthy' | 'unhealthy';
  details: any;
}> {
  try {
    const result = await client.callTool('create_mson_model', {
      name: 'health-check',
      type: 'class',
      entities: [],
    });

    return {
      status: 'healthy',
      details: {
        responseTime: result.timing,
        serverVersion: result.version,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: { error: error.message },
    };
  }
}
```

## Deployment

### Docker Integration

```dockerfile
FROM oven/bun:1

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install

COPY src ./src
COPY docs ./docs

EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  system-designer:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
    volumes:
      - ./models:/app/models
    restart: unless-stopped
```

### Production Configuration

```json
{
  "mcpServers": {
    "system-designer": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "warn"
      }
    }
  }
}
```

## Contributing

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd system-designer-mcp

# Install dependencies
bun install

# Run in development mode
bun run dev

# Run tests
bun test

# Build for production
bun run build
```

### Testing Integration Changes

1. **Unit Tests**: Test individual components
2. **Integration Tests**: Test MCP tool calls
3. **End-to-End Tests**: Test complete workflows
4. **Performance Tests**: Test under load

## Support

For integration issues:

1. Check the troubleshooting section
2. Review error messages and logs
3. Test with the CLI tools first
4. Check the GitHub issues for known problems
5. Create a new issue with detailed reproduction steps

## Version History

- **v1.0.0**: Initial release
  - MCP server implementation
  - System Designer integration
  - CLI tools
  - Comprehensive API
