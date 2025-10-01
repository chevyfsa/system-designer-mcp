/**
 * Cloudflare Workers Entry Point for System Designer MCP Server
 *
 * This file implements the remote MCP server using Streamable HTTP transport
 * for Cloudflare Workers environment. It provides the same MCP tools as the local
 * stdio version but adapted for HTTP-based communication.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
// Cloudflare Workers global types - these are available in the Workers runtime

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MsonModelSchema, CreateMsonModelInputSchema } from './schemas.js';
import { setupTools } from './tools.js';
import { msonToSystemRuntimeBundle } from './transformers/system-runtime.js';
import type { MsonModel, ValidationWarning } from './types.js';
import { validateSystemRuntimeBundle } from './validators/system-runtime.js';

// ============================================================================
// CLOUDFLARE WORKERS ENVIRONMENT
// ============================================================================

interface Env {
  // Add any environment variables or bindings here
  // For example: KV namespaces, Durable Objects, etc.
  [key: string]: unknown;
}

// ============================================================================
// SHARED MCP SERVER CLASS (Workers-compatible)
// ============================================================================

/**
 * Shared MCP server implementation that works in both Node.js and Workers environments.
 * This class contains all the tool handler methods without file system dependencies.
 */
class SystemDesignerMCPServerCore {
  private readonly server: McpServer;

  constructor() {
    this.server = new McpServer({
      name: 'system-designer-mcp',
      version: '1.0.0',
    });

    // Register all MCP tools
    setupTools(this.server, {
      handleCreateMsonModel: this.handleCreateMsonModel.bind(this),
      handleValidateMsonModel: this.handleValidateMsonModel.bind(this),
      handleGenerateUmlDiagram: this.handleGenerateUmlDiagram.bind(this),
      handleExportToSystemDesigner: this.handleExportToSystemDesigner.bind(this),
      handleCreateSystemRuntimeBundle: this.handleCreateSystemRuntimeBundle.bind(this),
      handleValidateSystemRuntimeBundle: this.handleValidateSystemRuntimeBundle.bind(this),
    });
  }

  // ============================================================================
  // MCP TOOL HANDLERS
  // ============================================================================

