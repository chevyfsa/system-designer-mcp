#!/usr/bin/env bun

/**
 * Script to generate fresh examples by testing the MCP server tools
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { SystemDesignerMCPServer } from '../src/index.ts';

// Create a test server instance
const server = new SystemDesignerMCPServer();

// Simple student management system example
const simpleModel = {
  id: 'student_management_system',
  name: 'Student Management System',
  type: 'class' as const,
  description: 'A simple system for managing students and courses',
  entities: [
    {
      id: 'student',
      name: 'Student',
      type: 'class' as const,
      attributes: [
        { name: 'id', type: 'string', visibility: 'private' as const },
        { name: 'name', type: 'string', visibility: 'public' as const },
        { name: 'email', type: 'string', visibility: 'public' as const },
      ],
      methods: [
        {
          name: 'enroll',
          parameters: [{ name: 'course', type: 'Course' }],
          returnType: 'void',
          visibility: 'public' as const,
        },
      ],
    },
    {
      id: 'course',
      name: 'Course',
      type: 'class' as const,
      attributes: [
        { name: 'id', type: 'string', visibility: 'private' as const },
        { name: 'title', type: 'string', visibility: 'public' as const },
        { name: 'credits', type: 'number', visibility: 'public' as const },
      ],
      methods: [
        {
          name: 'addStudent',
          parameters: [{ name: 'student', type: 'Student' }],
          returnType: 'void',
          visibility: 'public' as const,
        },
      ],
    },
  ],
  relationships: [
    {
      id: 'enrollment',
      from: 'student',
      to: 'course',
      type: 'association' as const,
      multiplicity: { from: '1', to: '0..*' },
      name: 'enrolls in',
    },
  ],
};

async function generateExamples() {
  console.log('🚀 Generating fresh examples...\n');

  // 1. Create MSON model
  console.log('1️⃣  Creating MSON model...');
  // @ts-expect-error - accessing private method for testing
  const createResult = await server.handleCreateMsonModel(simpleModel);
  const createdModel = createResult.content[1].json;
  console.log('✅ Model created with ID:', createdModel.id);

  // Save the model
  const modelPath = join(process.cwd(), 'examples', 'student-system.json');
  writeFileSync(modelPath, JSON.stringify(createdModel, null, 2));
  console.log('📝 Saved to:', modelPath);

  // 2. Validate the model
  console.log('\n2️⃣  Validating MSON model...');
  // @ts-expect-error - accessing private method for testing
  const validateResult = await server.handleValidateMsonModel({ model: createdModel });
  console.log('✅', validateResult.content[0].text);

  // 3. Generate PlantUML diagram
  console.log('\n3️⃣  Generating PlantUML diagram...');
  // @ts-expect-error - accessing private method for testing
  const plantumlResult = await server.handleGenerateUmlDiagram({
    model: createdModel,
    format: 'plantuml',
  });
  const plantumlPath = join(process.cwd(), 'examples', 'student-system-plantuml.puml');
  writeFileSync(plantumlPath, plantumlResult.content[0].text);
  console.log('✅ PlantUML diagram saved to:', plantumlPath);

  // 4. Generate Mermaid diagram
  console.log('\n4️⃣  Generating Mermaid diagram...');
  // @ts-expect-error - accessing private method for testing
  const mermaidResult = await server.handleGenerateUmlDiagram({
    model: createdModel,
    format: 'mermaid',
  });
  const mermaidPath = join(process.cwd(), 'examples', 'student-system-mermaid.md');
  writeFileSync(mermaidPath, mermaidResult.content[0].text);
  console.log('✅ Mermaid diagram saved to:', mermaidPath);

  // 5. Export to System Designer format
  console.log('\n5️⃣  Exporting to System Designer format...');
  const exportPath = join(process.cwd(), 'examples', 'student-system-export.json');
  // @ts-expect-error - accessing private method for testing
  const exportResult = await server.handleExportToSystemDesigner({
    model: createdModel,
    filePath: exportPath,
  });
  console.log('✅', exportResult.content[0].text);

  console.log('\n🎉 All examples generated successfully!');
  console.log('\n📂 Generated files:');
  console.log('   - examples/student-system.json');
  console.log('   - examples/student-system-plantuml.puml');
  console.log('   - examples/student-system-mermaid.md');
  console.log('   - examples/student-system-export.json');
}

// Run the script
generateExamples().catch((error) => {
  console.error('❌ Error generating examples:', error);
  process.exit(1);
});
