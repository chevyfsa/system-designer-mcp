import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

/**
 * MSON (Metamodel JavaScript Object Notation) data type definitions
 * for system modeling and UML diagram generation
 */

const MsonAttributeSchema = z.object({
  name: z.string(),
  type: z.string(),
  visibility: z.enum(['public', 'private', 'protected']).optional().default('public'),
  isStatic: z.boolean().optional().default(false),
  isReadOnly: z.boolean().optional().default(false),
});

const MsonParameterSchema = z.object({
  name: z.string(),
  type: z.string(),
});

const MsonMethodSchema = z.object({
  name: z.string(),
  parameters: z.array(MsonParameterSchema).optional().default([]),
  returnType: z.string().optional().default('void'),
  visibility: z.enum(['public', 'private', 'protected']).optional().default('public'),
  isStatic: z.boolean().optional().default(false),
  isAbstract: z.boolean().optional().default(false),
});

const MsonEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['class', 'interface', 'enum', 'component', 'actor']),
  attributes: z.array(MsonAttributeSchema).optional().default([]),
  methods: z.array(MsonMethodSchema).optional().default([]),
  stereotype: z.string().optional(),
  namespace: z.string().optional(),
});

const MsonMultiplicitySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
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
  multiplicity: MsonMultiplicitySchema.optional(),
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

// Type exports for better TypeScript support
export type MsonAttribute = z.infer<typeof MsonAttributeSchema>;
export type MsonParameter = z.infer<typeof MsonParameterSchema>;
export type MsonMethod = z.infer<typeof MsonMethodSchema>;
export type MsonEntity = z.infer<typeof MsonEntitySchema>;
export type MsonMultiplicity = z.infer<typeof MsonMultiplicitySchema>;
export type MsonRelationship = z.infer<typeof MsonRelationshipSchema>;
export type MsonModel = z.infer<typeof MsonModelSchema>;

// ============================================================================
// UTILITY TYPES AND INTERFACES
// ============================================================================

interface ToolExecutionResult {
  content: Array<{
    type: 'text' | 'json';
    text?: string;
    json?: any;
  }>;
  isError?: boolean;
}

interface ValidationWarning {
  message: string;
  severity: 'warning' | 'error';
}

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

const CREATE_MSON_MODEL_TOOL = {
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
};

const VALIDATE_MSON_MODEL_TOOL = {
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
};

const GENERATE_UML_DIAGRAM_TOOL = {
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
        enum: ['plantuml', 'mermaid'],
        description: 'Format for the UML diagram output',
      },
    },
    required: ['model'],
  },
};

const EXPORT_TO_SYSTEM_DESIGNER_TOOL = {
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
};

const AVAILABLE_TOOLS = [
  CREATE_MSON_MODEL_TOOL,
  VALIDATE_MSON_MODEL_TOOL,
  GENERATE_UML_DIAGRAM_TOOL,
  EXPORT_TO_SYSTEM_DESIGNER_TOOL,
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates MSON model data using Zod schema
 * @param model The model data to validate
 * @returns Validation result with success flag and data or error
 */
function validateMsonModel(
  model: unknown
): { success: true; data: MsonModel } | { success: false; error: string } {
  const validationResult = MsonModelSchema.safeParse(model);

  if (!validationResult.success) {
    return { success: false, error: validationResult.error.message };
  }

  return { success: true, data: validationResult.data };
}

/**
 * Generates unique IDs for model components if not provided
 * @param model The validated MSON model
 * @returns Model with guaranteed unique IDs
 */
function ensureUniqueIds(model: MsonModel): MsonModel {
  return {
    ...model,
    id: model.id || `model_${Date.now()}`,
    entities: model.entities.map((entity) => ({
      ...entity,
      id: entity.id || `entity_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    })),
    relationships: model.relationships.map((relationship) => ({
      ...relationship,
      id: relationship.id || `rel_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    })),
  };
}

/**
 * Performs business logic validation beyond schema validation
 * @param model The validated MSON model
 * @returns Array of validation warnings
 */
function validateBusinessLogic(model: MsonModel): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const entityIds = new Set(model.entities.map((e) => e.id));

  // Check for orphaned relationships
  for (const relationship of model.relationships) {
    if (!entityIds.has(relationship.from)) {
      warnings.push({
        message: `Relationship '${relationship.id}' references non-existent 'from' entity: ${relationship.from}`,
        severity: 'warning',
      });
    }
    if (!entityIds.has(relationship.to)) {
      warnings.push({
        message: `Relationship '${relationship.id}' references non-existent 'to' entity: ${relationship.to}`,
        severity: 'warning',
      });
    }
  }

  // Check for duplicate entity names
  const entityNames = new Set<string>();
  for (const entity of model.entities) {
    if (entityNames.has(entity.name)) {
      warnings.push({
        message: `Duplicate entity name detected: ${entity.name}`,
        severity: 'warning',
      });
    }
    entityNames.add(entity.name);
  }

  return warnings;
}

/**
 * Formats validation warnings for display
 * @param warnings Array of validation warnings
 * @returns Formatted warning text
 */
