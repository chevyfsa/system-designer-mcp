import * as path from 'path';
import * as os from 'os';
import { ensureDir, pathExists, remove, writeFile } from 'fs-extra';

export interface SystemDesignerConfig {
  appDataPath: string;
  modelsPath: string;
  autoRefresh: boolean;
}

export interface IntegrationTestResult {
  canAccessAppData: boolean;
  canWriteModels: boolean;
  systemDesignerInstalled: boolean;
  errors: string[];
}

export class SystemDesignerIntegration {
  private readonly config: SystemDesignerConfig;

  constructor(config?: Partial<SystemDesignerConfig>) {
    this.config = this.getDefaultConfig(config);
  }

  private getDefaultConfig(overrides?: Partial<SystemDesignerConfig>): SystemDesignerConfig {
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
    try {
      await ensureDir(this.config.modelsPath);

      const modelPath = path.join(this.config.modelsPath, `${modelName}.json`);
      await writeFile(modelPath, msonContent, 'utf8');

      console.error(`MSON model exported to: ${modelPath}`);

      if (this.config.autoRefresh) {
        await this.tryRefreshApp();
      }
    } catch (error) {
      throw new Error(
        `Failed to export MSON model: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async tryRefreshApp(): Promise<void> {
    console.error('Attempting to refresh System Designer app...');
    console.error(
      'Auto-refresh not yet implemented - user may need to manually refresh System Designer'
    );
  }

  async testIntegration(): Promise<IntegrationTestResult> {
    const result: IntegrationTestResult = {
      canAccessAppData: false,
      canWriteModels: false,
      systemDesignerInstalled: false,
      errors: [],
    };

    await this.testAppDataAccess(result);
    await this.testModelWriting(result);
    await this.testAppInstallation(result);

    return result;
  }

  private async testAppDataAccess(result: IntegrationTestResult): Promise<void> {
    try {
      await ensureDir(this.config.appDataPath);
      result.canAccessAppData = true;
    } catch (error) {
      result.errors.push(
        `Cannot access app data directory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async testModelWriting(result: IntegrationTestResult): Promise<void> {
    try {
      await ensureDir(this.config.modelsPath);
      const testFile = path.join(this.config.modelsPath, 'test-write.json');
      await writeFile(testFile, '{"test": true}', 'utf8');
      await remove(testFile);
      result.canWriteModels = true;
    } catch (error) {
      result.errors.push(
        `Cannot write to models directory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async testAppInstallation(result: IntegrationTestResult): Promise<void> {
    try {
      const appPath = path.join('/Applications', 'System Designer.app');
      const appExists = await pathExists(appPath);

      if (appExists) {
        result.systemDesignerInstalled = true;
      } else {
        result.errors.push('System Designer app not found in /Applications/');
      }
    } catch (error) {
      result.errors.push(
        `Error checking app installation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  getConfig(): SystemDesignerConfig {
    return { ...this.config };
  }
}

export const systemDesignerIntegration = new SystemDesignerIntegration();
