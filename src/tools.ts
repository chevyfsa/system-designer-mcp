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
        properties: CreateMsonModelInputSchema.shape,
        required: Object.keys(CreateMsonModelInputSchema.shape).filter(
          (key) =>
            !CreateMsonModelInputSchema.shape[
              key as keyof typeof CreateMsonModelInputSchema.shape
            ].isOptional()
        ),
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
        properties: ValidateMsonModelInputSchema.shape,
        required: Object.keys(ValidateMsonModelInputSchema.shape).filter(
          (key) =>
            !ValidateMsonModelInputSchema.shape[
              key as keyof typeof ValidateMsonModelInputSchema.shape
            ].isOptional()
        ),
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
        properties: GenerateUmlDiagramInputSchema.shape,
        required: Object.keys(GenerateUmlDiagramInputSchema.shape).filter(
          (key) =>
            !GenerateUmlDiagramInputSchema.shape[
              key as keyof typeof GenerateUmlDiagramInputSchema.shape
            ].isOptional()
        ),
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
        properties: ExportToSystemDesignerInputSchema.shape,
        required: Object.keys(ExportToSystemDesignerInputSchema.shape).filter(
          (key) =>
            !ExportToSystemDesignerInputSchema.shape[
              key as keyof typeof ExportToSystemDesignerInputSchema.shape
            ].isOptional()
        ),
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
        properties: CreateSystemRuntimeBundleInputSchema.shape,
        required: Object.keys(CreateSystemRuntimeBundleInputSchema.shape).filter(
          (key) =>
            !CreateSystemRuntimeBundleInputSchema.shape[
              key as keyof typeof CreateSystemRuntimeBundleInputSchema.shape
            ].isOptional()
        ),
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
        properties: ValidateSystemRuntimeBundleInputSchema.shape,
        required: Object.keys(ValidateSystemRuntimeBundleInputSchema.shape).filter(
          (key) =>
            !ValidateSystemRuntimeBundleInputSchema.shape[
              key as keyof typeof ValidateSystemRuntimeBundleInputSchema.shape
            ].isOptional()
        ),
      },
    },
    async (params) => handlers.handleValidateSystemRuntimeBundle(params)
  );
}
