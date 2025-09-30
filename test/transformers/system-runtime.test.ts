/**
 * Unit tests for System Runtime transformers
 */

import { describe, expect, test } from 'bun:test';
import {
  determineAttributeKind,
  entityToModel,
  entityToSchema,
  generateId,
  msonToSystemRuntimeBundle,
} from '../../src/transformers/system-runtime';
import type { MsonAttribute, MsonEntity, MsonModel, MsonRelationship } from '../../src/types';

describe('System Runtime Transformers', () => {
  describe('generateId', () => {
    test('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    test('should include prefix when provided', () => {
      const id = generateId('test');
      expect(id).toStartWith('test');
    });

    test('should generate IDs without prefix', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('determineAttributeKind', () => {
    test('should identify primitive types as properties', () => {
      const attr: MsonAttribute = {
        name: 'firstName',
        type: 'string',
        visibility: 'public',
        isStatic: false,
        isReadOnly: false,
      };
      const kind = determineAttributeKind(attr, [], 'entity1');
      expect(kind).toBe('property');
    });

    test('should identify number type as property', () => {
      const attr: MsonAttribute = {
        name: 'age',
        type: 'number',
        visibility: 'public',
        isStatic: false,
        isReadOnly: false,
      };
      const kind = determineAttributeKind(attr, [], 'entity1');
      expect(kind).toBe('property');
    });

    test('should identify boolean type as property', () => {
      const attr: MsonAttribute = {
        name: 'isActive',
        type: 'boolean',
        visibility: 'public',
        isStatic: false,
        isReadOnly: false,
      };
      const kind = determineAttributeKind(attr, [], 'entity1');
      expect(kind).toBe('property');
    });

    test('should identify entity reference as link when no relationship', () => {
      const attr: MsonAttribute = {
        name: 'manager',
        type: 'Person',
        visibility: 'public',
        isStatic: false,
        isReadOnly: false,
      };
      const kind = determineAttributeKind(attr, [], 'entity1');
      expect(kind).toBe('link');
    });

    test('should identify collection based on multiplicity', () => {
      const attr: MsonAttribute = {
        name: 'courses',
        type: 'Course',
        visibility: 'public',
        isStatic: false,
        isReadOnly: false,
      };
      const relationships: MsonRelationship[] = [
        {
          id: 'rel1',
          from: 'entity1',
          to: 'course',
          type: 'association',
          multiplicity: { from: '1', to: '0..*' },
        },
      ];
      const kind = determineAttributeKind(attr, relationships, 'entity1');
      expect(kind).toBe('collection');
    });

    test('should identify link based on multiplicity', () => {
      const attr: MsonAttribute = {
        name: 'department',
        type: 'Department',
        visibility: 'public',
        isStatic: false,
        isReadOnly: false,
      };
      const relationships: MsonRelationship[] = [
        {
          id: 'rel1',
          from: 'entity1',
          to: 'department',
          type: 'association',
          multiplicity: { from: '1', to: '1' },
        },
      ];
      const kind = determineAttributeKind(attr, relationships, 'entity1');
      expect(kind).toBe('link');
    });
  });

  describe('entityToSchema', () => {
    test('should convert simple entity to schema', () => {
      const entity: MsonEntity = {
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
        ],
      };

      const schema = entityToSchema(entity, [], [entity]);

      expect(schema._name).toBe('Person');
      expect(schema._inherit).toEqual(['_Component']);
      expect(schema.firstName).toBe('property');
      expect(schema.lastName).toBe('property');
      expect(schema.getFullName).toBe('method');
    });

    test('should handle inheritance relationships', () => {
      const baseEntity: MsonEntity = {
        id: 'animal',
        name: 'Animal',
        type: 'class',
        attributes: [],
        methods: [],
      };

      const derivedEntity: MsonEntity = {
        id: 'dog',
        name: 'Dog',
        type: 'class',
        attributes: [],
        methods: [],
      };

      const relationships: MsonRelationship[] = [
        {
          id: 'rel1',
          from: 'dog',
          to: 'animal',
          type: 'inheritance',
        },
      ];

      const schema = entityToSchema(derivedEntity, relationships, [baseEntity, derivedEntity]);

      expect(schema._inherit).toContain('Animal');
      expect(schema._inherit).toContain('_Component');
    });
  });

  describe('entityToModel', () => {
    test('should convert entity to model with correct types', () => {
      const entity: MsonEntity = {
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
            name: 'age',
            type: 'number',
            visibility: 'public',
            isStatic: false,
            isReadOnly: false,
          },
        ],
        methods: [
          {
            name: 'greet',
            parameters: [{ name: 'message', type: 'string' }],
            returnType: 'void',
            visibility: 'public',
            isStatic: false,
            isAbstract: false,
          },
        ],
      };

      const model = entityToModel(entity, [], [entity]);

      expect(model._name).toBe('Person');
      expect(model.firstName).toBe('string');
      expect(model.age).toBe('number');
      expect(model.greet).toEqual({
        message: 'string',
        '=>': 'void',
      });
    });

    test('should handle link types', () => {
      const personEntity: MsonEntity = {
        id: 'person',
        name: 'Person',
        type: 'class',
        attributes: [],
        methods: [],
      };

      const employeeEntity: MsonEntity = {
        id: 'employee',
        name: 'Employee',
        type: 'class',
        attributes: [
          {
            name: 'manager',
            type: 'Person',
            visibility: 'public',
            isStatic: false,
            isReadOnly: false,
          },
        ],
        methods: [],
      };

      const model = entityToModel(employeeEntity, [], [personEntity, employeeEntity]);

      expect(model.manager).toBe('Person');
    });

    test('should handle collection types', () => {
      const courseEntity: MsonEntity = {
        id: 'course',
        name: 'Course',
        type: 'class',
        attributes: [],
        methods: [],
      };

      const studentEntity: MsonEntity = {
        id: 'student',
        name: 'Student',
        type: 'class',
        attributes: [
          {
            name: 'courses',
            type: 'Course',
            visibility: 'public',
            isStatic: false,
            isReadOnly: false,
          },
        ],
        methods: [],
      };

      const relationships: MsonRelationship[] = [
        {
          id: 'rel1',
          from: 'student',
          to: 'course',
          type: 'association',
          multiplicity: { from: '1', to: '0..*' },
        },
      ];

      const model = entityToModel(studentEntity, relationships, [courseEntity, studentEntity]);

      expect(model.courses).toEqual(['Course']);
    });
  });

  describe('msonToSystemRuntimeBundle', () => {
    test('should convert complete MSON model to bundle', () => {
      const model: MsonModel = {
        id: 'test-model',
        name: 'Test System',
        type: 'class',
        description: 'A test system',
        entities: [
          {
            id: 'person',
            name: 'Person',
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
        ],
        relationships: [],
      };

      const bundle = msonToSystemRuntimeBundle(model);

      expect(bundle.name).toBe('Test System');
      expect(bundle.description).toBe('A test system');
      expect(bundle.version).toBe('0.0.1');
      expect(bundle.master).toBe(true);
      expect(Object.keys(bundle.schemas).length).toBe(1);
      expect(Object.keys(bundle.models).length).toBe(1);
      expect(bundle.components.Person).toBeDefined();
    });

    test('should create empty sections for types, behaviors, and components', () => {
      const model: MsonModel = {
        id: 'test-model',
        name: 'Test System',
        type: 'class',
        entities: [],
        relationships: [],
      };

      const bundle = msonToSystemRuntimeBundle(model);

      expect(bundle.types).toEqual({});
      expect(bundle.behaviors).toEqual({});
      expect(bundle.components).toEqual({});
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    test('should handle bidirectional relationships', () => {
      const personEntity: MsonEntity = {
        id: 'person',
        name: 'Person',
        type: 'class',
        attributes: [],
        methods: [],
      };

      const companyEntity: MsonEntity = {
        id: 'company',
        name: 'Company',
        type: 'class',
        attributes: [],
        methods: [],
      };

      const relationships: MsonRelationship[] = [
        {
          id: 'rel1',
          from: 'person',
          to: 'company',
          type: 'association',
          multiplicity: { from: '0..*', to: '1' },
          name: 'employer',
        },
      ];

      const personSchema = entityToSchema(personEntity, relationships, [
        personEntity,
        companyEntity,
      ]);
      const companySchema = entityToSchema(companyEntity, relationships, [
        personEntity,
        companyEntity,
      ]);

      // Person should have employer link
      expect(personSchema.employer).toBe('link');

      // Company should have persons collection (reverse relationship)
      expect(companySchema.persons).toBe('collection');
    });

    test('should handle multiple inheritance', () => {
      const interfaceA: MsonEntity = {
        id: 'interfaceA',
        name: 'InterfaceA',
        type: 'interface',
        attributes: [],
        methods: [],
      };

      const interfaceB: MsonEntity = {
        id: 'interfaceB',
        name: 'InterfaceB',
        type: 'interface',
        attributes: [],
        methods: [],
      };

      const implementingClass: MsonEntity = {
        id: 'impl',
        name: 'Implementation',
        type: 'class',
        attributes: [],
        methods: [],
      };

      const relationships: MsonRelationship[] = [
        {
          id: 'rel1',
          from: 'impl',
          to: 'interfaceA',
          type: 'implementation',
        },
        {
          id: 'rel2',
          from: 'impl',
          to: 'interfaceB',
          type: 'implementation',
        },
      ];

      const schema = entityToSchema(implementingClass, relationships, [
        interfaceA,
        interfaceB,
        implementingClass,
      ]);

      expect(schema._inherit).toContain('_Component');
      expect(schema._inherit).toContain('InterfaceA');
      expect(schema._inherit).toContain('InterfaceB');
      expect(schema._inherit.length).toBe(3);
    });

    test('should handle self-referential relationships', () => {
      const treeNode: MsonEntity = {
        id: 'treenode',
        name: 'TreeNode',
        type: 'class',
        attributes: [],
        methods: [],
      };

      const relationships: MsonRelationship[] = [
        {
          id: 'rel1',
          from: 'treenode',
          to: 'treenode',
          type: 'association',
          multiplicity: { from: '1', to: '0..*' },
          name: 'children',
        },
      ];

      const schema = entityToSchema(treeNode, relationships, [treeNode]);
      const model = entityToModel(treeNode, relationships, [treeNode]);

      expect(schema.children).toBe('collection');
      expect(model.children).toEqual(['TreeNode']);
    });

    test('should avoid duplicate relationship properties', () => {
      const entity: MsonEntity = {
        id: 'entity1',
        name: 'Entity1',
        type: 'class',
        attributes: [
          {
            name: 'relatedEntity',
            type: 'Entity2',
            visibility: 'public',
            isStatic: false,
            isReadOnly: false,
          },
        ],
        methods: [],
      };

      const entity2: MsonEntity = {
        id: 'entity2',
        name: 'Entity2',
        type: 'class',
        attributes: [],
        methods: [],
      };

      const relationships: MsonRelationship[] = [
        {
          id: 'rel1',
          from: 'entity1',
          to: 'entity2',
          type: 'association',
          name: 'relatedEntity',
        },
      ];

      const schema = entityToSchema(entity, relationships, [entity, entity2]);

      // Should only have one 'relatedEntity' property (from attribute, not duplicated from relationship)
      const relatedEntityCount = Object.keys(schema).filter((k) => k === 'relatedEntity').length;
      expect(relatedEntityCount).toBe(1);
    });

    test('should handle aggregation and composition relationships', () => {
      const part: MsonEntity = {
        id: 'part',
        name: 'Part',
        type: 'class',
        attributes: [],
        methods: [],
      };

      const whole: MsonEntity = {
        id: 'whole',
        name: 'Whole',
        type: 'class',
        attributes: [],
        methods: [],
      };

      const relationships: MsonRelationship[] = [
        {
          id: 'rel1',
          from: 'whole',
          to: 'part',
          type: 'composition',
          multiplicity: { from: '1', to: '1..*' },
        },
      ];

      const wholeSchema = entityToSchema(whole, relationships, [part, whole]);
      const wholeModel = entityToModel(whole, relationships, [part, whole]);

      expect(wholeSchema.parts).toBe('collection');
      expect(wholeModel.parts).toEqual(['Part']);
    });
  });
});