function formatWarnings(warnings: ValidationWarning[]): string {
  if (warnings.length === 0) {
    return 'No warnings detected.';
  }

  return `⚠️ Warnings (${warnings.length}):\n${warnings.map((w) => `- ${w.message}`).join('\n')}`;
}

/**
 * Creates a standardized error response
 * @param message Error message
 * @param isError Whether this is an error response
 * @returns Formatted error response
 */
function createErrorResponse(message: string, isError = true): ToolExecutionResult {
  return {
    content: [{ type: 'text', text: message }],
    isError,
  };
}

/**
 * Creates a standardized success response
 * @param message Success message
 * @param jsonData Optional JSON data to include
 * @returns Formatted success response
 */
function createSuccessResponse(message: string, jsonData?: any): ToolExecutionResult {
  const content: Array<{ type: 'text' | 'json'; text?: string; json?: any }> = [
    { type: 'text', text: message },
  ];

  if (jsonData) {
    content.push({ type: 'json', json: jsonData });
  }

  return { content };
}

/**
 * Sanitizes filename for safe file system operations
 * @param name Original name
 * @returns Sanitized filename
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

// ============================================================================
// UML GENERATION UTILITIES
// ============================================================================

/**
 * Converts visibility to PlantUML notation
 * @param visibility Visibility level
 * @returns PlantUML visibility symbol
 */
function visibilityToPlantUML(visibility: string): string {
  switch (visibility) {
    case 'private':
      return '-';
    case 'protected':
      return '#';
    default:
      return '+';
  }
}

/**
 * Converts visibility to Mermaid notation
 * @param visibility Visibility level
 * @returns Mermaid visibility symbol
 */
function visibilityToMermaid(visibility: string): string {
  switch (visibility) {
    case 'private':
      return '-';
    case 'protected':
      return '#';
    default:
      return '+';
  }
}

/**
 * Converts relationship type to PlantUML notation
 * @param type Relationship type
 * @returns PlantUML relationship symbol
 */
function relationshipToPlantUML(type: string): string {
  switch (type) {
    case 'inheritance':
      return '<|--';
    case 'implementation':
      return '<|..';
    case 'association':
      return '-->';
    case 'dependency':
      return '..>';
    case 'aggregation':
      return 'o-->';
    case 'composition':
      return '*-->';
    default:
      return '-->';
  }
}

/**
 * Converts relationship type to Mermaid notation
 * @param type Relationship type
 * @returns Mermaid relationship symbol
 */
function relationshipToMermaid(type: string): string {
  switch (type) {
    case 'inheritance':
      return '<|--';
    case 'implementation':
      return '<|..';
    case 'association':
      return '-->';
    case 'dependency':
      return '..>';
    case 'aggregation':
      return 'o-->';
    case 'composition':
      return '*-->';
    default:
      return '-->';
  }
}

