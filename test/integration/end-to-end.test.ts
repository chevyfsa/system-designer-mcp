/**
 * End-to-end integration tests for complete workflow
 * Tests the full pipeline from MSON creation through System Runtime bundle export
 */

import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { MsonModelSchema } from '../../src/schemas';
import { msonToSystemRuntimeBundle } from '../../src/transformers/system-runtime';
import { validateSystemRuntimeBundle } from '../../src/validators/system-runtime';
import type { MsonModel } from '../../src/types';

describe('End-to-End Workflow Tests', () => {
  test('complete workflow: create MSON -> transform to bundle -> validate -> export JSON', () => {
    // Step 1: Create MSON model
    const msonModel: MsonModel = {
      id: 'e2e-test',
      name: 'E2E Test System',
      type: 'class',
      description: 'End-to-end test system',
      entities: [
        {
          id: 'user',
          name: 'User',
          type: 'class',
          attributes: [
            {
              name: 'username',
              type: 'string',
              visibility: 'public',
              isStatic: false,
              isReadOnly: false,
            },
            {
              name: 'email',
              type: 'string',
              visibility: 'public',
              isStatic: false,
              isReadOnly: false,
            },
          ],
          methods: [
            {
              name: 'login',
              parameters: [{ name: 'password', type: 'string' }],
              returnType: 'boolean',
              visibility: 'public',
              isStatic: false,
              isAbstract: false,
            },
          ],
        },
        {
          id: 'post',
          name: 'Post',
          type: 'class',
          attributes: [
            {
              name: 'title',
              type: 'string',
              visibility: 'public',
              isStatic: false,
              isReadOnly: false,
            },
            {
              name: 'content',
              type: 'string',
              visibility: 'public',
              isStatic: false,
              isReadOnly: false,
            },
          ],
          methods: [],
        },
      ],
      relationships: [
        {
          id: 'rel1',
          from: 'user',
          to: 'post',
          type: 'association',
          multiplicity: { from: '1', to: '0..*' },
          name: 'posts',
        },
      ],
    };

    // Validate MSON model
    const msonValidation = MsonModelSchema.safeParse(msonModel);
    expect(msonValidation.success).toBe(true);

    // Step 2: Transform to System Runtime bundle
    const bundle = msonToSystemRuntimeBundle(msonModel, '1.0.0');
    expect(bundle).toBeDefined();
    expect(bundle.name).toBe('E2E Test System');
    expect(bundle.version).toBe('1.0.0');

    // Step 3: Validate bundle
    const bundleValidation = validateSystemRuntimeBundle(bundle);
    expect(bundleValidation.isValid).toBe(true);
    expect(bundleValidation.warnings.filter((w) => w.severity === 'error').length).toBe(0);

    // Step 4: Verify bundle structure
    expect(Object.keys(bundle.schemas).length).toBe(2);
    expect(Object.keys(bundle.models).length).toBe(2);
    expect(Object.keys(bundle.components).length).toBe(2);

    // Step 5: Export to JSON and verify it can be parsed back
    const bundleJson = JSON.stringify(bundle, null, 2);
    const parsedBundle = JSON.parse(bundleJson);

    // Verify parsed bundle is still valid
    const reparsedValidation = validateSystemRuntimeBundle(parsedBundle);
    expect(reparsedValidation.isValid).toBe(true);

    // Verify relationships were processed correctly
    const userSchema = Object.values(bundle.schemas).find((s) => s._name === 'User');
    const postSchema = Object.values(bundle.schemas).find((s) => s._name === 'Post');

    expect(userSchema?.posts).toBe('collection');
    expect(postSchema?.user).toBe('link');
  });

  test('workflow with banking system example', () => {
    // Load banking system example
    const bankingModelPath = join(process.cwd(), 'examples', 'banking-system.json');
    const bankingModelJson = readFileSync(bankingModelPath, 'utf-8');
    const bankingModel: MsonModel = JSON.parse(bankingModelJson);

    // Transform to bundle
    const bundle = msonToSystemRuntimeBundle(bankingModel, '2.0.0');

    // Validate
    const validation = validateSystemRuntimeBundle(bundle);
    expect(validation.isValid).toBe(true);

    // Export and re-import
    const exported = JSON.stringify(bundle);
    const reimported = JSON.parse(exported);

    // Verify reimported bundle is valid
    const reimportedValidation = validateSystemRuntimeBundle(reimported);
    expect(reimportedValidation.isValid).toBe(true);

    // Verify all entities were transformed
    const entityCount = bankingModel.entities.length;
    expect(Object.keys(bundle.schemas).length).toBe(entityCount);
    expect(Object.keys(bundle.models).length).toBe(entityCount);
  });

  test('workflow with inheritance and complex relationships', () => {
    const complexModel: MsonModel = {
      id: 'complex-test',
      name: 'Complex System',
      type: 'class',
      entities: [
        {
          id: 'shape',
          name: 'Shape',
          type: 'class',
          attributes: [
            {
              name: 'color',
              type: 'string',
              visibility: 'public',
              isStatic: false,
              isReadOnly: false,
            },
          ],
          methods: [
            {
              name: 'getArea',
              parameters: [],
              returnType: 'number',
              visibility: 'public',
              isStatic: false,
              isAbstract: true,
            },
          ],
        },
        {
          id: 'circle',
          name: 'Circle',
          type: 'class',
          attributes: [
            {
              name: 'radius',
              type: 'number',
              visibility: 'public',
              isStatic: false,
              isReadOnly: false,
            },
          ],
          methods: [],
        },
        {
          id: 'rectangle',
          name: 'Rectangle',
          type: 'class',
          attributes: [
            {
              name: 'width',
              type: 'number',
              visibility: 'public',
              isStatic: false,
              isReadOnly: false,
            },
            {
              name: 'height',
              type: 'number',
              visibility: 'public',
              isStatic: false,
              isReadOnly: false,
            },
          ],
          methods: [],
        },
      ],
      relationships: [
        {
          id: 'rel1',
          from: 'circle',
          to: 'shape',
          type: 'inheritance',
        },
        {
          id: 'rel2',
          from: 'rectangle',
          to: 'shape',
          type: 'inheritance',
        },
      ],
    };

    // Transform and validate
    const bundle = msonToSystemRuntimeBundle(complexModel);
    const validation = validateSystemRuntimeBundle(bundle);

    expect(validation.isValid).toBe(true);

    // Verify inheritance
    const circleSchema = Object.values(bundle.schemas).find((s) => s._name === 'Circle');
    const rectangleSchema = Object.values(bundle.schemas).find((s) => s._name === 'Rectangle');

    expect(circleSchema?._inherit).toContain('Shape');
    expect(rectangleSchema?._inherit).toContain('Shape');

    // Verify no circular inheritance warnings
    const circularWarnings = validation.warnings.filter((w) =>
      w.message.includes('Circular inheritance')
    );
    expect(circularWarnings.length).toBe(0);
  });

  test('workflow handles validation errors gracefully', () => {
    const invalidBundle = {
      _id: 'invalid',
      name: 'Invalid Bundle',
      description: 'Test',
      version: '1.0.0',
      master: true,
      schemas: {
        schema1: {
          _id: 's1',
          _name: 'Schema1',
          _inherit: ['NonExistentParent'],
        },
      },
      models: {},
      types: {},
      behaviors: {},
      components: {},
    };

    const validation = validateSystemRuntimeBundle(invalidBundle);

    expect(validation.isValid).toBe(false);
    expect(validation.warnings.some((w) => w.severity === 'error')).toBe(true);
    expect(validation.warnings.some((w) => w.message.includes('non-existent schema'))).toBe(true);
  });
});
