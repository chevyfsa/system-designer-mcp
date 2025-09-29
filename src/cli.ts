#!/usr/bin/env node

// WHY: This CLI tool helps us test our MCP server and System Designer integration
// without needing to set up a full MCP client. It's a utility for development
// and testing, making it easier to verify that everything works correctly.

import { SystemDesignerIntegration, IntegrationTestResult } from './integration/system-designer.js';

class CLI {
  private integration: SystemDesignerIntegration;

  constructor() {
    this.integration = new SystemDesignerIntegration();
  }

  async runCommand(args: string[]): Promise<void> {
    const [command, ...commandArgs] = args;

    try {
      switch (command) {
        case 'test-integration':
          await this.testIntegration();
          break;
        case 'export-model':
          await this.exportModel(commandArgs);
          break;
        case 'config':
          this.showConfig();
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  }

  private async testIntegration(): Promise<void> {
    // WHY: This command tests if our System Designer integration works.
    // It checks directory permissions, app installation, and file access.
    console.error('🔍 Testing System Designer integration...\n');

    const result = await this.integration.testIntegration();

    console.error('📊 Integration Test Results:');
    console.error(`✅ System Designer installed: ${result.systemDesignerInstalled ? 'YES' : 'NO'}`);
    console.error(`✅ Can access app data: ${result.canAccessAppData ? 'YES' : 'NO'}`);
    console.error(`✅ Can write models: ${result.canWriteModels ? 'YES' : 'NO'}`);

    if (result.errors.length > 0) {
      console.error('\n❌ Issues found:');
      result.errors.forEach((error, index) => {
        console.error(`   ${index + 1}. ${error}`);
      });
    } else {
      console.error('\n🎉 All tests passed! Integration should work correctly.');
    }
  }

  private async exportModel(args: string[]): Promise<void> {
    // WHY: This command lets us test exporting MSON models to System Designer.
    // It's useful for testing the integration without going through the MCP server.

    const [modelName, ...descriptionParts] = args;

    if (!modelName) {
      console.error('❌ Usage: export-model <model-name> [description]');
      console.error('   Example: export-model User "A user management system"');
      return;
    }

    const description = descriptionParts.join(' ') || 'Test model created via CLI';

    console.error(`📤 Exporting model '${modelName}' to System Designer...`);

    // Create a simple MSON model for testing
    const msonModel = {
      name: modelName,
      description,
      types: [
        {
          name: 'String',
          primitive: true
        },
        {
          name: 'Number',
          primitive: true
        },
        {
          name: 'Boolean',
          primitive: true
        }
      ],
      classes: [
        {
          name: modelName,
          properties: [
            {
              name: 'id',
              type: 'String',
              multiplicity: '1'
            },
            {
              name: 'name',
              type: 'String',
              multiplicity: '1'
            },
            {
              name: 'createdAt',
              type: 'String',
              multiplicity: '0..1'
            }
          ],
          methods: [
            {
              name: 'save',
              parameters: [],
              returnType: 'Boolean'
            },
            {
              name: 'delete',
              parameters: [],
              returnType: 'Boolean'
            }
          ]
        }
      ],
      relationships: []
    };

    const msonContent = JSON.stringify(msonModel, null, 2);

    try {
      await this.integration.exportMsonModel(modelName, msonContent);
      console.error(`✅ Model '${modelName}' exported successfully!`);
      console.error(`📁 Location: ${this.integration.getConfig().modelsPath}/${modelName}.json`);
      console.error('💡 Note: You may need to refresh System Designer to see the new model.');
    } catch (error) {
      console.error(`❌ Failed to export model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private showConfig(): void {
    // WHY: This command shows the current configuration, helping users understand
    // where files are being written and what settings are being used.

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

  private showHelp(): void {
    // WHY: Help text makes the CLI user-friendly and shows what commands are available.

    console.error('🛠️  System Designer MCP Server CLI\n');
    console.error('Usage: bun run src/cli.ts <command> [options]\n');
    console.error('Commands:');
    console.error('   test-integration    Test System Designer integration');
    console.error('   export-model <name> [desc]  Export a test MSON model');
    console.error('   config              Show current configuration');
    console.error('   help                Show this help message\n');
    console.error('Examples:');
    console.error('   bun run src/cli.ts test-integration');
    console.error('   bun run src/cli.ts export-model User "User management system"');
    console.error('   bun run src/cli.ts config');
  }
}

// WHY: This is the entry point for our CLI. It creates the CLI instance
// and runs the command with the provided arguments.
async function main() {
  const cli = new CLI();
  await cli.runCommand(process.argv.slice(2));
}

main();