// ============================================================================
// MAIN SERVER CLASS
// ============================================================================

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
    // Set up handlers for MCP requests
    this.setupListToolsHandler();
    this.setupCallToolHandler();
  }

  /**
   * Sets up the list-tools handler to advertise available tools
   */
  private setupListToolsHandler(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: AVAILABLE_TOOLS };
    });
  }

  /**
   * Sets up the call-tool handler to execute tool requests
   */
  private setupCallToolHandler(): void {
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
        return createErrorResponse(
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  private async handleCreateMsonModel(args: unknown): Promise<ToolExecutionResult> {
    const validationResult = validateMsonModel(args);

    if (!validationResult.success) {
      return createErrorResponse(`Validation Error: ${validationResult.error}`);
    }

    const finalModel = ensureUniqueIds(validationResult.data);

    const successMessage = `MSON Model Created Successfully:

Name: ${finalModel.name}
Type: ${finalModel.type}
Description: ${finalModel.description || 'No description'}

Entities: ${finalModel.entities.length}
Relationships: ${finalModel.relationships.length}

Model ID: ${finalModel.id}

You can now use this model with:
- validate_mson_model: to check for correctness
- generate_uml_diagram: to create UML diagrams
- export_to_system_designer: to save to System Designer format`;

    return createSuccessResponse(successMessage, finalModel);
  }

  private async handleValidateMsonModel(args: { model?: unknown }): Promise<ToolExecutionResult> {
    const { model } = args;

    if (!model) {
      return createErrorResponse('❌ Model validation failed: No model provided');
    }

    const validationResult = validateMsonModel(model);

    if (!validationResult.success) {
      return createErrorResponse(`❌ Model Validation Failed:

Errors: ${validationResult.error}

Please check your model structure and try again.`);
    }

    const validatedModel = validationResult.data;
    const warnings = validateBusinessLogic(validatedModel);

    const successMessage = `✅ Model Validation Successful!

Model: ${validatedModel.name}
Type: ${validatedModel.type}
Entities: ${validatedModel.entities.length}
Relationships: ${validatedModel.relationships.length}

${formatWarnings(warnings)}

Model is ready for UML generation and export.`;

    return createSuccessResponse(successMessage);
  }

  private async handleGenerateUmlDiagram(args: {
    model?: unknown;
    format?: 'plantuml' | 'mermaid';
  }): Promise<ToolExecutionResult> {
    const { model, format = 'plantuml' } = args;

    if (!model) {
      return createErrorResponse('❌ UML generation failed: No model provided');
    }

    const validationResult = validateMsonModel(model);
    if (!validationResult.success) {
      return createErrorResponse(`❌ Cannot generate UML: Invalid model format
Error: ${validationResult.error}`);
    }

    const validatedModel = validationResult.data;

    let umlOutput: string;

    switch (format) {
      case 'plantuml':
        umlOutput = this.generatePlantUML(validatedModel);
        break;
      case 'mermaid':
        umlOutput = this.generateMermaid(validatedModel);
        break;
      default:
        return createErrorResponse(
          `❌ Unsupported format: ${format}. Supported formats: plantuml, mermaid`
        );
    }

    const successMessage = `🎨 UML Diagram Generated (${format.toUpperCase()}):

Model: ${validatedModel.name}
Format: ${format}

Copy the markup below into your preferred UML tool:

---
${umlOutput}
---`;

    return createSuccessResponse(successMessage);
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
      const entityType =
        entity.type === 'interface' ? 'interface' : entity.type === 'enum' ? 'enum' : 'class';
      uml += `${entityType} ${entity.name} {\n`;

      // Add attributes
      for (const attr of entity.attributes) {
        const visibility = visibilityToPlantUML(attr.visibility);
        const staticStr = attr.isStatic ? '{static} ' : '';
        const readOnlyStr = attr.isReadOnly ? '{readOnly} ' : '';
        uml += `  ${visibility}${staticStr}${readOnlyStr}${attr.name}: ${attr.type}\n`;
      }

      // Add methods
      for (const method of entity.methods) {
        const visibility = visibilityToPlantUML(method.visibility);
        const staticStr = method.isStatic ? '{static} ' : '';
        const abstractStr = method.isAbstract ? '{abstract} ' : '';
        const params = method.parameters.map((p) => `${p.name}: ${p.type}`).join(', ');
        uml += `  ${visibility}${staticStr}${abstractStr}${method.name}(${params}): ${method.returnType}\n`;
      }

      uml += '}\n';
    }

    // Add relationships
    for (const rel of model.relationships) {
      const relStr = relationshipToPlantUML(rel.type);
      const fromMultiplicity = rel.multiplicity?.from ? `"${rel.multiplicity.from}"` : '';
      const toMultiplicity = rel.multiplicity?.to ? `"${rel.multiplicity.to}"` : '';
      const relName = rel.name ? `: ${rel.name}` : '';

      const fromEntity = model.entities.find((e) => e.id === rel.from)?.name;
      const toEntity = model.entities.find((e) => e.id === rel.to)?.name;

      if (fromEntity && toEntity) {
        uml += `${fromEntity} ${fromMultiplicity} ${relStr} ${toMultiplicity} ${toEntity} ${relName}\n`;
      }
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
        const visibility = visibilityToMermaid(attr.visibility);
        const staticStr = attr.isStatic ? '*' : '';
        const readOnlyStr = attr.isReadOnly ? '?' : '';
        mermaid += `    ${visibility}${staticStr}${readOnlyStr}${attr.name}${attr.type ? ': ' + attr.type : ''}\n`;
      }

      // Add methods
      for (const method of entity.methods) {
        const visibility = visibilityToMermaid(method.visibility);
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
      const relStr = relationshipToMermaid(rel.type);
      const fromName = model.entities.find((e) => e.id === rel.from)?.name;
      const toName = model.entities.find((e) => e.id === rel.to)?.name;
      const relName = rel.name ? `: ${rel.name}` : '';

      if (fromName && toName) {
        mermaid += `${fromName} ${relStr} ${toName} ${relName}\n`;
      }
    }

    return mermaid;
  }

  private async handleExportToSystemDesigner(args: {
    model?: unknown;
    filePath?: string;
  }): Promise<ToolExecutionResult> {
    const { model, filePath } = args;

    if (!model) {
      return createErrorResponse('❌ Export failed: No model provided');
    }

    const validationResult = validateMsonModel(model);
    if (!validationResult.success) {
      return createErrorResponse(`❌ Cannot export: Invalid model format
Error: ${validationResult.error}`);
    }

    const validatedModel = validationResult.data;

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

    const fileName = filePath || `${sanitizeFilename(validatedModel.name)}_system_designer.json`;

    try {
      await Bun.write(fileName, JSON.stringify(systemDesignerFormat, null, 2));

      const successMessage = `✅ Successfully exported to System Designer format!

File: ${fileName}
Model: ${validatedModel.name}
Type: ${validatedModel.type}
Entities: ${validatedModel.entities.length}
Relationships: ${validatedModel.relationships.length}

You can now import this file into System Designer or other compatible UML tools.

File saved at: ${fileName}`;

      return createSuccessResponse(successMessage);
    } catch (error) {
      return createErrorResponse(
        `❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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
