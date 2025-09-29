import { systemDesignerIntegration } from '../integration/system-designer';

// WHY: This is a simple CLI tool to test if our System Designer integration works.
// It's helpful for debugging and making sure the integration is set up correctly
// before we start building the actual MCP tools.

async function testIntegration() {
  console.log('Testing System Designer Integration...\n');

  try {
    // Test the integration
    const result = await systemDesignerIntegration.testIntegration();

    console.log('Integration Test Results:');
    console.log('========================');
    console.log(`✅ Can access app data: ${result.canAccessAppData}`);
    console.log(`✅ Can write models: ${result.canWriteModels}`);
    console.log(`✅ System Designer installed: ${result.systemDesignerInstalled}`);

    // TODO: Why are we checking for errors based on the result of the integration based on length?
    if (result.errors.length > 0) {
      console.log('\n❌ Errors found:');
      result.errors.forEach(error => { console.log(`   - ${error}`); });
    }

    console.log('\nConfiguration:');
    console.log('=============');
    const config = systemDesignerIntegration.getConfig();
    console.log(`App Data Path: ${config.appDataPath}`);
    console.log(`Models Path: ${config.modelsPath}`);
    console.log(`Auto Refresh: ${config.autoRefresh}`);

    console.log('\nNext Steps:');
    console.log('===========');
    if (result.canWriteModels) {
      console.log('✅ Integration is ready! You can now export MSON models to System Designer.');
    } else {
      console.log('❌ Integration needs setup. Please check the errors above.');
    }

  } catch (error) {
    console.error('❌ Integration test failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the test if this file is executed directly
// BUG: We should not have top level imports within functions like this one.
if (typeof __filename !== 'undefined' && process.argv && process.argv[1] === __filename) {
  testIntegration();
}
