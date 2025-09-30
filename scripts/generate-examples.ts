#!/usr/bin/env bun

/**
 * Generate Authentic Example Files Script
 *
 * This script generates authentic example outputs from the MCP server tools.
 * All examples are created by actually running the MCP server tools, not manually.
 *
 * Usage: bun run scripts/generate-examples.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { SystemDesignerMCPServer } from '../src/index.ts';

// Create a test server instance
const server = new SystemDesignerMCPServer();

// Load existing models to preserve all data
const examplesDir = join(process.cwd(), 'examples');

// Load the complete banking system model
const bankingModelFull = JSON.parse(
  readFileSync(join(examplesDir, 'banking-system.json'), 'utf-8')
);

// Load the complete student system model
const studentModelFull = JSON.parse(
  readFileSync(join(examplesDir, 'student-system.json'), 'utf-8')
);

/**
 * Generate all outputs for a single example model
 */
async function generateExampleOutputs(modelName: string, model: any): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📝 Generating ${modelName} examples...`);
  console.log(`${'='.repeat(60)}\n`);

  const baseName = modelName.toLowerCase().replace(/\s+/g, '-');

  // 1. Create/Validate MSON model
  console.log('1️⃣  Creating and validating MSON model...');
  // @ts-expect-error - accessing private method for testing
  const createResult = await server.handleCreateMsonModel(model);

  // Check for errors
  if (createResult.isError || !createResult.content[1]?.json) {
    console.error('❌ Model creation failed:', createResult.content[0].text);
    throw new Error('Model creation failed');
  }

  const createdModel = createResult.content[1].json;
  console.log('✅ Model created with ID:', createdModel.id);

  // Save the MSON model
  const modelPath = join(examplesDir, `${baseName}.json`);
  writeFileSync(modelPath, JSON.stringify(createdModel, null, 2));
  console.log('📝 Saved MSON model to:', modelPath);

  // 2. Validate the model
  console.log('\n2️⃣  Validating MSON model...');
  // @ts-expect-error - accessing private method for testing
  const validateResult = await server.handleValidateMsonModel({ model: createdModel });
  console.log('✅ Validation result:', validateResult.content[0].text.split('\n')[0]);

  // 3. Generate PlantUML diagram
  console.log('\n3️⃣  Generating PlantUML diagram...');
  // @ts-expect-error - accessing private method for testing
  const plantumlResult = await server.handleGenerateUmlDiagram({
    model: createdModel,
    format: 'plantuml',
  });
  const plantumlPath = join(examplesDir, `${baseName}-plantuml.puml`);
  writeFileSync(plantumlPath, plantumlResult.content[0].text);
  console.log('✅ PlantUML diagram saved to:', plantumlPath);

  // 4. Generate Mermaid diagram
  console.log('\n4️⃣  Generating Mermaid diagram...');
  // @ts-expect-error - accessing private method for testing
  const mermaidResult = await server.handleGenerateUmlDiagram({
    model: createdModel,
    format: 'mermaid',
  });
  const mermaidPath = join(examplesDir, `${baseName}-mermaid.md`);
  writeFileSync(mermaidPath, mermaidResult.content[0].text);
  console.log('✅ Mermaid diagram saved to:', mermaidPath);

  // 5. Export to System Designer format
  console.log('\n5️⃣  Exporting to System Designer format...');
  const exportPath = join(examplesDir, `${baseName}-export.json`);
  // @ts-expect-error - accessing private method for testing
  await server.handleExportToSystemDesigner({
    model: createdModel,
    filePath: exportPath,
  });
  console.log('✅ System Designer export saved');

  // 6. Create System Runtime bundle
  console.log('\n6️⃣  Creating System Runtime bundle...');
  // @ts-expect-error - accessing private method for testing
  const bundleResult = await server.handleCreateSystemRuntimeBundle({
    model: createdModel,
    version: '1.0.0',
  });

  if (!bundleResult.isError) {
    // Extract the JSON from the result
    const bundleJson = bundleResult.content[2].text;
    const bundlePath = join(examplesDir, `${baseName}-runtime-bundle.json`);
    writeFileSync(bundlePath, bundleJson);
    console.log('✅ System Runtime bundle saved to:', bundlePath);

    // Validate the bundle
    console.log('\n7️⃣  Validating System Runtime bundle...');
    const bundle = JSON.parse(bundleJson);
    // @ts-expect-error - accessing private method for testing
    const bundleValidation = await server.handleValidateSystemRuntimeBundle({ bundle });
    console.log('✅ Bundle validation:', bundleValidation.content[0].text.split('\n')[0]);
  } else {
    console.log('⚠️  System Runtime bundle creation skipped (not supported for this model)');
  }

  console.log(`\n✨ ${modelName} examples generated successfully!`);
  console.log('\n📂 Generated files:');
  console.log(`   - ${baseName}.json (MSON model)`);
  console.log(`   - ${baseName}-plantuml.puml (PlantUML diagram)`);
  console.log(`   - ${baseName}-mermaid.md (Mermaid diagram)`);
  console.log(`   - ${baseName}-export.json (System Designer export)`);
  console.log(`   - ${baseName}-runtime-bundle.json (System Runtime bundle)`);
}

/**
 * Main function to generate all examples
 */
async function generateExamples() {
  console.log('🚀 Generating authentic MCP server example outputs...\n');
  console.log('This script demonstrates the MCP server tools by generating');
  console.log('real outputs from the actual tool handlers.\n');

  try {
    // Generate student system examples
    await generateExampleOutputs('Student System', studentModelFull);

    // Generate banking system examples
    await generateExampleOutputs('Banking System', bankingModelFull);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 All examples generated successfully!');
    console.log('='.repeat(60));
    console.log('\n📁 Examples directory:', examplesDir);
    console.log('\n💡 Next steps:');
    console.log('   1. Review the generated files in the examples/ directory');
    console.log('   2. Check PROMPTS.md for the natural language prompts used');
    console.log('   3. Use these examples as reference for creating your own models');
    console.log('   4. Import the System Designer exports into the System Designer app');
    console.log('   5. Use the System Runtime bundles with the System Runtime framework\n');
  } catch (error) {
    console.error('\n❌ Error generating examples:', error);
    throw error;
  }
}

// Run the script
generateExamples().catch((error) => {
  console.error('❌ Error generating examples:', error);
  process.exit(1);
});