  async handleCreateMsonModel(args: unknown) {
    // Use input schema that doesn't require IDs
    const result = CreateMsonModelInputSchema.safeParse(args);
    if (!result.success) {
      throw new Error(`Invalid MSON model input: ${result.error.message}`);
    }

    const model = this.ensureUniqueIds(result.data);

    // Validate the complete model
    const validationResult = MsonModelSchema.safeParse(model);
    if (!validationResult.success) {
      throw new Error(`Model validation failed: ${validationResult.error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(validationResult.data, null, 2),
        },
      ],
    };
  }

  async handleValidateMsonModel(args: unknown) {
    const result = MsonModelSchema.safeParse(args);
    if (!result.success) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Validation failed:\n${result.error.message}`,
          },
        ],
        isError: true,
      };
    }

    const model = result.data;
    const warnings: ValidationWarning[] = [];

    // Check for orphaned relationships
    if (model.relationships && model.entities) {
      const entityIds = new Set(model.entities.map((e) => e.id));

      for (const relationship of model.relationships) {
        if (!entityIds.has(relationship.from)) {
          warnings.push({
            type: 'orphaned_relationship',
            message: `Relationship "${relationship.id}" references unknown entity "${relationship.from}"`,
            entityId: relationship.id,
          });
        }

        if (!entityIds.has(relationship.to)) {
          warnings.push({
            type: 'orphaned_relationship',
            message: `Relationship "${relationship.id}" references unknown entity "${relationship.to}"`,
            entityId: relationship.id,
          });
        }
      }
    }

    const isValid = warnings.length === 0;

    return {
      content: [
        {
          type: 'text',
          text: `${isValid ? '✅' : '⚠️'} Model validation complete\n\n${
            warnings.length > 0
              ? 'Warnings:\n' + warnings.map((w) => `  - ${w.message}`).join('\n')
              : 'No issues found.'
          }`,
        },
      ],
      data: {
        isValid,
        warnings,
      },
    };
  }

  async handleGenerateUmlDiagram(args: unknown) {
    const { model, format = 'plantuml' } = args as { model: MsonModel; format?: string };

    if (!model) {
      throw new Error('Model is required for UML diagram generation');
    }

    if (format === 'plantuml') {
      let plantuml = '@startuml\n';
      plantuml += `title ${model.name || 'UML Diagram'}\n\n`;

      // Add entities
      if (model.entities) {
        for (const entity of model.entities) {
          if (entity.type === 'class') {
            plantuml += `class "${entity.name}" as ${entity.id} {\n`;

            // Add attributes
            if (entity.attributes) {
              for (const attr of entity.attributes) {
                const visibility =
                  attr.visibility === 'private' ? '-' : attr.visibility === 'protected' ? '#' : '+';
                plantuml += `  ${visibility}${attr.name}: ${attr.type}\n`;
              }
            }

            // Add methods
            if (entity.methods) {
              for (const method of entity.methods) {
                const visibility =
                  method.visibility === 'private'
                    ? '-'
                    : method.visibility === 'protected'
                      ? '#'
                      : '+';
                const params =
                  method.parameters?.map((p) => `${p.name}: ${p.type}`).join(', ') || '';
                plantuml += `  ${visibility}${method.name}(${params}): ${method.returnType || 'void'}\n`;
              }
            }

            plantuml += '}\n\n';
          } else if (entity.type === 'interface') {
            plantuml += `interface "${entity.name}" as ${entity.id} {\n`;

            if (entity.methods) {
              for (const method of entity.methods) {
                const params =
                  method.parameters?.map((p) => `${p.name}: ${p.type}`).join(', ') || '';
                plantuml += `  +${method.name}(${params}): ${method.returnType || 'void'}\n`;
              }
            }

            plantuml += '}\n\n';
          } else if (entity.type === 'enum') {
            plantuml += `enum "${entity.name}" as ${entity.id} {\n`;

            if (entity.values) {
              for (const value of entity.values) {
                plantuml += `  ${value}\n`;
              }
            }

            plantuml += '}\n\n';
          }
        }
      }

      // Add relationships
      if (model.relationships) {
        for (const rel of model.relationships) {
          if (rel.type === 'association') {
            const fromMultiplicity = rel.multiplicity?.from || '1';
            const toMultiplicity = rel.multiplicity?.to || '1';
            plantuml += `${rel.from} "${fromMultiplicity}" --> "${toMultiplicity}" ${rel.to}\n`;

            if (rel.name) {
              plantuml += `note left of ${rel.from}--${rel.to}: ${rel.name}\n`;
            }
          } else if (rel.type === 'inheritance') {
            plantuml += `${rel.from} --|> ${rel.to}\n`;
          } else if (rel.type === 'implementation') {
            plantuml += `${rel.from} ..|> ${rel.to}\n`;
          } else if (rel.type === 'dependency') {
            plantuml += `${rel.from} ..> ${rel.to}\n`;
          }
        }
      }

      plantuml += '@enduml';

      return {
        content: [
          {
            type: 'text',
            text: plantuml,
          },
        ],
      };
    } else if (format === 'mermaid') {
      let mermaid = `classDiagram\n`;
      mermaid += `    title ${model.name || 'UML Diagram'}\n\n`;

      // Add entities
      if (model.entities) {
        for (const entity of model.entities) {
          if (entity.type === 'class') {
            mermaid += `    class ${entity.name} {\n`;

            if (entity.attributes) {
              for (const attr of entity.attributes) {
                const visibility =
                  attr.visibility === 'private' ? '-' : attr.visibility === 'protected' ? '#' : '+';
                mermaid += `        ${visibility}${attr.name}: ${attr.type}\n`;
              }
            }

            if (entity.methods) {
              for (const method of entity.methods) {
                const visibility =
                  method.visibility === 'private'
                    ? '-'
                    : method.visibility === 'protected'
                      ? '#'
                      : '+';
                const params =
                  method.parameters?.map((p) => `${p.name}: ${p.type}`).join(', ') || '';
                mermaid += `        ${visibility}${method.name}(${params}): ${method.returnType || 'void'}\n`;
              }
            }

            mermaid += '    }\n\n';
          } else if (entity.type === 'interface') {
            mermaid += `    class ${entity.name} {\n`;
            mermaid += '        <<interface>>\n';

            if (entity.methods) {
              for (const method of entity.methods) {
                const params =
                  method.parameters?.map((p) => `${p.name}: ${p.type}`).join(', ') || '';
                mermaid += `        +${method.name}(${params}): ${method.returnType || 'void'}\n`;
              }
            }

            mermaid += '    }\n\n';
          } else if (entity.type === 'enum') {
            mermaid += `    class ${entity.name} {\n`;
            mermaid += '        <<enumeration>>\n';

            if (entity.values) {
              for (const value of entity.values) {
                mermaid += `        ${value}\n`;
              }
            }

            mermaid += '    }\n\n';
          }
        }
      }

      // Add relationships
      if (model.relationships) {
        for (const rel of model.relationships) {
          if (rel.type === 'association') {
            const fromEntity = model.entities?.find((e) => e.id === rel.from);
            const toEntity = model.entities?.find((e) => e.id === rel.to);

            if (fromEntity && toEntity) {
              const fromMultiplicity = rel.multiplicity?.from || '1';
              const toMultiplicity = rel.multiplicity?.to || '1';
              mermaid += `    ${fromEntity.name} "${fromMultiplicity}" -- "${toMultiplicity}" ${toEntity.name}\n`;

              if (rel.name) {
                mermaid += `        ${rel.name}\n`;
              }
            }
          } else if (rel.type === 'inheritance') {
            const fromEntity = model.entities?.find((e) => e.id === rel.from);
            const toEntity = model.entities?.find((e) => e.id === rel.to);

            if (fromEntity && toEntity) {
              mermaid += `    ${fromEntity.name} --|> ${toEntity.name}\n`;
            }
          } else if (rel.type === 'implementation') {
            const fromEntity = model.entities?.find((e) => e.id === rel.from);
            const toEntity = model.entities?.find((e) => e.id === rel.to);

            if (fromEntity && toEntity) {
              mermaid += `    ${fromEntity.name} ..|> ${toEntity.name}\n`;
            }
          } else if (rel.type === 'dependency') {
            const fromEntity = model.entities?.find((e) => e.id === rel.from);
            const toEntity = model.entities?.find((e) => e.id === rel.to);

            if (fromEntity && toEntity) {
              mermaid += `    ${fromEntity.name} ..> ${toEntity.name}\n`;
            }
          }
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: mermaid,
          },
        ],
      };
    } else {
      throw new Error(`Unsupported format: ${format}. Supported formats: plantuml, mermaid`);
    }
  }

  async handleExportToSystemDesigner(args: unknown) {
    // In Workers environment, we can't write to the filesystem
    // Instead, return the JSON data that can be saved by the client
    const { model } = args as { model: MsonModel };

    if (!model) {
      throw new Error('Model is required for export');
    }

    const exportData = {
      format: 'mson',
      version: '1.0',
      model: model,
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: 'system-designer-mcp',
      },
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(exportData, null, 2),
        },
      ],
    };
  }

  async handleCreateSystemRuntimeBundle(args: unknown) {
    const { model, version = '1.0.0' } = args as { model: MsonModel; version?: string };

    if (!model) {
      throw new Error('Model is required for System Runtime bundle creation');
    }

    const bundle = msonToSystemRuntimeBundle(model, version);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(bundle, null, 2),
        },
      ],
    };
  }

  async handleValidateSystemRuntimeBundle(args: unknown) {
    const { bundle } = args as { bundle: string };

    if (!bundle) {
      throw new Error('Bundle is required for validation');
    }

    try {
      const bundleData = JSON.parse(bundle);
      const result = validateSystemRuntimeBundle(bundleData);

      if (result.isValid) {
        return {
          content: [
            {
              type: 'text',
              text: '✅ System Runtime bundle is valid and ready for deployment.',
            },
          ],
          data: {
            isValid: true,
            bundle: bundleData,
          },
        };
      } else {
        const errorWarnings = result.warnings.filter((warning) => warning.severity === 'error');
        const otherWarnings = result.warnings.filter((warning) => warning.severity !== 'error');

        const messageLines = [
          '❌ System Runtime bundle validation failed:',
          ...errorWarnings.map((warning) => `- ${warning.message}`),
        ];

        if (errorWarnings.length === 0) {
          messageLines.push('- Unknown validation error');
        }

        if (otherWarnings.length > 0) {
          messageLines.push('', '⚠️ Additional warnings:', ...otherWarnings.map((warning) => `- ${warning.message}`));
        }

        return {
          content: [
            {
              type: 'text',
              text: messageLines.join('\n'),
            },
          ],
          data: {
            isValid: false,
            errors: errorWarnings,
            warnings: otherWarnings,
          },
          isError: true,
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Invalid JSON bundle: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Helper method to generate UUIDs in Workers environment
  private generateUUID(): string {
    // Simple UUID v4 implementation for Workers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Convert input schema to full MSON model with proper ID mapping
  private ensureUniqueIds(model: any): MsonModel {
    // Create ID mapping for entities that need new IDs generated
    const entityIdMap = new Map<string, string>();

    const processedEntities =
      model.entities?.map((entity: any) => {
        // Preserve user-provided IDs, only generate if missing
        const newId = entity.id || `entity_${this.generateUUID()}`;

        // Track mapping for relationship updates
        if (entity.id) {
          entityIdMap.set(entity.id, newId);
        }

        return {
          id: newId,
          name: entity.name,
          type: entity.type,
          description: entity.description,
          attributes: entity.attributes || [],
          methods: entity.methods || [],
          stereotype: entity.stereotype,
          namespace: entity.namespace,
        };
      }) || [];

    // Process relationships and update entity references if needed
    const processedRelationships =
      model.relationships?.map((relationship: any) => {
        const fromId = entityIdMap.get(relationship.from) || relationship.from;
        const toId = entityIdMap.get(relationship.to) || relationship.to;

        return {
          id: relationship.id || `rel_${this.generateUUID()}`,
          from: fromId,
          to: toId,
          type: relationship.type,
          multiplicity: relationship.multiplicity,
          name: relationship.name,
          description: relationship.description,
        };
      }) || [];

    return {
      id: `model_${Date.now()}`,
      name: model.name,
      type: model.type,
      description: model.description,
      entities: processedEntities,
      relationships: processedRelationships,
    };
  }
}

// ============================================================================
// JSON-RPC REQUEST HANDLER
// ============================================================================

/**
 * Handle JSON-RPC requests for MCP protocol
 */
async function handleJSONRPCRequest(
  mcpServer: SystemDesignerMCPServerCore,
  request: any
): Promise<any> {
  const { jsonrpc, method, params, id } = request;

  if (jsonrpc !== '2.0') {
    return {
      jsonrpc: '2.0',
      error: {
        code: -32600,
        message: 'Invalid JSON-RPC version',
      },
      id,
    };
  }

  if (!method) {
    return {
      jsonrpc: '2.0',
      error: {
        code: -32600,
        message: 'Method not specified',
      },
      id,
    };
  }

  try {
    let result;

    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'system-designer-mcp',
            version: '1.0.0',
          },
        };
        break;

      case 'tools/list':
        result = {
          tools: [
            {
              name: 'create_mson_model',
              description: 'Create and validate MSON models from structured data',
              inputSchema: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Name of the model' },
                  type: {
                    type: 'string',
                    enum: ['class', 'component', 'deployment', 'usecase'],
                    description: 'Type of the model',
                  },
                  description: {
                    type: 'string',
                    description: 'Optional description of the model',
                  },
                  entities: {
                    type: 'array',
                    items: { type: 'object' },
                    description: 'List of entities in the model',
                  },
                  relationships: {
                    type: 'array',
                    items: { type: 'object' },
                    description: 'List of relationships between entities',
                  },
                },
                required: ['name', 'type'],
              },
            },
            {
              name: 'validate_mson_model',
              description: 'Validate MSON model consistency and completeness',
              inputSchema: {
                type: 'object',
                properties: {
                  model: {
                    description: 'The MSON model to validate',
                  },
                },
                required: ['model'],
              },
            },
            {
              name: 'generate_uml_diagram',
              description: 'Generate UML diagrams in PlantUML and Mermaid formats',
              inputSchema: {
                type: 'object',
                properties: {
                  model: {
                    description: 'The MSON model to generate UML from',
                  },
                  format: {
                    type: 'string',
                    enum: ['plantuml', 'mermaid'],
                    default: 'plantuml',
                    description: 'The output format for the UML diagram',
                  },
                },
                required: ['model'],
              },
            },
            {
              name: 'export_to_system_designer',
              description: 'Export models to System Designer application format',
              inputSchema: {
                type: 'object',
                properties: {
                  model: {
                    description: 'The MSON model to export',
                  },
                  filePath: {
                    type: 'string',
                    description: 'Optional file path for the exported model',
                  },
                },
                required: ['model'],
              },
            },
            {
              name: 'create_system_runtime_bundle',
              description:
                'Convert MSON model to complete System Runtime bundle with schemas, models, types, behaviors, and components',
              inputSchema: {
                type: 'object',
                properties: {
                  model: {
                    description: 'The MSON model to convert',
                  },
                  options: {
                    type: 'object',
                    description: 'Optional configuration options for bundle creation',
                  },
                },
                required: ['model'],
              },
            },
            {
              name: 'validate_system_runtime_bundle',
              description:
                'Validate System Runtime bundle for correctness, including schema references, inheritance chains, and method signatures',
              inputSchema: {
                type: 'object',
                properties: {
                  bundle: {
                    description: 'The System Runtime bundle to validate',
                  },
                },
                required: ['bundle'],
              },
            },
          ],
        };
        break;

      case 'tools/call':
        if (!params || !params.name) {
          throw new Error('Tool name is required');
        }

        switch (params.name) {
          case 'create_mson_model':
            result = await mcpServer.handleCreateMsonModel(params.arguments);
            break;
          case 'validate_mson_model':
            result = await mcpServer.handleValidateMsonModel(params.arguments);
            break;
          case 'generate_uml_diagram':
            result = await mcpServer.handleGenerateUmlDiagram(params.arguments);
            break;
          case 'export_to_system_designer':
            result = await mcpServer.handleExportToSystemDesigner(params.arguments);
            break;
          case 'create_system_runtime_bundle':
            result = await mcpServer.handleCreateSystemRuntimeBundle(params.arguments);
            break;
          case 'validate_system_runtime_bundle':
            result = await mcpServer.handleValidateSystemRuntimeBundle(params.arguments);
            break;
          default:
            throw new Error(`Unknown tool: ${params.name}`);
        }
        break;

      default:
        throw new Error(`Unknown method: ${method}`);
    }

    return {
      jsonrpc: '2.0',
      result,
      id,
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error',
      },
      id,
    };
  }
}

