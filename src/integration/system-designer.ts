import * as path from 'path';
import * as os from 'os';

// WHY: This module handles the integration with the System Designer macOS application.
// Since System Designer is an Electron app, we need to figure out how to communicate
// with it. The most reliable approach is file-based - writing MSON files to where
// System Designer expects to find them.

export interface SystemDesignerConfig {
  appDataPath: string;
  modelsPath: string;
  autoRefresh: boolean;
}

export class SystemDesignerIntegration {
  private config: SystemDesignerConfig;

  constructor(config?: Partial<SystemDesignerConfig>) {
    // WHEN: Creating the integration, we need to set up paths and configuration
    this.config = this.getDefaultConfig(config);
  }

  private getDefaultConfig(overrides?: Partial<SystemDesignerConfig>): SystemDesignerConfig {
    // WHY: We need to determine where System Designer stores its data on macOS.
    // Most macOS apps store data in ~/Library/Application Support/[App Name]/
    const homedir = os.homedir();
    const appDataPath = path.join(homedir, 'Library', 'Application Support', 'System Designer');

    return {
      appDataPath,
      modelsPath: path.join(appDataPath, 'models'),
      autoRefresh: true,
      ...overrides,
    };
  }

  async exportMsonModel(modelName: string, msonContent: string): Promise<void> {
    // WHY: This is the core integration function. It takes an MSON model and
    // writes it to where System Designer can find it. This is how we'll get our
    // AI-generated models into the actual System Designer application.

    try {
      // Ensure the models directory exists
      await this.ensureDirectoryExists(this.config.modelsPath);

      // Write the MSON model to a file
      const modelPath = path.join(this.config.modelsPath, `${modelName}.json`);
      await Bun.write(modelPath, msonContent);

      console.error(`MSON model exported to: ${modelPath}`);

      // If auto-refresh is enabled, try to refresh System Designer
      if (this.config.autoRefresh) {
        await this.tryRefreshApp();
      }
    } catch (error) {
      throw new Error(`Failed to export MSON model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    // WHY: We need to make sure the directory exists before writing files to it.
    // This prevents errors when System Designer hasn't been run yet or the
    // models directory doesn't exist.

    try {
      await Bun.$`mkdir -p "${dirPath}"`;
    } catch (error) {
      // Directory might already exist, which is fine
      if (error instanceof Error && !error.message.includes('already exists')) {
        throw error;
      }
    }
  }

  private async tryRefreshApp(): Promise<void> {
    // WHY: This is where we'd refresh System Designer to show the new model.
    // For now, this is a placeholder. We might use AppleScript or other
    // macOS automation to trigger a refresh.

    console.error('Attempting to refresh System Designer app...');

    // TODO: Implement AppleScript to refresh System Designer
    // For now, we'll just log that we tried
    console.error('Auto-refresh not yet implemented - user may need to manually refresh System Designer');
  }

  async testIntegration(): Promise<IntegrationTestResult> {
    // WHY: This function tests if our integration works. It checks if
    // System Designer is installed and if we can write to its data directory.
    // This helps users troubleshoot integration issues.

    const result: IntegrationTestResult = {
      canAccessAppData: false,
      canWriteModels: false,
      systemDesignerInstalled: false,
      errors: [],
    };

    try {
      // Test if we can access the app data directory
      await this.ensureDirectoryExists(this.config.appDataPath);
      result.canAccessAppData = true;
    } catch (error) {
      result.errors.push(`Cannot access app data directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      // Test if we can write to the models directory
      await this.ensureDirectoryExists(this.config.modelsPath);
      const testFile = path.join(this.config.modelsPath, 'test-write.json');
      await Bun.write(testFile, '{"test": true}');
      await Bun.$`rm "${testFile}"`;
      result.canWriteModels = true;
    } catch (error) {
      result.errors.push(`Cannot write to models directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check if System Designer is installed (basic check)
    try {
      await Bun.$`ls -la "/Applications/System Designer.app"`;
      result.systemDesignerInstalled = true;
    } catch {
      result.errors.push('System Designer app not found in /Applications/');
    }

    return result;
  }

  getConfig(): SystemDesignerConfig {
    // WHY: This allows users to see the current configuration and paths
    // being used. Helpful for debugging and understanding the integration.
    return this.config;
  }
}

export interface IntegrationTestResult {
  canAccessAppData: boolean;
  canWriteModels: boolean;
  systemDesignerInstalled: boolean;
  errors: string[];
}

// WHY: We export a default instance for convenience. Users can also create
// their own instance with custom configuration if needed.
export const systemDesignerIntegration = new SystemDesignerIntegration();
