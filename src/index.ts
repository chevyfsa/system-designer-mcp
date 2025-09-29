import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SystemDesignerIntegration } from './integration/system-designer.js';
import { z } from 'zod';
import { writeFile } from 'fs-extra';
import { randomUUID } from 'crypto';

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

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

// Type exports
export type MsonAttribute = z.infer<typeof MsonAttributeSchema>;
export type MsonParameter = z.infer<typeof MsonParameterSchema>;
export type MsonMethod = z.infer<typeof MsonMethodSchema>;
export type MsonEntity = z.infer<typeof MsonEntitySchema>;
export type MsonMultiplicity = z.infer<typeof MsonMultiplicitySchema>;
export type MsonRelationship = z.infer<typeof MsonRelationshipSchema>;
export type MsonModel = z.infer<typeof MsonModelSchema>;

interface ValidationWarning {
  message: string;
  severity: 'warning' | 'error';
}

// ============================================================================
// MAIN SERVER CLASS
// ============================================================================

class SystemDesignerMCPServer {
  private readonly server: McpServer;
  private readonly systemDesigner: SystemDesignerIntegration;

  constructor() {
    this.server = new McpServer({
      name: 'system-designer-mcp',
      version: '1.0.0',
    });

    this.systemDesigner = new SystemDesignerIntegration();
    this.setupTools();
  }

  // Tool handler methods
  private async handleCreateMsonModel(args: any): Promise<any> {
    const validationResult = MsonModelSchema.safeParse(args);
    if (!validationResult.success) {
      return {
        content: [{ type: 'text', text: `Validation Error: ${validationResult.error.message}` }],
        isError: true,
      };
    }

    const model = this.ensureUniqueIds(validationResult.data);
    const warnings = this.validateBusinessLogic(model);

    const successMessage = `MSON Model Created Successfully:

Name: ${model.name}
Type: ${model.type}
Description: ${model.description || 'No description'}

Entities: ${model.entities.length}
Relationships: ${model.relationships.length}

Model ID: ${model.id}

${warnings.length > 0 ? `⚠️ Warnings:\n${warnings.map((w) => `- ${w.message}`).join('\n')}` : 'No warnings detected.'}

You can now use this model with other tools.`;

    return {
      content: [
        { type: 'text', text: successMessage },
        { type: 'json', json: model },
      ],
    };
  }

