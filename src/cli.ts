#!/usr/bin/env node

import { Command } from 'commander';
import { SystemDesignerIntegration } from './integration/system-designer.js';
import * as path from 'path';

enum CliCommand {
  TEST_INTEGRATION = 'test-integration',
  EXPORT_MODEL = 'export-model',
  CONFIG = 'config',
  HELP = 'help',
}

interface CliOptions {
  verbose?: boolean;
}

interface ExportModelOptions extends CliOptions {
  description?: string;
}

class CLI {
  private readonly integration: SystemDesignerIntegration;
  private readonly program: Command;

  constructor() {
    this.integration = new SystemDesignerIntegration();
    this.program = this.setupProgram();
  }

  private setupProgram(): Command {
    const program = new Command()
      .name('system-designer-mcp')
      .description('CLI for System Designer MCP Server integration')
      .version('1.0.0');

    program
      .command(CliCommand.TEST_INTEGRATION)
      .description('Test System Designer integration')
      .option('-v, --verbose', 'Enable verbose output')
      .action(this.testIntegration.bind(this));

    program
      .command(CliCommand.EXPORT_MODEL)
      .description('Export a test MSON model to System Designer')
      .argument('<model-name>', 'Name of the model to export')
      .option('-d, --description <description>', 'Model description', 'Test model created via CLI')
      .option('-v, --verbose', 'Enable verbose output')
      .action(this.exportModel.bind(this));

    program
      .command(CliCommand.CONFIG)
      .description('Show current configuration')
      .action(this.showConfig.bind(this));

    return program;
  }

  private async testIntegration(options: CliOptions): Promise<void> {
    if (options.verbose) {
      console.error('🔍 Testing System Designer integration...\n');
    }

    try {
      const result = await this.integration.testIntegration();

      console.error('📊 Integration Test Results:');
      console.error(
        `✅ System Designer installed: ${result.systemDesignerInstalled ? 'YES' : 'NO'}`
      );
      console.error(`✅ Can access app data: ${result.canAccessAppData ? 'YES' : 'NO'}`);
      console.error(`✅ Can write models: ${result.canWriteModels ? 'YES' : 'NO'}`);

      if (result.errors.length > 0) {
        console.error('\n❌ Issues found:');
        result.errors.forEach((error, index) => {
          console.error(`   ${index + 1}. ${error}`);
        });
        process.exit(1);
      } else {
        console.error('\n🎉 All tests passed! Integration should work correctly.');
      }
    } catch (error) {
      this.handleError('Integration test failed', error);
    }
  }

  private async exportModel(modelName: string, options: ExportModelOptions): Promise<void> {
    if (options.verbose) {
      console.error(`📤 Exporting model '${modelName}' to System Designer...`);
    }

    try {
      const msonModel = this.createTestModel(modelName, options.description);
      const msonContent = JSON.stringify(msonModel, null, 2);

      await this.integration.exportMsonModel(modelName, msonContent);

      const config = this.integration.getConfig();
      console.error(`✅ Model '${modelName}' exported successfully!`);
      console.error(`📁 Location: ${path.join(config.modelsPath, `${modelName}.json`)}`);
      console.error('💡 Note: You may need to refresh System Designer to see the new model.');
    } catch (error) {
      this.handleError('Model export failed', error);
    }
  }

  private createTestModel(modelName: string, description: string): object {
    return {
      name: modelName,
      description,
      types: [
        { name: 'String', primitive: true },
        { name: 'Number', primitive: true },
        { name: 'Boolean', primitive: true },
      ],
      classes: [
        {
          name: modelName,
          properties: [
            { name: 'id', type: 'String', multiplicity: '1' },
            { name: 'name', type: 'String', multiplicity: '1' },
            { name: 'createdAt', type: 'String', multiplicity: '0..1' },
          ],
          methods: [
            { name: 'save', parameters: [], returnType: 'Boolean' },
            { name: 'delete', parameters: [], returnType: 'Boolean' },
          ],
        },
      ],
      relationships: [],
    };
  }

  private showConfig(): void {
    console.error('⚙️  System Designer Integration Configuration:\n');

    const config = this.integration.getConfig();

    console.error('📂 Paths:');
    console.error(`   App Data: ${config.appDataPath}`);
    console.error(`   Models:   ${config.modelsPath}`);
    console.error('');
    console.error('🔧 Settings:');
    console.error(`   Auto Refresh: ${config.autoRefresh ? 'Enabled' : 'Disabled'}`);
    console.error('');
    console.error('💡 Tips:');
    console.error('   - Make sure System Designer is installed in /Applications/');
    console.error('   - The app needs to be run at least once to create directories');
    console.error('   - You may need to manually refresh System Designer after exporting models');
  }

  private handleError(context: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ ${context}: ${errorMessage}`);
    process.exit(1);
  }

  async run(argv: string[] = process.argv): Promise<void> {
    try {
      await this.program.parseAsync(argv);
    } catch (error) {
      this.handleError('CLI execution failed', error);
    }
  }
}

async function main(): Promise<void> {
  const cli = new CLI();
  await cli.run();
}

main();
