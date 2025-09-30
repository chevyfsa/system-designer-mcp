/**
 * Cloudflare Workers Entry Point for System Designer MCP Server
 *
 * This file implements the remote MCP server using SSE (Server-Sent Events) transport
 * for Cloudflare Workers environment. It provides the same MCP tools as the local
 * stdio version but adapted for HTTP-based communication.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MsonModelSchema } from './schemas.js';
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

  getServer(): McpServer {
    return this.server;
  }

  // ============================================================================
  // TOOL HANDLERS (adapted from src/index.ts for Workers environment)
  // ============================================================================

  /**
   * Handler for create_mson_model tool
   */
  async handleCreateMsonModel(args: unknown): Promise<any> {
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

  /**
   * Handler for validate_mson_model tool
   */
  async handleValidateMsonModel(args: unknown): Promise<any> {
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

  /**
   * Handler for generate_uml_diagram tool
   */
  async handleGenerateUmlDiagram(args: unknown): Promise<any> {
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

  /**
   * Handler for export_to_system_designer tool
   * NOTE: In Workers environment, this returns JSON data directly instead of writing files
   */
  async handleExportToSystemDesigner(args: unknown): Promise<any> {
    const { model } = args as { model: unknown };
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

    // In Workers environment, return JSON directly instead of writing to file
    const successMessage = `✅ Successfully exported to System Designer format!

Model: ${validatedModel.name}
Type: ${validatedModel.type}
Entities: ${validatedModel.entities.length}
Relationships: ${validatedModel.relationships.length}

The JSON data is included below. In a remote MCP server environment, you can copy this data
and save it locally, or use it directly with System Designer or other compatible UML tools.`;

    return {
      content: [
        { type: 'text', text: successMessage },
        { type: 'text', text: '\n\nSystem Designer Export (JSON):' },
        { type: 'text', text: JSON.stringify(systemDesignerFormat, null, 2) },
      ],
    };
  }

  /**
   * Handler for create_system_runtime_bundle tool
   */
  async handleCreateSystemRuntimeBundle(args: unknown): Promise<any> {
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

  /**
   * Handler for validate_system_runtime_bundle tool
   */
  async handleValidateSystemRuntimeBundle(args: unknown): Promise<any> {
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

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private ensureUniqueIds(model: MsonModel): MsonModel {
    return {
      ...model,
      id: model.id || `model_${Date.now()}`,
      entities: model.entities.map((entity) => ({
        ...entity,
        id: entity.id || `entity_${crypto.randomUUID()}`, // Using Web Crypto API
      })),
      relationships: model.relationships.map((relationship) => ({
        ...relationship,
        id: relationship.id || `rel_${crypto.randomUUID()}`, // Using Web Crypto API
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
}

// ============================================================================
// CLOUDFLARE WORKERS FETCH HANDLER
// ============================================================================

/**
 * Main Cloudflare Workers fetch handler
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle SSE endpoint (GET request to establish SSE stream)
    if (url.pathname === '/sse' && request.method === 'GET') {
      return handleSSEConnection(request);
    }

    // Handle message endpoint (POST request to send messages)
    if (url.pathname === '/message' && request.method === 'POST') {
      return handleMessage(request);
    }

    // Handle health check
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    // Default response
    return new Response('System Designer MCP Server - Use /sse endpoint for MCP connection', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  },
};

/**
 * Handle SSE connection establishment
 */
async function handleSSEConnection(request: Request): Promise<Response> {
  // Create a new MCP server instance
  const mcpServer = new SystemDesignerMCPServerCore();

  // Create a TransformStream for SSE
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Create SSE transport
  // Note: We'll need to adapt this for Workers environment
  // The SSEServerTransport from the SDK is designed for Node.js
  // We'll create a simplified version for Workers

  // For now, return a basic SSE response
  // Full implementation will be added in the next iteration
  const response = new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });

  // Send initial endpoint event
  const sessionId = crypto.randomUUID();
  await writer.write(encoder.encode(`event: endpoint\ndata: /message?sessionId=${sessionId}\n\n`));

  // Store session (simplified for now)
  // In production, use Durable Objects or KV

  return response;
}

/**
 * Handle incoming POST messages
 */
async function handleMessage(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return new Response('Missing sessionId', { status: 400 });
    }

    // Parse message body
    const body = await request.json();

    // Process MCP message
    // Full implementation will be added in the next iteration

    return new Response('Accepted', { status: 202 });
  } catch (error) {
    return new Response(`Error: ${error}`, { status: 500 });
  }
}