  private async handleValidateMsonModel(args: any): Promise<any> {
    const { model } = args;
    const validationResult = MsonModelSchema.safeParse(model);
    if (!validationResult.success) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Model Validation Failed:\n\nErrors: ${validationResult.error}`,
          },
        ],
        isError: true,
      };
    }

    const validatedModel = validationResult.data;
    const warnings = this.validateBusinessLogic(validatedModel);

    const successMessage = `✅ Model Validation Successful!

Model: ${validatedModel.name}
Type: ${validatedModel.type}
Entities: ${validatedModel.entities.length}
Relationships: ${validatedModel.relationships.length}

${warnings.length > 0 ? `⚠️ Warnings (${warnings.length}):\n${warnings.map((w) => `- ${w.message}`).join('\n')}` : 'No warnings detected.'}

Model is ready for UML generation and export.`;

    return { content: [{ type: 'text', text: successMessage }] };
  }

  private async handleGenerateUmlDiagram(args: any): Promise<any> {
    const { model, format = 'plantuml' } = args;
    const validationResult = MsonModelSchema.safeParse(model);
    if (!validationResult.success) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Cannot generate UML: Invalid model format\nError: ${validationResult.error}`,
          },
        ],
        isError: true,
      };
    }

    // Validate format
    if (format !== 'plantuml' && format !== 'mermaid') {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Unsupported format: ${format}`,
          },
        ],
        isError: true,
      };
    }

    const validatedModel = validationResult.data;
    const umlOutput =
      format === 'plantuml'
        ? this.generatePlantUML(validatedModel)
        : this.generateMermaid(validatedModel);

    const successMessage = `🎨 UML Diagram Generated (${format.toUpperCase()}):

Model: ${validatedModel.name}
Format: ${format}

Copy the markup below into your preferred UML tool:

---
${umlOutput}
---`;

    return { content: [{ type: 'text', text: successMessage }] };
  }

  private async handleExportToSystemDesigner(args: any): Promise<any> {
    const { model, filePath } = args;
    const validationResult = MsonModelSchema.safeParse(model);
    if (!validationResult.success) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Cannot export: Invalid model format\nError: ${validationResult.error}`,
          },
        ],
        isError: true,
      };
    }

    const validatedModel = validationResult.data;
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
      filePath || `${this.sanitizeFilename(validatedModel.name)}_system_designer.json`;

    try {
      await writeFile(fileName, JSON.stringify(systemDesignerFormat, null, 2));

      const successMessage = `✅ Successfully exported to System Designer format!

File: ${fileName}
Model: ${validatedModel.name}
Type: ${validatedModel.type}
Entities: ${validatedModel.entities.length}
Relationships: ${validatedModel.relationships.length}

You can now import this file into System Designer or other compatible UML tools.

File saved at: ${fileName}`;

      return { content: [{ type: 'text', text: successMessage }] };
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

  private setupTools(): void {
    // Tool: Create MSON Model
    this.server.tool(
      'create_mson_model',
      'Create and validate MSON models from structured data',
      {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the model',
          },
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
            description: 'List of entities in the model',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Unique identifier for the entity',
                },
                name: {
                  type: 'string',
                  description: 'Name of the entity',
                },
                type: {
                  type: 'string',
                  enum: ['class', 'interface', 'enum', 'component', 'actor'],
                  description: 'Type of the entity',
                },
                stereotype: {
                  type: 'string',
                  description: 'Optional stereotype for the entity',
                },
                namespace: {
                  type: 'string',
                  description: 'Optional namespace for the entity',
                },
                attributes: {
                  type: 'array',
                  description: 'List of attributes for the entity',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: 'Name of the attribute',
                      },
                      type: {
                        type: 'string',
                        description: 'Type of the attribute',
                      },
                      visibility: {
                        type: 'string',
                        enum: ['public', 'private', 'protected'],
                        default: 'public',
                        description: 'Visibility of the attribute',
                      },
                      isStatic: {
                        type: 'boolean',
                        default: false,
                        description: 'Whether the attribute is static',
                      },
                      isReadOnly: {
                        type: 'boolean',
                        default: false,
                        description: 'Whether the attribute is read-only',
                      },
                    },
                    required: ['name', 'type'],
                  },
                },
                methods: {
                  type: 'array',
                  description: 'List of methods for the entity',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: 'Name of the method',
                      },
                      parameters: {
                        type: 'array',
                        description: 'List of parameters for the method',
                        items: {
                          type: 'object',
                          properties: {
                            name: {
                              type: 'string',
                              description: 'Name of the parameter',
                            },
                            type: {
                              type: 'string',
                              description: 'Type of the parameter',
                            },
                          },
                          required: ['name', 'type'],
                        },
                      },
                      returnType: {
                        type: 'string',
                        default: 'void',
                        description: 'Return type of the method',
                      },
                      visibility: {
                        type: 'string',
                        enum: ['public', 'private', 'protected'],
                        default: 'public',
                        description: 'Visibility of the method',
                      },
                      isStatic: {
                        type: 'boolean',
                        default: false,
                        description: 'Whether the method is static',
                      },
                      isAbstract: {
                        type: 'boolean',
                        default: false,
                        description: 'Whether the method is abstract',
                      },
                    },
                    required: ['name'],
                  },
                },
              },
              required: ['id', 'name', 'type'],
            },
          },
        },
        relationships: {
          type: 'array',
          description: 'List of relationships between entities',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Unique identifier for the relationship',
              },
              from: {
                type: 'string',
                description: 'ID of the source entity',
              },
              to: {
                type: 'string',
                description: 'ID of the target entity',
              },
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
                description: 'Type of relationship',
              },
              multiplicity: {
                type: 'object',
                properties: {
                  from: {
                    type: 'string',
                    description: 'Multiplicity from source entity',
                  },
                  to: {
                    type: 'string',
                    description: 'Multiplicity to target entity',
                  },
                },
              },
              name: {
                type: 'string',
                description: 'Optional name for the relationship',
              },
            },
            required: ['id', 'from', 'to', 'type'],
          },
        },
        required: ['name', 'type'],
        additionalProperties: false,
      },
      (args) => this.handleCreateMsonModel(args)
    );

    // Tool: Validate MSON Model
    this.server.tool(
      'validate_mson_model',
      'Validate MSON model consistency and completeness',
      {
        type: 'object',
        properties: {
          model: {
            type: 'object',
            description: 'The MSON model to validate',
          },
        },
        required: ['model'],
        additionalProperties: false,
      },
      (args) => this.handleValidateMsonModel(args)
    );

    // Tool: Generate UML Diagram
    this.server.tool(
      'generate_uml_diagram',
      'Generate UML diagrams in PlantUML and Mermaid formats',
      {
        type: 'object',
        properties: {
          model: {
            type: 'object',
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
        additionalProperties: false,
      },
      (args) => this.handleGenerateUmlDiagram(args)
    );

    // Tool: Export to System Designer
    this.server.tool(
      'export_to_system_designer',
      'Export models to System Designer application format',
      {
        type: 'object',
        properties: {
          model: {
            type: 'object',
            description: 'The MSON model to export',
          },
          filePath: {
            type: 'string',
            description: 'Optional file path for the exported file',
          },
        },
        required: ['model'],
        additionalProperties: false,
      },
      (args) => this.handleExportToSystemDesigner(args)
    );
  }

  private ensureUniqueIds(model: MsonModel): MsonModel {
    return {
      ...model,
      id: model.id || `model_${Date.now()}`,
      entities: model.entities.map((entity) => ({
        ...entity,
        id: entity.id || `entity_${randomUUID()}`,
      })),
      relationships: model.relationships.map((relationship) => ({
        ...relationship,
        id: relationship.id || `rel_${randomUUID()}`,
      })),
    };
  }

  private validateBusinessLogic(model: MsonModel): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    const entityIds = new Set(model.entities.map((e) => e.id));

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

  private visibilityToPlantUML(visibility: string): string {
    switch (visibility) {
      case 'private':
        return '-';
      case 'protected':
        return '#';
      default:
        return '+';
    }
  }

  private visibilityToMermaid(visibility: string): string {
    switch (visibility) {
      case 'private':
        return '-';
      case 'protected':
        return '#';
      default:
        return '+';
    }
  }

  private relationshipToPlantUML(type: string): string {
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

  private relationshipToMermaid(type: string): string {
    return this.relationshipToPlantUML(type);
  }

  private generatePlantUML(model: MsonModel): string {
    let uml = '@startuml\n';
    uml += `title ${model.name}\n`;

    if (model.description) {
      uml += `note top of ${model.entities[0]?.name || 'FirstEntity'}\n`;
      uml += `${model.description}\n`;
      uml += 'end note\n';
    }

    for (const entity of model.entities) {
      const entityType =
        entity.type === 'interface' ? 'interface' : entity.type === 'enum' ? 'enum' : 'class';
      uml += `${entityType} ${entity.name} {\n`;

      for (const attr of entity.attributes) {
        const visibility = this.visibilityToPlantUML(attr.visibility);
        const staticStr = attr.isStatic ? '{static} ' : '';
        const readOnlyStr = attr.isReadOnly ? '{readOnly} ' : '';
        uml += `  ${visibility}${staticStr}${readOnlyStr}${attr.name}: ${attr.type}\n`;
      }

      for (const method of entity.methods) {
        const visibility = this.visibilityToPlantUML(method.visibility);
        const staticStr = method.isStatic ? '{static} ' : '';
        const abstractStr = method.isAbstract ? '{abstract} ' : '';
        const params = method.parameters.map((p) => `${p.name}: ${p.type}`).join(', ');
        uml += `  ${visibility}${staticStr}${abstractStr}${method.name}(${params}): ${method.returnType}\n`;
      }

      uml += '}\n';
    }

    for (const rel of model.relationships) {
      const relStr = this.relationshipToPlantUML(rel.type);
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

    for (const entity of model.entities) {
      const classType =
        entity.type === 'interface' ? 'interface' : entity.type === 'enum' ? 'enum' : 'class';
      mermaid += `${classType} ${entity.name} {\n`;

      for (const attr of entity.attributes) {
        const visibility = this.visibilityToMermaid(attr.visibility);
        const staticStr = attr.isStatic ? '*' : '';
        const readOnlyStr = attr.isReadOnly ? '?' : '';
        mermaid += `    ${visibility}${staticStr}${readOnlyStr}${attr.name}${attr.type ? ': ' + attr.type : ''}\n`;
      }

      for (const method of entity.methods) {
        const visibility = this.visibilityToMermaid(method.visibility);
        const staticStr = method.isStatic ? '*' : '';
        const abstractStr = method.isAbstract ? '*' : '';
        const params = method.parameters
          .map((p) => `${p.name}${p.type ? ': ' + p.type : ''}`)
          .join(', ');
        mermaid += `    ${visibility}${staticStr}${abstractStr}${method.name}(${params})${method.returnType ? ': ' + method.returnType : ''}\n`;
      }

      mermaid += '}\n';
    }

    for (const rel of model.relationships) {
      const relStr = this.relationshipToMermaid(rel.type);
      const fromName = model.entities.find((e) => e.id === rel.from)?.name;
      const toName = model.entities.find((e) => e.id === rel.to)?.name;
      const relName = rel.name ? `: ${rel.name}` : '';

      if (fromName && toName) {
        mermaid += `${fromName} ${relStr} ${toName} ${relName}\n`;
      }
    }

    return mermaid;
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9]/g, '_');
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('System Designer MCP Server running on stdio');
  }
}

async function main() {
  const mcpServer = new SystemDesignerMCPServer();

  try {
    await mcpServer.run();
  } catch (error) {
    console.error('Failed to start MCP Server:', error);
    process.exit(1);
  }
}

export { SystemDesignerMCPServer };

main();
