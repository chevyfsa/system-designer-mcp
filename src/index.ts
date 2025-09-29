import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// WHY: This is the main entry point of our MCP server. It initializes the server,
// sets up the tools that AI agents can call, and handles the communication protocol.
// This is where everything starts and where we define what our server can do.

// MSON data types for tool-based approach
const MsonEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['class', 'interface', 'enum', 'component', 'actor']),
  attributes: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        visibility: z.enum(['public', 'private', 'protected']).optional().default('public'),
        isStatic: z.boolean().optional().default(false),
        isReadOnly: z.boolean().optional().default(false),
      })
    )
    .optional()
    .default([]),
  methods: z
    .array(
      z.object({
        name: z.string(),
        parameters: z
          .array(
            z.object({
              name: z.string(),
              type: z.string(),
            })
          )
          .optional()
          .default([]),
        returnType: z.string().optional().default('void'),
        visibility: z.enum(['public', 'private', 'protected']).optional().default('public'),
        isStatic: z.boolean().optional().default(false),
        isAbstract: z.boolean().optional().default(false),
      })
    )
    .optional()
    .default([]),
  stereotype: z.string().optional(),
  namespace: z.string().optional(),
});

const MsonRelationshipSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  type: z.enum([
    'association',
    'inheritance',
    'implementation',
    'dependency',
    'aggregation',
    'composition',
  ]),
  multiplicity: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
  name: z.string().optional(),
});

const MsonModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['class', 'component', 'deployment', 'usecase']),
  description: z.string().optional(),
  entities: z.array(MsonEntitySchema),
  relationships: z.array(MsonRelationshipSchema),
});

type MsonEntity = z.infer<typeof MsonEntitySchema>;
type MsonRelationship = z.infer<typeof MsonRelationshipSchema>;
type MsonModel = z.infer<typeof MsonModelSchema>;

class SystemDesignerMCPServer {
  private server: Server;

