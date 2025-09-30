/**
 * Integration tests using example models from examples/ directory
 */

import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { msonToSystemRuntimeBundle } from '../../src/transformers/system-runtime';
import { validateSystemRuntimeBundle } from '../../src/validators/system-runtime';
import type { MsonModel } from '../../src/types';

describe('Example Models Integration Tests', () => {
  test('should transform banking system model to valid System Runtime bundle', () => {
    // Load the banking system example
    const bankingModelPath = join(process.cwd(), 'examples', 'banking-system.json');
    const bankingModelJson = readFileSync(bankingModelPath, 'utf-8');
    const bankingModel: MsonModel = JSON.parse(bankingModelJson);

    // Transform to System Runtime bundle
    const bundle = msonToSystemRuntimeBundle(bankingModel, '1.0.0');

    // Validate the bundle
    const validation = validateSystemRuntimeBundle(bundle);

    // Assertions
    expect(validation.isValid).toBe(true);
    expect(validation.warnings.filter((w) => w.severity === 'error').length).toBe(0);
    expect(bundle.name).toBe('Banking System');
    expect(bundle.version).toBe('1.0.0');

    // Verify all entities were transformed
    const entityNames = bankingModel.entities.map((e) => e.name);
    const schemaNames = Object.values(bundle.schemas).map((s) => s._name);
    const modelNames = Object.values(bundle.models).map((m) => m._name);

    for (const entityName of entityNames) {
      expect(schemaNames).toContain(entityName);
      expect(modelNames).toContain(entityName);
      expect(bundle.components[entityName]).toBeDefined();
    }

    // Verify relationships were processed
    expect(Object.keys(bundle.schemas).length).toBeGreaterThan(0);
    expect(Object.keys(bundle.models).length).toBeGreaterThan(0);

    // Check for specific entities in banking system
    const accountSchema = Object.values(bundle.schemas).find((s) => s._name === 'Account');
    expect(accountSchema).toBeDefined();
    expect(accountSchema?._inherit).toContain('_Component');

    const customerSchema = Object.values(bundle.schemas).find((s) => s._name === 'Customer');
    expect(customerSchema).toBeDefined();

    // Verify bundle structure
    expect(bundle.schemas).toBeDefined();
    expect(bundle.models).toBeDefined();
    expect(bundle.types).toBeDefined();
    expect(bundle.behaviors).toBeDefined();
    expect(bundle.components).toBeDefined();
  });

  test('should transform student system model to valid System Runtime bundle', () => {
    // Load the student system example
    const studentModelPath = join(process.cwd(), 'examples', 'student-system.json');
    const studentModelJson = readFileSync(studentModelPath, 'utf-8');
    const studentModel: MsonModel = JSON.parse(studentModelJson);

    // Transform to System Runtime bundle
    const bundle = msonToSystemRuntimeBundle(studentModel);

    // Validate the bundle
    const validation = validateSystemRuntimeBundle(bundle);

    // Assertions
    expect(validation.isValid).toBe(true);
    expect(validation.warnings.filter((w) => w.severity === 'error').length).toBe(0);

    // Verify all entities were transformed
    const entityNames = studentModel.entities.map((e) => e.name);
    const schemaNames = Object.values(bundle.schemas).map((s) => s._name);

    for (const entityName of entityNames) {
      expect(schemaNames).toContain(entityName);
    }

    // Check for specific entities in student system
    const studentSchema = Object.values(bundle.schemas).find((s) => s._name === 'Student');
    expect(studentSchema).toBeDefined();

    const courseSchema = Object.values(bundle.schemas).find((s) => s._name === 'Course');
    expect(courseSchema).toBeDefined();
  });

  test('should handle complex relationships in banking system', () => {
    const bankingModelPath = join(process.cwd(), 'examples', 'banking-system.json');
    const bankingModelJson = readFileSync(bankingModelPath, 'utf-8');
    const bankingModel: MsonModel = JSON.parse(bankingModelJson);

    const bundle = msonToSystemRuntimeBundle(bankingModel);

    // Find schemas with relationships
    const schemasWithLinks = Object.values(bundle.schemas).filter((schema) => {
      return Object.entries(schema).some(
        ([key, value]) =>
          key !== '_id' &&
          key !== '_name' &&
          key !== '_inherit' &&
          (value === 'link' || value === 'collection')
      );
    });

    // Should have at least some schemas with relationships
    expect(schemasWithLinks.length).toBeGreaterThan(0);

    // Verify models have corresponding type definitions
    for (const schema of schemasWithLinks) {
      const correspondingModel = Object.values(bundle.models).find((m) => m._name === schema._name);
      expect(correspondingModel).toBeDefined();
    }
  });

  test('should preserve method signatures from example models', () => {
    const bankingModelPath = join(process.cwd(), 'examples', 'banking-system.json');
    const bankingModelJson = readFileSync(bankingModelPath, 'utf-8');
    const bankingModel: MsonModel = JSON.parse(bankingModelJson);

    const bundle = msonToSystemRuntimeBundle(bankingModel);

    // Find entities with methods
    const entitiesWithMethods = bankingModel.entities.filter((e) => e.methods.length > 0);

    for (const entity of entitiesWithMethods) {
      const model = Object.values(bundle.models).find((m) => m._name === entity.name);
      expect(model).toBeDefined();

      // Check that methods are present in the model
      for (const method of entity.methods) {
        const methodSignature = model?.[method.name];
        expect(methodSignature).toBeDefined();

        // Verify it's a proper method signature with '=>' key
        if (typeof methodSignature === 'object' && methodSignature !== null) {
          expect('=>' in methodSignature).toBe(true);
        }
      }
    }
  });

  test('should create valid JSON output for System Runtime import', () => {
    const bankingModelPath = join(process.cwd(), 'examples', 'banking-system.json');
    const bankingModelJson = readFileSync(bankingModelPath, 'utf-8');
    const bankingModel: MsonModel = JSON.parse(bankingModelJson);

    const bundle = msonToSystemRuntimeBundle(bankingModel);

    // Serialize to JSON and parse back
    const bundleJson = JSON.stringify(bundle, null, 2);
    const parsedBundle = JSON.parse(bundleJson);

    // Validate the parsed bundle
    const validation = validateSystemRuntimeBundle(parsedBundle);
    expect(validation.isValid).toBe(true);

    // Verify structure is preserved
    expect(parsedBundle._id).toBe(bundle._id);
    expect(parsedBundle.name).toBe(bundle.name);
    expect(parsedBundle.version).toBe(bundle.version);
    expect(Object.keys(parsedBundle.schemas).length).toBe(Object.keys(bundle.schemas).length);
    expect(Object.keys(parsedBundle.models).length).toBe(Object.keys(bundle.models).length);
  });
});
