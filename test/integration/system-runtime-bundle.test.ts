/**
 * Integration tests for complete MSON to System Runtime bundle transformation
 */

import { describe, expect, test } from 'bun:test';
import { msonToSystemRuntimeBundle } from '../../src/transformers/system-runtime';
import { validateSystemRuntimeBundle } from '../../src/validators/system-runtime';
import type { MsonModel } from '../../src/types';

describe('System Runtime Bundle Integration Tests', () => {
  test('should create valid bundle from simple class model', () => {
    const model: MsonModel = {
      id: 'simple-model',
      name: 'SimpleSystem',
      type: 'class',
      description: 'A simple test system',
      entities: [
        {
          id: 'person',
          name: 'Person',
          type: 'class',
          attributes: [
            {
              name: 'firstName',
              type: 'string',
              visibility: 'public',
              isStatic: false,
              isReadOnly: false,
            },
            {
              name: 'lastName',
              type: 'string',
              visibility: 'public',
              isStatic: false,
              isReadOnly: false,
            },
            {
              name: 'age',
              type: 'number',
              visibility: 'public',
              isStatic: false,
              isReadOnly: false,
            },
          ],
          methods: [
            {
              name: 'getFullName',
              parameters: [],
              returnType: 'string',
              visibility: 'public',
              isStatic: false,
              isAbstract: false,
            },
            {
              name: 'greet',
              parameters: [{ name: 'message', type: 'string' }],
              returnType: 'void',
              visibility: 'public',
              isStatic: false,
              isAbstract: false,
            },
          ],
        },
      ],
      relationships: [],
    };

    const bundle = msonToSystemRuntimeBundle(model);
    const validation = validateSystemRuntimeBundle(bundle);

    expect(validation.isValid).toBe(true);
    expect(validation.warnings.length).toBe(0);
    expect(bundle.name).toBe('SimpleSystem');
    expect(bundle.version).toBe('0.0.1');
    expect(Object.keys(bundle.schemas).length).toBe(1);
    expect(Object.keys(bundle.models).length).toBe(1);

    // Verify schema structure
    const personSchema = Object.values(bundle.schemas)[0];
    expect(personSchema._name).toBe('Person');
    expect(personSchema.firstName).toBe('property');
    expect(personSchema.lastName).toBe('property');
    expect(personSchema.age).toBe('property');
    expect(personSchema.getFullName).toBe('method');
    expect(personSchema.greet).toBe('method');

    // Verify model structure
    const personModel = Object.values(bundle.models)[0];
    expect(personModel._name).toBe('Person');
    expect(personModel.firstName).toBe('string');
    expect(personModel.lastName).toBe('string');
    expect(personModel.age).toBe('number');
    expect(personModel.getFullName).toEqual({ '=>': 'string' });
    expect(personModel.greet).toEqual({ message: 'string', '=>': 'void' });
  });

  test('should create valid bundle with relationships', () => {
    const model: MsonModel = {
      id: 'relationship-model',
      name: 'RelationshipSystem',
      type: 'class',
      entities: [
        {
          id: 'student',
          name: 'Student',
          type: 'class',
          attributes: [
            {
              name: 'name',
              type: 'string',
              visibility: 'public',
              isStatic: false,
              isReadOnly: false,
            },
          ],
          methods: [],
        },
        {
          id: 'course',
          name: 'Course',
          type: 'class',
          attributes: [
            {
              name: 'title',
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
          from: 'student',
          to: 'course',
          type: 'association',
          multiplicity: { from: '0..*', to: '0..*' },
          name: 'enrolledCourses',
        },
      ],
    };

    const bundle = msonToSystemRuntimeBundle(model);
    const validation = validateSystemRuntimeBundle(bundle);

    expect(validation.isValid).toBe(true);
    expect(validation.warnings.length).toBe(0);

    // Verify bidirectional relationships
    const studentSchema = Object.values(bundle.schemas).find((s) => s._name === 'Student');
    const courseSchema = Object.values(bundle.schemas).find((s) => s._name === 'Course');

    expect(studentSchema?.enrolledCourses).toBe('collection');
    expect(courseSchema?.students).toBe('collection');

    const studentModel = Object.values(bundle.models).find((m) => m._name === 'Student');
    const courseModel = Object.values(bundle.models).find((m) => m._name === 'Course');

    expect(studentModel?.enrolledCourses).toEqual(['Course']);
    expect(courseModel?.students).toEqual(['Student']);
  });

  test('should create valid bundle with inheritance', () => {
    const model: MsonModel = {
      id: 'inheritance-model',
      name: 'InheritanceSystem',
      type: 'class',
      entities: [
        {
          id: 'animal',
          name: 'Animal',
          type: 'class',
          attributes: [
            {
              name: 'name',
              type: 'string',
              visibility: 'public',
              isStatic: false,
              isReadOnly: false,
            },
          ],
          methods: [
            {
              name: 'makeSound',
              parameters: [],
              returnType: 'string',
              visibility: 'public',
              isStatic: false,
              isAbstract: true,
            },
          ],
        },
        {
          id: 'dog',
          name: 'Dog',
          type: 'class',
          attributes: [
            {
              name: 'breed',
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
          from: 'dog',
          to: 'animal',
          type: 'inheritance',
        },
      ],
    };

    const bundle = msonToSystemRuntimeBundle(model);
    const validation = validateSystemRuntimeBundle(bundle);

    expect(validation.isValid).toBe(true);
    expect(validation.warnings.length).toBe(0);

    const dogSchema = Object.values(bundle.schemas).find((s) => s._name === 'Dog');
    expect(dogSchema?._inherit).toContain('_Component');
    expect(dogSchema?._inherit).toContain('Animal');
  });

  test('should create bundle with custom version', () => {
    const model: MsonModel = {
      id: 'version-model',
      name: 'VersionedSystem',
      type: 'class',
      entities: [],
      relationships: [],
    };

    const bundle = msonToSystemRuntimeBundle(model, '1.2.3');
    expect(bundle.version).toBe('1.2.3');
  });

  test('should validate and detect missing schema references', () => {
    const invalidBundle = {
      _id: 'test',
      name: 'Invalid',
      description: 'Test',
      version: '1.0.0',
      master: true,
      schemas: {},
      models: {
        model1: {
          _id: 'm1',
          _name: 'NonExistentSchema',
        },
      },
      types: {},
      behaviors: {},
      components: {},
    };

    const validation = validateSystemRuntimeBundle(invalidBundle);
    expect(validation.isValid).toBe(false);
    expect(validation.warnings.some((w) => w.message.includes('non-existent schema'))).toBe(true);
  });

  test('should validate and detect duplicate IDs', () => {
    const invalidBundle = {
      _id: 'duplicate-id',
      name: 'Invalid',
      description: 'Test',
      version: '1.0.0',
      master: true,
      schemas: {
        schema1: {
          _id: 'duplicate-id',
          _name: 'Schema1',
          _inherit: ['_Component'],
        },
      },
      models: {},
      types: {},
      behaviors: {},
      components: {},
    };

    const validation = validateSystemRuntimeBundle(invalidBundle);
    expect(validation.isValid).toBe(false);
    expect(validation.warnings.some((w) => w.message.includes('Duplicate'))).toBe(true);
  });
});

