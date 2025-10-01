// @ts-expect-error -- accessing private methods for testing
import { test, expect } from 'bun:test';
import { SystemDesignerMCPServer } from '../src/index.ts';

// Helper function to create a test MCP server
function createTestServer(): SystemDesignerMCPServer {
  return new SystemDesignerMCPServer();
}

// Test data for MSON models - include IDs to avoid validation errors
const testModel = {
  id: 'test_model_1',
  name: 'Student Management System',
  type: 'class' as const,
  description: 'A system for managing students and courses',
  entities: [
    {
      id: 'student',
      name: 'Student',
      type: 'class' as const,
      attributes: [
        { name: 'id', type: 'string', visibility: 'private' as const },
        { name: 'name', type: 'string', visibility: 'public' as const },
        { name: 'email', type: 'string', visibility: 'public' as const, isReadOnly: true },
      ],
      methods: [
        {
          name: 'enroll',
          parameters: [{ name: 'course', type: 'Course' }],
          returnType: 'void',
          visibility: 'public' as const,
        },
        {
          name: 'getGPA',
          returnType: 'number',
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

test('create_mson_model creates a valid MSON model', async () => {
  const server = createTestServer();

  // We'll test the handleCreateMsonModel method directly
  const result = await server['handleCreateMsonModel'](testModel);

  expect(result).toBeDefined();
  expect(result.content).toBeDefined();
  expect(result.content).toHaveLength(2);
  expect(result.content[0].type).toBe('text');
  expect(result.content[1].type).toBe('json');

  const jsonContent = result.content[1].json;
  expect(jsonContent.name).toBe('Student Management System');
  expect(jsonContent.type).toBe('class');
  expect(jsonContent.entities).toHaveLength(2);
  expect(jsonContent.relationships).toHaveLength(1);

  // Check that IDs were preserved
  expect(jsonContent.id).toBe('test_model_1');
  expect(jsonContent.entities[0].id).toBe('student');
  expect(jsonContent.entities[1].id).toBe('course');
  expect(jsonContent.relationships[0].id).toBe('enrollment');
});

test('validate_mson_model validates a correct model', async () => {
  const server = createTestServer();

  const result = await server['handleValidateMsonModel']({ model: testModel });

  expect(result).toBeDefined();
  expect(result.content).toBeDefined();
  expect(result.content).toHaveLength(1);
  expect(result.content[0].type).toBe('text');

  const textContent = result.content[0].text;
  expect(textContent).toContain('✅ Model Validation Successful');
  expect(textContent).toContain('Student Management System');
  expect(textContent).toContain('Entities: 2');
  expect(textContent).toContain('Relationships: 1');
});

test('validate_mson_model detects orphaned relationships', async () => {
  const server = createTestServer();

  const invalidModel = {
    ...testModel,
    relationships: [
      {
        id: 'orphaned',
        from: 'nonexistent',
        to: 'course',
        type: 'association' as const,
      },
    ],
  };

  const result = await server['handleValidateMsonModel']({ model: invalidModel });

  expect(result).toBeDefined();
  expect(result.content).toBeDefined();
  expect(result.content[0].type).toBe('text');

  const textContent = result.content[0].text;
  expect(textContent).toContain('❌ Model validation failed due to relationship errors');
  expect(textContent).toContain("references unknown entity 'nonexistent' in 'from' field");
});

test('generate_uml_diagram creates PlantUML markup', async () => {
  const server = createTestServer();

  const result = await server['handleGenerateUmlDiagram']({
    model: testModel,
    format: 'plantuml',
  });

  expect(result).toBeDefined();
  expect(result.content).toBeDefined();
  expect(result.content).toHaveLength(1);
  expect(result.content[0].type).toBe('text');

  const textContent = result.content[0].text;
  expect(textContent).toContain('🎨 UML Diagram Generated (PLANTUML)');
  expect(textContent).toContain('@startuml');
  expect(textContent).toContain('title Student Management System');
  expect(textContent).toContain('class Student');
  expect(textContent).toContain('class Course');
  expect(textContent).toContain('@enduml');
});

test('generate_uml_diagram creates Mermaid markup', async () => {
  const server = createTestServer();

  const result = await server['handleGenerateUmlDiagram']({
    model: testModel,
    format: 'mermaid',
  });

  expect(result).toBeDefined();
  expect(result.content).toBeDefined();
  expect(result.content).toHaveLength(1);
  expect(result.content[0].type).toBe('text');

  const textContent = result.content[0].text;
  expect(textContent).toContain('🎨 UML Diagram Generated (MERMAID)');
  expect(textContent).toContain('classDiagram');
  expect(textContent).toContain('title Student Management System');
  expect(textContent).toContain('class Student');
  expect(textContent).toContain('class Course');
});

test('generate_uml_diagram rejects unsupported format', async () => {
  const server = createTestServer();

  const result = await server['handleGenerateUmlDiagram']({
    model: testModel,
    format: 'svg',
  });

  expect(result).toBeDefined();
  expect(result.content).toBeDefined();
  expect(result.content[0].type).toBe('text');
  expect(result.content[0].text).toContain('❌ Unsupported format: svg');
});

test('export_to_system_designer creates JSON file', async () => {
  const server = createTestServer();

  // Create a temporary file path
  const tempPath = '/tmp/test_student_system.json';

  const result = await server['handleExportToSystemDesigner']({
    model: testModel,
    filePath: tempPath,
  });

  expect(result).toBeDefined();
  expect(result.content).toBeDefined();
  expect(result.content).toHaveLength(1);
  expect(result.content[0].type).toBe('text');

  const textContent = result.content[0].text;
  expect(textContent).toContain('✅ Successfully exported to System Designer format');
  expect(textContent).toContain('File: /tmp/test_student_system.json');
  expect(textContent).toContain('Model: Student Management System');
  expect(textContent).toContain('File saved at: /tmp/test_student_system.json');

  // Check that the file was actually created
  const fileExists = await globalThis.Bun.file(tempPath).exists();
  expect(fileExists).toBe(true);

  // Clean up the temporary file
  await globalThis.Bun.$`rm ${tempPath}`;
});

test('create_mson_model rejects invalid model data', async () => {
  const server = createTestServer();

  const invalidModel = {
    name: 'Invalid Model',
    // Missing required 'type' field
    entities: [],
  };

  const result = await server['handleCreateMsonModel'](invalidModel);

  expect(result).toBeDefined();
  expect(result.content).toBeDefined();
  expect(result.content[0].type).toBe('text');
  expect(result.content[0].text).toContain('create_mson_model validation failed');
});

test('validate_mson_model rejects invalid model structure', async () => {
  const server = createTestServer();

  const invalidModel = {
    name: 'Invalid Model',
    type: 'invalid_type', // Invalid type
    entities: [],
  };

  const result = await server['handleValidateMsonModel']({ model: invalidModel });

  expect(result).toBeDefined();
  expect(result.content).toBeDefined();
  expect(result.content[0].type).toBe('text');
  expect(result.content[0].text).toContain('validate_mson_model validation failed');
});

test('comprehensive workflow: create -> validate -> generate UML -> export', async () => {
  const server = createTestServer();

  // Step 1: Create model
  const createResult = await (server as any).handleCreateMsonModel(testModel);
  expect(createResult).toBeDefined();
  const createdModel = createResult.content[1].json;

  // Step 2: Validate model
  const validateResult = await (server as any).handleValidateMsonModel({ model: createdModel });
  expect(validateResult).toBeDefined();

  // Step 3: Generate UML
  const umlResult = await (server as any).handleGenerateUmlDiagram({
    model: createdModel,
    format: 'plantuml',
  });
  expect(umlResult).toBeDefined();

  // Step 4: Export
  const tempPath = '/tmp/test_workflow_system.json';
  const exportResult = await (server as any).handleExportToSystemDesigner({
    model: createdModel,
    filePath: tempPath,
  });
  expect(exportResult).toBeDefined();

  // Clean up
  await globalThis.Bun.$`rm ${tempPath}`;
});