// ============================================================================
// MAIN CLOUDFLARE WORKERS FETCH HANDLER
// ============================================================================

/**
 * Main Cloudflare Workers fetch handler using JSON-RPC protocol
 */
export default {
  async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle health check
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    // Handle root endpoint
    if (url.pathname === '/') {
      return new Response(
        JSON.stringify({
          name: 'System Designer MCP Server',
          version: '1.0.0',
          transport: 'Streamable HTTP',
          endpoints: {
            mcp: '/mcp - Streamable HTTP endpoint for MCP connection',
            health: '/health - Health check endpoint',
          },
          documentation: 'https://github.com/chevyfsa/system-designer-mcp',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Handle MCP endpoint with custom JSON-RPC handler
    if (url.pathname === '/mcp') {
      // Handle different HTTP methods
      if (request.method === 'GET') {
        // GET requests return server info (for health checks and discovery)
        return new Response(
          JSON.stringify({
            name: 'System Designer MCP Server',
            version: '1.0.0',
            transport: 'Streamable HTTP',
            protocol: 'JSON-RPC 2.0',
            endpoint: '/mcp',
            method: 'POST',
            description: 'POST JSON-RPC requests to this endpoint for MCP communication',
            documentation: 'https://github.com/chevyfsa/system-designer-mcp',
            availableTools: [
              'create_mson_model',
              'validate_mson_model',
              'generate_uml_diagram',
              'export_to_system_designer',
              'create_system_runtime_bundle',
              'validate_system_runtime_bundle',
            ],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      if (request.method === 'POST') {
        try {
          const requestText = await request.text();

          // Handle empty request body
          if (!requestText.trim()) {
            return new Response(
              JSON.stringify({
                jsonrpc: '2.0',
                error: {
                  code: -32600,
                  message: 'Invalid request: empty request body. Expected JSON-RPC payload.',
                  hint: 'Send POST requests with JSON-RPC 2.0 payload to this endpoint.',
                },
                id: null,
              }),
              {
                status: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              }
            );
          }

          const requestJson = JSON.parse(requestText);

          // Create new MCP server instance for stateless Workers environment
          const mcpServer = new SystemDesignerMCPServerCore();

          // Handle JSON-RPC request
          const response = await handleJSONRPCRequest(mcpServer, requestJson);

          // Clean up server
          mcpServer.server.close();

          return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (error) {
          console.error('Error handling MCP request:', error);

          // Handle JSON parsing errors specifically
          if (error instanceof SyntaxError && error.message.includes('JSON')) {
            return new Response(
              JSON.stringify({
                jsonrpc: '2.0',
                error: {
                  code: -32700,
                  message: 'Parse error: Invalid JSON in request body',
                  hint: 'Ensure your POST request contains valid JSON-RPC 2.0 payload',
                },
                id: null,
              }),
              {
                status: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
              }
            );
          }

          return new Response(
            JSON.stringify({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: 'Internal server error',
                data: error instanceof Error ? error.message : 'Unknown error',
              },
              id: null,
            }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            }
          );
        }
      }

      // Handle other HTTP methods
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: `Method ${request.method} not supported. Use POST for JSON-RPC requests or GET for server info.`,
            allowedMethods: ['GET', 'POST'],
          },
          id: null,
        }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            Allow: 'GET, POST',
          },
        }
      );
    }

    // Handle unsupported methods for SSE endpoints (deprecated)
    if (url.pathname === '/sse' || url.pathname === '/message') {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'SSE transport deprecated. Use /mcp endpoint with Streamable HTTP transport.',
            hint: 'Update your client to use Streamable HTTP transport.',
          },
          id: null,
        }),
        {
          status: 410,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Default response for unknown endpoints
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found',
        },
        id: null,
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  },
};