  constructor() {
    // Initialize the MCP server with metadata about our server
    this.server = new Server(
      {
        name: 'system-designer-mcp',
        version: '1.0.0',
        description:
          'MCP server for System Designer - Tool-based approach for creating UML diagrams and system models',
      },
      {
        capabilities: {
          tools: {}, // We'll define our tools in the list-tools handler
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // WHY: We need to set up handlers for different types of MCP requests.
    // The list-tools handler tells AI agents what tools are available.
    // The call-tool handler executes the actual tool logic.

    // Handler for listing available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_mson_model',
            description: 'Create a new MSON model with entities and relationships',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of the model',
                },
                type: {
                  type: 'string',
                  enum: ['class', 'component', 'deployment', 'usecase'],
                  description: 'Type of model to create',
                },
                description: {
                  type: 'string',
                  description: 'Optional description of the model',
                },
                entities: {
                  type: 'array',
                  description: 'Array of entities in the model',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      type: {
                        type: 'string',
                        enum: ['class', 'interface', 'enum', 'component', 'actor'],
                      },
                      stereotype: { type: 'string' },
                      namespace: { type: 'string' },
                      attributes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            type: { type: 'string' },
                            visibility: {
                              type: 'string',
                              enum: ['public', 'private', 'protected'],
                            },
                            isStatic: { type: 'boolean' },
                            isReadOnly: { type: 'boolean' },
                          },
                        },
                      },
                      methods: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            parameters: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  name: { type: 'string' },
                                  type: { type: 'string' },
                                },
                              },
                            },
                            returnType: { type: 'string' },
                            visibility: {
                              type: 'string',
                              enum: ['public', 'private', 'protected'],
                            },
                            isStatic: { type: 'boolean' },
                            isAbstract: { type: 'boolean' },
                          },
                        },
                      },
                    },
                    required: ['id', 'name', 'type'],
                  },
                },
                relationships: {
                  type: 'array',
                  description: 'Array of relationships between entities',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      from: { type: 'string' },
                      to: { type: 'string' },
                      type: {
                        type: 'string',
                        enum: [
                          'association',
                          'inheritance',
                          'implementation',
                          'dependency',
                          'aggregation',
                          'composition',
                        ],
                      },
                      multiplicity: {
                        type: 'object',
                        properties: {
                          from: { type: 'string' },
                          to: { type: 'string' },
                        },
                      },
                      name: { type: 'string' },
                    },
                    required: ['id', 'from', 'to', 'type'],
                  },
                },
              },
              required: ['name', 'type', 'entities'],
            },
          },
          {
            name: 'validate_mson_model',
            description: 'Validate an existing MSON model for correctness and completeness',
            inputSchema: {
              type: 'object',
              properties: {
                model: {
                  type: 'object',
                  description: 'The MSON model to validate',
                },
              },
              required: ['model'],
            },
          },
          {
            name: 'generate_uml_diagram',
            description: 'Generate UML diagram markup from an MSON model',
            inputSchema: {
              type: 'object',
              properties: {
                model: {
                  type: 'object',
                  description: 'The MSON model to generate UML from',
                },
                format: {
                  type: 'string',
                  enum: ['plantuml', 'mermaid', 'svg'],
                  description: 'Format for the UML diagram output',
                },
              },
              required: ['model'],
            },
          },
          {
            name: 'export_to_system_designer',
            description: 'Export MSON model to System Designer application format',
            inputSchema: {
              type: 'object',
              properties: {
                model: {
                  type: 'object',
                  description: 'The MSON model to export',
                },
                filePath: {
                  type: 'string',
                  description: 'Optional file path to save the exported file',
                },
              },
              required: ['model'],
            },
          },
        ],
      };
    });

    // Handler for executing tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_mson_model':
            return this.handleCreateMsonModel(args);

          case 'validate_mson_model':
            return this.handleValidateMsonModel(args);

          case 'generate_uml_diagram':
            return this.handleGenerateUmlDiagram(args);

          case 'export_to_system_designer':
            return this.handleExportToSystemDesigner(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleCreateMsonModel(args: any): Promise<any> {
    // Validate input using Zod schema
    const validationResult = MsonModelSchema.safeParse(args);

    if (!validationResult.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Validation Error: ${validationResult.error.message}`,
          },
        ],
        isError: true,
      };
    }

    const model: MsonModel = validationResult.data;

    // Generate unique IDs if not provided
    const finalModel: MsonModel = {
      ...model,
      id: model.id || `model_${Date.now()}`,
      entities: model.entities.map((entity) => ({
        ...entity,
        id: entity.id || `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })),
      relationships: model.relationships.map((relationship) => ({
        ...relationship,
        id: relationship.id || `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })),
    };

    return {
      content: [
        {
          type: 'text',
          text: `MSON Model Created Successfully:

Name: ${finalModel.name}
Type: ${finalModel.type}
Description: ${finalModel.description || 'No description'}

Entities: ${finalModel.entities.length}
Relationships: ${finalModel.relationships.length}

Model ID: ${finalModel.id}

You can now use this model with:
- validate_mson_model: to check for correctness
- generate_uml_diagram: to create UML diagrams
- export_to_system_designer: to save to System Designer format`,
        },
        {
          type: 'json',
          json: finalModel,
        },
      ],
    };
  }

  private async handleValidateMsonModel(args: any): Promise<any> {
    const { model } = args;

    // Validate using Zod schema
    const validationResult = MsonModelSchema.safeParse(model);

    if (!validationResult.success) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Model Validation Failed:

Errors: ${validationResult.error.message}

Please check your model structure and try again.`,
          },
        ],
        isError: true,
      };
    }

    const validatedModel: MsonModel = validationResult.data;

    // Perform additional business logic validation
    const warnings: string[] = [];
    const entityIds = new Set(validatedModel.entities.map((e) => e.id));

    // Check for orphaned relationships
    for (const relationship of validatedModel.relationships) {
      if (!entityIds.has(relationship.from)) {
        warnings.push(
          `Relationship '${relationship.id}' references non-existent 'from' entity: ${relationship.from}`
        );
      }
      if (!entityIds.has(relationship.to)) {
        warnings.push(
          `Relationship '${relationship.id}' references non-existent 'to' entity: ${relationship.to}`
        );
      }
    }

    // Check for duplicate entity names
    const entityNames = new Set<string>();
    for (const entity of validatedModel.entities) {
      if (entityNames.has(entity.name)) {
        warnings.push(`Duplicate entity name detected: ${entity.name}`);
      }
      entityNames.add(entity.name);
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Model Validation Successful!

Model: ${validatedModel.name}
Type: ${validatedModel.type}
Entities: ${validatedModel.entities.length}
Relationships: ${validatedModel.relationships.length}

${
  warnings.length > 0
    ? `⚠️ Warnings (${warnings.length}):
${warnings.map((w) => `- ${w}`).join('\n')}`
    : 'No warnings detected.'
}

Model is ready for UML generation and export.`,
        },
      ],
    };
  }

  private async handleGenerateUmlDiagram(args: any): Promise<any> {
    const { model, format = 'plantuml' } = args;

    // First validate the model
    const validationResult = MsonModelSchema.safeParse(model);
    if (!validationResult.success) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Cannot generate UML: Invalid model format
Error: ${validationResult.error.message}`,
          },
        ],
        isError: true,
      };
    }

    const validatedModel: MsonModel = validationResult.data;

    let umlOutput: string;

    if (format === 'plantuml') {
      umlOutput = this.generatePlantUML(validatedModel);
    } else if (format === 'mermaid') {
      umlOutput = this.generateMermaid(validatedModel);
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Unsupported format: ${format}. Supported formats: plantuml, mermaid`,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `🎨 UML Diagram Generated (${format.toUpperCase()}):

Model: ${validatedModel.name}
Format: ${format}

Copy the markup below into your preferred UML tool:

---
${umlOutput}
---`,
        },
      ],
    };
  }

  private generatePlantUML(model: MsonModel): string {
    let uml = '@startuml\n';
    uml += `title ${model.name}\n`;

    if (model.description) {
      uml += `note top of ${model.entities[0]?.name || 'FirstEntity'}\n`;
      uml += `${model.description}\n`;
      uml += 'end note\n';
    }

    // Add entities
    for (const entity of model.entities) {
      uml += `${entity.type === 'interface' ? 'interface' : entity.type === 'enum' ? 'enum' : 'class'} ${entity.name} {\n`;

      // Add attributes
      for (const attr of entity.attributes) {
        const visibility =
          attr.visibility === 'private' ? '-' : attr.visibility === 'protected' ? '#' : '+';
        const staticStr = attr.isStatic ? '{static} ' : '';
        const readOnlyStr = attr.isReadOnly ? '{readOnly} ' : '';
        uml += `  ${visibility}${staticStr}${readOnlyStr}${attr.name}: ${attr.type}\n`;
      }

      // Add methods
      for (const method of entity.methods) {
        const visibility =
          method.visibility === 'private' ? '-' : method.visibility === 'protected' ? '#' : '+';
        const staticStr = method.isStatic ? '{static} ' : '';
        const abstractStr = method.isAbstract ? '{abstract} ' : '';
        const params = method.parameters.map((p) => `${p.name}: ${p.type}`).join(', ');
        uml += `  ${visibility}${staticStr}${abstractStr}${method.name}(${params}): ${method.returnType}\n`;
      }

      uml += '}\n';
    }

    // Add relationships
    for (const rel of model.relationships) {
      let relStr = '';
      switch (rel.type) {
        case 'inheritance':
          relStr = '<|--';
          break;
        case 'implementation':
          relStr = '<|..';
          break;
        case 'association':
          relStr = '-->';
          break;
        case 'dependency':
          relStr = '..>';
          break;
        case 'aggregation':
          relStr = 'o-->';
          break;
        case 'composition':
          relStr = '*-->';
          break;
      }

      const fromMultiplicity = rel.multiplicity?.from ? `"${rel.multiplicity.from}"` : '';
      const toMultiplicity = rel.multiplicity?.to ? `"${rel.multiplicity.to}"` : '';
      const relName = rel.name ? `: ${rel.name}` : '';

      uml += `${model.entities.find((e) => e.id === rel.from)?.name} ${fromMultiplicity} ${relStr} ${toMultiplicity} ${model.entities.find((e) => e.id === rel.to)?.name} ${relName}\n`;
    }

    uml += '@enduml';
    return uml;
  }

  private generateMermaid(model: MsonModel): string {
    let mermaid = 'classDiagram\n';
    mermaid += `title ${model.name}\n`;

    // Add entities
    for (const entity of model.entities) {
      const classType =
        entity.type === 'interface' ? 'interface' : entity.type === 'enum' ? 'enum' : 'class';
      mermaid += `${classType} ${entity.name} {\n`;

      // Add attributes
      for (const attr of entity.attributes) {
        const visibility =
          attr.visibility === 'private' ? '-' : attr.visibility === 'protected' ? '#' : '+';
        const staticStr = attr.isStatic ? '*' : '';
        const readOnlyStr = attr.isReadOnly ? '?' : '';
        mermaid += `    ${visibility}${staticStr}${readOnlyStr}${attr.name}${attr.type ? ': ' + attr.type : ''}\n`;
      }

      // Add methods
      for (const method of entity.methods) {
        const visibility =
          method.visibility === 'private' ? '-' : method.visibility === 'protected' ? '#' : '+';
        const staticStr = method.isStatic ? '*' : '';
        const abstractStr = method.isAbstract ? '*' : '';
        const params = method.parameters
          .map((p) => `${p.name}${p.type ? ': ' + p.type : ''}`)
          .join(', ');
        mermaid += `    ${visibility}${staticStr}${abstractStr}${method.name}(${params})${method.returnType ? ': ' + method.returnType : ''}\n`;
      }

      mermaid += '}\n';
    }

    // Add relationships
    for (const rel of model.relationships) {
      let relStr = '';
      switch (rel.type) {
        case 'inheritance':
          relStr = '<|--';
          break;
        case 'implementation':
          relStr = '<|..';
          break;
        case 'association':
          relStr = '-->';
          break;
        case 'dependency':
          relStr = '..>';
          break;
        case 'aggregation':
          relStr = 'o-->';
          break;
        case 'composition':
          relStr = '*-->';
          break;
      }

      const fromName = model.entities.find((e) => e.id === rel.from)?.name;
      const toName = model.entities.find((e) => e.id === rel.to)?.name;
      const relName = rel.name ? `: ${rel.name}` : '';

      if (fromName && toName) {
        mermaid += `${fromName} ${relStr} ${toName} ${relName}\n`;
      }
    }

    return mermaid;
  }

  private async handleExportToSystemDesigner(args: any): Promise<any> {
    const { model, filePath } = args;

    // Validate the model first
    const validationResult = MsonModelSchema.safeParse(model);
    if (!validationResult.success) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Cannot export: Invalid model format
Error: ${validationResult.error.message}`,
          },
        ],
        isError: true,
      };
    }

    const validatedModel: MsonModel = validationResult.data;

    // Convert to System Designer format (JSON-based)
    const systemDesignerFormat = {
      version: '1.0',
      type: 'system_designer_model',
      metadata: {
        name: validatedModel.name,
        modelType: validatedModel.type,
        description: validatedModel.description || '',
        createdAt: new Date().toISOString(),
        exportedBy: 'system-designer-mcp',
      },
      model: validatedModel,
    };

    const fileName =
      filePath || `${validatedModel.name.replace(/[^a-zA-Z0-9]/g, '_')}_system_designer.json`;

    try {
      await Bun.write(fileName, JSON.stringify(systemDesignerFormat, null, 2));

      return {
        content: [
          {
            type: 'text',
            text: `✅ Successfully exported to System Designer format!

File: ${fileName}
Model: ${validatedModel.name}
Type: ${validatedModel.type}
Entities: ${validatedModel.entities.length}
Relationships: ${validatedModel.relationships.length}

You can now import this file into System Designer or other compatible UML tools.

File saved at: ${fileName}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  async run(): Promise<void> {
    // WHY: This starts the server using stdio transport, which is the standard
    // way MCP servers communicate with AI agents. It's like starting a web server,
    // but for AI tool communication instead of HTTP requests.

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('System Designer MCP Server running on stdio');
  }
}

// WHY: This is the main entry point. It creates our server instance and starts it.
// The try-catch block ensures we handle any startup errors gracefully.
async function main() {
  const mcpServer = new SystemDesignerMCPServer();

  try {
    await mcpServer.run();
  } catch (error) {
    console.error('Failed to start MCP Server:', error);
    process.exit(1);
  }
}

// Export the class so it can be used in tests
export { SystemDesignerMCPServer };

main();
