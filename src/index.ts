import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { writeFile } from 'fs-extra';
import { randomUUID } from 'node:crypto'; // Keep for Node.js compatibility in local version

import { MsonModelSchema, CreateMsonModelInputSchema } from './schemas.js';
import { setupTools } from './tools.js';
import { msonToSystemRuntimeBundle } from './transformers/system-runtime.js';
import type { MsonModel, ValidationWarning } from './types.js';
import type { z } from 'zod';
import { validateSystemRuntimeBundle } from './validators/system-runtime.js';

// ============================================================================
// MAIN SERVER CLASS
// ============================================================================

class SystemDesignerMCPServer {
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

  // Tool handler methods
  private async handleCreateMsonModel(args: unknown): Promise<any> {
    const validationResult = CreateMsonModelInputSchema.safeParse(args);
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

  private async handleValidateMsonModel(args: unknown): Promise<any> {
    const { model } = args as { model: unknown };
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

  private async handleGenerateUmlDiagram(args: unknown): Promise<any> {
    const { model, format = 'plantuml' } = args as {
      model: unknown;
      format?: 'plantuml' | 'mermaid';
    };
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

  private async handleExportToSystemDesigner(args: unknown): Promise<any> {
    const { model, filePath } = args as { model: unknown; filePath?: string };
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

  private async handleCreateSystemRuntimeBundle(args: unknown): Promise<any> {
    const { model, version } = args as { model: unknown; version?: string };

    // Validate MSON model
    const validationResult = MsonModelSchema.safeParse(model);
    if (!validationResult.success) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Invalid MSON model: ${validationResult.error.message}`,
          },
        ],
        isError: true,
      };
    }

    try {
      // Transform to System Runtime bundle
      const bundle = msonToSystemRuntimeBundle(validationResult.data, version);

      // Validate the generated bundle
      const bundleValidation = validateSystemRuntimeBundle(bundle);

      if (!bundleValidation.isValid) {
        const errors = bundleValidation.warnings.filter((w) => w.severity === 'error');
        return {
          content: [
            {
              type: 'text',
              text: `❌ Bundle validation failed:\n${errors.map((e) => `  - ${e.message}`).join('\n')}`,
            },
          ],
          isError: true,
        };
      }

      const warnings = bundleValidation.warnings.filter((w) => w.severity === 'warning');
      const warningText =
        warnings.length > 0
          ? `\n\n⚠️  Warnings:\n${warnings.map((w) => `  - ${w.message}`).join('\n')}`
          : '';

      const successMessage = `✅ System Runtime Bundle Created Successfully:

Name: ${bundle.name}
Version: ${bundle.version}
Description: ${bundle.description}

Bundle Structure:
- Schemas: ${Object.keys(bundle.schemas).length}
- Models: ${Object.keys(bundle.models).length}
- Types: ${Object.keys(bundle.types).length}
- Behaviors: ${Object.keys(bundle.behaviors).length}
- Component Types: ${Object.keys(bundle.components).length}${warningText}`;

      return {
        content: [
          { type: 'text', text: successMessage },
          { type: 'text', text: '\n\nSystem Runtime Bundle (JSON):' },
          { type: 'text', text: JSON.stringify(bundle, null, 2) },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Bundle creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleValidateSystemRuntimeBundle(args: unknown): Promise<any> {
    const { bundle } = args as { bundle: unknown };

    try {
      const validation = validateSystemRuntimeBundle(bundle);

      const errors = validation.warnings.filter((w) => w.severity === 'error');
      const warnings = validation.warnings.filter((w) => w.severity === 'warning');

      if (!validation.isValid) {
        const errorMessage = `❌ Bundle Validation Failed:

Errors (${errors.length}):
${errors.map((e) => `  - ${e.message}`).join('\n')}

${warnings.length > 0 ? `Warnings (${warnings.length}):\n${warnings.map((w) => `  - ${w.message}`).join('\n')}` : ''}`;

        return {
          content: [{ type: 'text', text: errorMessage }],
          isError: true,
        };
      }

      const successMessage = `✅ System Runtime Bundle is Valid!

Bundle: ${validation.bundle?.name || 'Unknown'}
Version: ${validation.bundle?.version || 'Unknown'}

${warnings.length > 0 ? `⚠️  Warnings (${warnings.length}):\n${warnings.map((w) => `  - ${w.message}`).join('\n')}` : 'No warnings detected.'}`;

      return {
        content: [{ type: 'text', text: successMessage }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  private ensureUniqueIds(model: z.infer<typeof CreateMsonModelInputSchema>): MsonModel {
    return {
      id: model.id || `model_${Date.now()}`,
      name: model.name,
      type: model.type,
      description: model.description,
      entities: model.entities.map((entity) => ({
        id: entity.id || `entity_${randomUUID()}`,
        name: entity.name,
        type: entity.type,
        description: entity.description,
        attributes: entity.attributes || [],
        methods: entity.methods || [],
        stereotype: entity.stereotype,
        namespace: entity.namespace,
      })),
      relationships: model.relationships.map((relationship) => ({
        id: relationship.id || `rel_${randomUUID()}`,
        from: relationship.from,
        to: relationship.to,
        type: relationship.type,
        multiplicity: relationship.multiplicity,
        name: relationship.name,
        description: relationship.description,
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
        mermaid += `    ${visibility}${staticStr}${readOnlyStr}${attr.name}${attr.type ? `: ${attr.type}` : ''}\n`;
      }

      for (const method of entity.methods) {
        const visibility = this.visibilityToMermaid(method.visibility);
        const staticStr = method.isStatic ? '*' : '';
        const abstractStr = method.isAbstract ? '*' : '';
        const params = method.parameters
          .map((p) => `${p.name}${p.type ? `: ${p.type}` : ''}`)
          .join(', ');
        mermaid += `    ${visibility}${staticStr}${abstractStr}${method.name}(${params})${method.returnType ? `: ${method.returnType}` : ''}\n`;
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
