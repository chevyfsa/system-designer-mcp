# System Designer MCP Server - CLI Guide

## Overview

The System Designer MCP Server includes a command-line interface (CLI) tool for testing integration and managing models outside of the MCP environment.

## Installation

The CLI is included with the main MCP server installation:

```bash
# Install dependencies
bun install

# Run CLI commands
bun run src/cli.ts <command> [options]
```

## Available Commands

### 1. test-integration

Tests the System Designer integration to ensure everything is properly configured.

#### Usage

```bash
bun run src/cli.ts test-integration
```

#### What it tests:

- ✅ System Designer app installation
- ✅ Access to application data directories
- ✅ Write permissions for models directory
- ✅ File system operations

#### Example Output

```
🔍 Testing System Designer integration...

📊 Integration Test Results:
✅ System Designer installed: YES
✅ Can access app data: YES
✅ Can write models: YES

🎉 All tests passed! Integration should work correctly.
```

#### Troubleshooting

If tests fail, check:

1. System Designer is installed in `/Applications/System Designer.app`
2. The app has been run at least once
3. File permissions are correct

---

### 2. export-model

Exports a test MSON model to System Designer format.

#### Usage

```bash
bun run src/cli.ts export-model <model-name> [description]
```

#### Parameters

- `model-name` (required): Name for the model
- `description` (optional): Description of the model

#### Example

```bash
# Basic export
bun run src/cli.ts export-model UserSystem

# With description
bun run src/cli.ts export-model BankingSystem "A comprehensive banking system model"
```

#### What it creates:

- A simple test MSON model with basic entities
- Exports to System Designer format
- Saves to the configured models directory

#### Example Output

```
📤 Exporting model 'UserSystem' to System Designer...
✅ Model 'UserSystem' exported successfully!
📁 Location: /Users/user/Library/Application Support/System Designer/models/UserSystem.json
💡 Note: You may need to refresh System Designer to see the new model.
```

---

### 3. config

Shows the current System Designer integration configuration.

#### Usage

```bash
bun run src/cli.ts config
```

#### Example Output

```
⚙️  System Designer Integration Configuration:

📂 Paths:
   App Data: /Users/user/Library/Application Support/System Designer
   Models:   /Users/user/Library/Application Support/System Designer/models

🔧 Settings:
   Auto Refresh: Enabled

💡 Tips:
   - Make sure System Designer is installed in /Applications/
   - The app needs to be run at least once to create directories
   - You may need to manually refresh System Designer after exporting models
```

---

### 4. help

Shows help information and usage examples.

#### Usage

```bash
bun run src/cli.ts help
```

#### Example Output

```
🛠️  System Designer MCP Server CLI

Usage: bun run src/cli.ts <command> [options]

Commands:
   test-integration    Test System Designer integration
   export-model <name> [desc]  Export a test MSON model
   config              Show current configuration
   help                Show this help message

Examples:
   bun run src/cli.ts test-integration
   bun run src/cli.ts export-model User "User management system"
   bun run src/cli.ts config
```

---

## Configuration

### Default Paths

The CLI uses default macOS paths for System Designer:

- **App Data**: `~/Library/Application Support/System Designer`
- **Models**: `~/Library/Application Support/System Designer/models`

### Custom Configuration

You can customize the integration by modifying the `SystemDesignerIntegration` class in `src/integration/system-designer.ts`:

```typescript
const integration = new SystemDesignerIntegration({
  appDataPath: '/custom/path',
  modelsPath: '/custom/models',
  autoRefresh: false,
});
```

## Integration with System Designer App

### File Format

The CLI exports models in System Designer's native JSON format, which includes:

```json
{
  "name": "ModelName",
  "description": "Model description",
  "types": [...],
  "classes": [...],
  "relationships": [...]
}
```

### Import Process

1. Export model using CLI: `bun run src/cli.ts export-model MyModel`
2. Open System Designer app
3. Refresh the app (if auto-refresh doesn't work)
4. The model should appear in your models list

### Manual Refresh

If auto-refresh doesn't work:

1. **System Designer App**: File → Refresh or Cmd+R
2. **Check Location**: Ensure files are in the correct directory
3. **Restart App**: Close and reopen System Designer

## Common Workflows

### 1. Initial Setup

```bash
# Test integration
bun run src/cli.ts test-integration

# Check configuration
bun run src/cli.ts config

# Export test model
bun run src/cli.ts export-model TestModel "Initial test model"
```

### 2. Model Development

```bash
# Create multiple test models
bun run src/cli.ts export-model UserSystem "User management"
bun run src/cli.ts export-model ProductCatalog "Product catalog"
bun run src/cli.ts export-model OrderProcessing "Order processing"

# Verify all models are accessible
bun run src/cli.ts config
```

### 3. Troubleshooting

```bash
# Check if integration works
bun run src/cli.ts test-integration

# Export a simple test model
bun run src/cli.ts export-model DebugModel "Debug model"

# Check file paths
bun run src/cli.ts config
```

## Error Handling

### Common Errors

**Permission Denied**

```bash
Error: Cannot write to models directory
# Solution: Check file permissions and directory existence
```

**App Not Found**

```bash
Error: System Designer app not found
# Solution: Install System Designer in /Applications/
```

**Directory Access Issues**

```bash
Error: Cannot access app data directory
# Solution: Run System Designer at least once to create directories
```

### Debug Mode

For detailed debugging, you can modify the CLI to enable verbose logging:

```typescript
// In src/cli.ts, add to the constructor
this.integration = new SystemDesignerIntegration({
  debug: true, // Enable debug logging
});
```

## Development

### Adding New Commands

To add new CLI commands:

1. Add the command to the `runCommand` method in `src/cli.ts`
2. Implement the command method
3. Add help text in the `showHelp` method

Example:

```typescript
private async newCommand(args: string[]): Promise<void> {
  // Command implementation
}

// In runCommand switch
case 'new-command':
  await this.newCommand(commandArgs);
  break;

// In showHelp
console.error('   new-command     Description of new command');
```

### Testing the CLI

```bash
# Test each command
bun run src/cli.ts test-integration
bun run src/cli.ts export-model Test
bun run src/cli.ts config
bun run src/cli.ts help

# Test error cases
bun run src/cli.ts invalid-command
bun run src/cli.ts export-model  # Missing required argument
```

## Contributing

When contributing to the CLI:

1. **Add Tests**: Include tests for new commands
2. **Update Documentation**: Keep this guide and help text current
3. **Error Handling**: Provide clear error messages and recovery suggestions
4. **Consistency**: Follow existing patterns and conventions

## Support

For issues with the CLI:

1. Check the troubleshooting section above
2. Run `test-integration` to diagnose problems
3. Verify System Designer installation and permissions
4. Check the project GitHub issues for known problems

## Version History

- **v1.0.0**: Initial CLI release
  - test-integration command
  - export-model command
  - config command
  - help system
