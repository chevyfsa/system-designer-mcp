/**
 * MCP Tool Definitions for System Designer MCP Server
 * This module contains all tool registration logic using modern MCP SDK patterns.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  CreateMsonModelInputSchema,
  CreateSystemRuntimeBundleInputSchema,
  ExportToSystemDesignerInputSchema,
  GenerateUmlDiagramInputSchema,
  ValidateMsonModelInputSchema,
  ValidateSystemRuntimeBundleInputSchema,
} from './schemas.js';

/**
 * Tool handler interface - defines the signature for tool handler methods
 * Uses Zod-inferred types for type safety
 */
export interface ToolHandlers {
  handleCreateMsonModel: (
    params: z.infer<typeof CreateMsonModelInputSchema>
  ) => Promise<{ content: Array<{ type: string; text?: string; json?: any }>; isError?: boolean }>;
  handleValidateMsonModel: (
    params: z.infer<typeof ValidateMsonModelInputSchema>
  ) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>;
  handleGenerateUmlDiagram: (
    params: z.infer<typeof GenerateUmlDiagramInputSchema>
  ) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>;
  handleExportToSystemDesigner: (
    params: z.infer<typeof ExportToSystemDesignerInputSchema>
  ) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>;
  handleCreateSystemRuntimeBundle: (
    params: z.infer<typeof CreateSystemRuntimeBundleInputSchema>
  ) => Promise<{ content: Array<{ type: string; text?: string; json?: any }>; isError?: boolean }>;
  handleValidateSystemRuntimeBundle: (
    params: z.infer<typeof ValidateSystemRuntimeBundleInputSchema>
  ) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>;
}

/**
 * Registers all MCP tools on the provided server instance
 * @param server - The MCP server instance to register tools on
 * @param handlers - Object containing all tool handler methods
 */
export function setupTools(server: McpServer, handlers: ToolHandlers): void {
  // Tool: Create MSON Model
  server.registerTool(
    'create_mson_model',
    {
      title: 'Create MSON Model',
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
    async (params) => handlers.handleCreateMsonModel(params)
  );

  // Tool: Validate MSON Model
  server.registerTool(
    'validate_mson_model',
    {
      title: 'Validate MSON Model',
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
    async (params) => handlers.handleValidateMsonModel(params)
  );

  // Tool: Generate UML Diagram
  server.registerTool(
    'generate_uml_diagram',
    {
      title: 'Generate UML Diagram',
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
    async (params) => handlers.handleGenerateUmlDiagram(params)
  );

  // Tool: Export to System Designer
  server.registerTool(
    'export_to_system_designer',
    {
      title: 'Export to System Designer',
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
    async (params) => handlers.handleExportToSystemDesigner(params)
  );

  // Tool: Create System Runtime Bundle
  server.registerTool(
    'create_system_runtime_bundle',
    {
      title: 'Create System Runtime Bundle',
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
    async (params) => handlers.handleCreateSystemRuntimeBundle(params)
  );

  // Tool: Validate System Runtime Bundle
  server.registerTool(
    'validate_system_runtime_bundle',
    {
      title: 'Validate System Runtime Bundle',
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
    async (params) => handlers.handleValidateSystemRuntimeBundle(params)
  );
}
