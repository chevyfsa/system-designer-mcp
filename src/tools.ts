/**
 * MCP Tool Definitions for System Designer MCP Server
 * This module contains all tool registration logic using modern MCP SDK patterns.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  CreateMsonModelInputSchema,
  ExportToSystemDesignerInputSchema,
  GenerateUmlDiagramInputSchema,
  ValidateMsonModelInputSchema,
} from './schemas.js';

/**
 * Tool handler interface - defines the signature for tool handler methods
 * Uses Zod-inferred types for type safety
 */
export interface ToolHandlers {
  handleCreateMsonModel: (
    params: z.infer<z.ZodObject<typeof CreateMsonModelInputSchema>>
  ) => Promise<{ content: Array<{ type: string; text?: string; json?: any }>; isError?: boolean }>;
  handleValidateMsonModel: (
    params: z.infer<z.ZodObject<typeof ValidateMsonModelInputSchema>>
  ) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>;
  handleGenerateUmlDiagram: (
    params: z.infer<z.ZodObject<typeof GenerateUmlDiagramInputSchema>>
  ) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>;
  handleExportToSystemDesigner: (
    params: z.infer<z.ZodObject<typeof ExportToSystemDesignerInputSchema>>
  ) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>;
}

/**
 * Registers all MCP tools on the provided server instance
 * @param server - The MCP server instance to register tools on
 * @param handlers - Object containing all tool handler methods
 */
export function setupTools(server: McpServer, handlers: ToolHandlers): void {
  // Tool: Create MSON Model
  // Tool: Create MSON Model
  server.registerTool(
    'create_mson_model',
    {
      title: 'Create MSON Model',
      description: 'Create and validate MSON models from structured data',
      // @ts-expect-error - SDK type constraints are too strict for complex nested schemas
      inputSchema: CreateMsonModelInputSchema,
    },
    // @ts-expect-error - Type inference from Zod schema
    async (params) => handlers.handleCreateMsonModel(params)
  );

  // Tool: Validate MSON Model
  server.registerTool(
    'validate_mson_model',
    {
      title: 'Validate MSON Model',
      description: 'Validate MSON model consistency and completeness',
      // @ts-expect-error - SDK type constraints are too strict for complex nested schemas
      inputSchema: ValidateMsonModelInputSchema,
    },
    // @ts-expect-error - Type inference from Zod schema
    async (params) => handlers.handleValidateMsonModel(params)
  );

  // Tool: Generate UML Diagram
  server.registerTool(
    'generate_uml_diagram',
    {
      title: 'Generate UML Diagram',
      description: 'Generate UML diagrams in PlantUML and Mermaid formats',
      // @ts-expect-error - SDK type constraints are too strict for complex nested schemas
      inputSchema: GenerateUmlDiagramInputSchema,
    },
    // @ts-expect-error - Type inference from Zod schema
    async (params) => handlers.handleGenerateUmlDiagram(params)
  );

  // Tool: Export to System Designer
  server.registerTool(
    'export_to_system_designer',
    {
      title: 'Export to System Designer',
      description: 'Export models to System Designer application format',
      // @ts-expect-error - SDK type constraints are too strict for complex nested schemas
      inputSchema: ExportToSystemDesignerInputSchema,
    },
    // @ts-expect-error - Type inference from Zod schema
    async (params) => handlers.handleExportToSystemDesigner(params)
  );
}
