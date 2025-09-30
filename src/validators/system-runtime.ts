/**
 * System Runtime Validation Module
 * Validates System Runtime bundles for correctness and compatibility
 */

import { SystemRuntimeBundleSchema } from '../schemas.js';
import type { SystemRuntimeBundle, ValidationWarning } from '../types.js';

/**
 * Validation result interface
 */
export interface SystemRuntimeValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
  bundle?: SystemRuntimeBundle;
}

/**
 * Validate a System Runtime bundle
 * Performs both schema validation and semantic validation
 * @param bundle - The bundle to validate (unknown type for safety)
 * @returns Validation result with warnings and validated bundle if successful
 */
export function validateSystemRuntimeBundle(bundle: unknown): SystemRuntimeValidationResult {
  const warnings: ValidationWarning[] = [];

  // Schema validation
  const result = SystemRuntimeBundleSchema.safeParse(bundle);
  if (!result.success) {
    return {
      isValid: false,
      warnings: [
        {
          message: `Bundle schema validation failed: ${result.error.message}`,
          severity: 'error',
        },
      ],
    };
  }

  const validatedBundle = result.data;

  // Semantic validation
  validateSchemaReferences(validatedBundle, warnings);
  validateComponentTypes(validatedBundle, warnings);
  validateBehaviorReferences(validatedBundle, warnings);
  validateUniqueIds(validatedBundle, warnings);
  validateInheritanceChains(validatedBundle, warnings);
  validateMethodSignatures(validatedBundle, warnings);

  return {
    isValid: warnings.filter((w) => w.severity === 'error').length === 0,
    warnings,
    bundle: validatedBundle,
  };
}

/**
 * Validate that all schema references in models exist
 * @param bundle - The validated bundle
 * @param warnings - Array to collect warnings
 */
function validateSchemaReferences(
  bundle: SystemRuntimeBundle,
  warnings: ValidationWarning[]
): void {
  const schemaNames = new Set(Object.values(bundle.schemas).map((s) => s._name));

  for (const model of Object.values(bundle.models)) {
    if (!schemaNames.has(model._name)) {
      warnings.push({
        message: `Model "${model._name}" references non-existent schema`,
        severity: 'error',
      });
    }
  }
}

/**
 * Validate that all component types have corresponding schemas
 * @param bundle - The validated bundle
 * @param warnings - Array to collect warnings
 */
function validateComponentTypes(bundle: SystemRuntimeBundle, warnings: ValidationWarning[]): void {
  const schemaNames = new Set(Object.values(bundle.schemas).map((s) => s._name));

  for (const componentType of Object.keys(bundle.components)) {
    if (!schemaNames.has(componentType)) {
      warnings.push({
        message: `Component type "${componentType}" has no corresponding schema`,
        severity: 'error',
      });
    }
  }
}

/**
 * Validate that all behavior component references exist
 * @param bundle - The validated bundle
 * @param warnings - Array to collect warnings
 */
function validateBehaviorReferences(
  bundle: SystemRuntimeBundle,
  warnings: ValidationWarning[]
): void {
  const schemaNames = new Set(Object.values(bundle.schemas).map((s) => s._name));
  const systemId = bundle._id;

  for (const behavior of Object.values(bundle.behaviors)) {
    // Behavior component can reference a schema name or the system ID
    if (behavior.component !== systemId && !schemaNames.has(behavior.component)) {
      warnings.push({
        message: `Behavior references non-existent component "${behavior.component}"`,
        severity: 'error',
      });
    }
  }
}

/**
 * Validate that all _id fields are unique across the bundle
 * @param bundle - The validated bundle
 * @param warnings - Array to collect warnings
 */
function validateUniqueIds(bundle: SystemRuntimeBundle, warnings: ValidationWarning[]): void {
  const ids = new Set<string>();

  // Check bundle ID
  if (ids.has(bundle._id)) {
    warnings.push({
      message: `Duplicate ID found: ${bundle._id}`,
      severity: 'error',
    });
  }
  ids.add(bundle._id);

  // Check schema IDs
  for (const schema of Object.values(bundle.schemas)) {
    if (ids.has(schema._id)) {
      warnings.push({
        message: `Duplicate schema ID found: ${schema._id}`,
        severity: 'error',
      });
    }
    ids.add(schema._id);
  }

  // Check model IDs
  for (const model of Object.values(bundle.models)) {
    if (ids.has(model._id)) {
      warnings.push({
        message: `Duplicate model ID found: ${model._id}`,
        severity: 'error',
      });
    }
    ids.add(model._id);
  }

  // Check type IDs
  for (const type of Object.values(bundle.types)) {
    if (ids.has(type._id)) {
      warnings.push({
        message: `Duplicate type ID found: ${type._id}`,
        severity: 'error',
      });
    }
    ids.add(type._id);
  }

  // Check behavior IDs
  for (const behavior of Object.values(bundle.behaviors)) {
    if (ids.has(behavior._id)) {
      warnings.push({
        message: `Duplicate behavior ID found: ${behavior._id}`,
        severity: 'error',
      });
    }
    ids.add(behavior._id);
  }

  // Check component instance IDs
  for (const componentType of Object.values(bundle.components)) {
    for (const component of Object.values(componentType)) {
      if (ids.has(component._id)) {
        warnings.push({
          message: `Duplicate component ID found: ${component._id}`,
          severity: 'error',
        });
      }
      ids.add(component._id);
    }
  }
}

/**
 * Validate version format (should follow semver)
 * @param version - The version string to validate
 * @returns True if valid semver format
 */
export function validateVersion(version: string): boolean {
  const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
  return semverRegex.test(version);
}

/**
 * Validate inheritance chains for circular references
 * @param bundle - The validated bundle
 * @param warnings - Array to collect warnings
 */
function validateInheritanceChains(
  bundle: SystemRuntimeBundle,
  warnings: ValidationWarning[]
): void {
  const schemaNames = new Set(Object.values(bundle.schemas).map((s) => s._name));

  for (const schema of Object.values(bundle.schemas)) {
    if (!schema._inherit) continue;

    // Check for circular inheritance
    const visited = new Set<string>();
    const checkCircular = (currentName: string): boolean => {
      if (visited.has(currentName)) {
        return true; // Circular reference detected
      }
      visited.add(currentName);

      const currentSchema = Object.values(bundle.schemas).find((s) => s._name === currentName);
      if (!currentSchema || !currentSchema._inherit) {
        return false;
      }

      for (const parent of currentSchema._inherit) {
        if (parent === '_Component') continue; // Skip base component
        if (checkCircular(parent)) {
          return true;
        }
      }
      return false;
    };

    if (checkCircular(schema._name)) {
      warnings.push({
        message: `Circular inheritance detected for schema "${schema._name}"`,
        severity: 'error',
      });
    }

    // Check that all inherited schemas exist
    for (const inheritedName of schema._inherit) {
      if (inheritedName !== '_Component' && !schemaNames.has(inheritedName)) {
        warnings.push({
          message: `Schema "${schema._name}" inherits from non-existent schema "${inheritedName}"`,
          severity: 'error',
        });
      }
    }
  }
}

/**
 * Validate method signatures in models
 * @param bundle - The validated bundle
 * @param warnings - Array to collect warnings
 */
function validateMethodSignatures(
  bundle: SystemRuntimeBundle,
  warnings: ValidationWarning[]
): void {
  for (const model of Object.values(bundle.models)) {
    for (const [key, value] of Object.entries(model)) {
      if (key === '_id' || key === '_name') continue;

      // Check if this is a method signature (has '=>' key)
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const signature = value as Record<string, unknown>;
        if ('=>' in signature) {
          // Validate that return type is specified
          if (typeof signature['=>'] !== 'string') {
            warnings.push({
              message: `Method "${key}" in model "${model._name}" has invalid return type`,
              severity: 'error',
            });
          }

          // Validate that all parameters have string types
          for (const [paramName, paramType] of Object.entries(signature)) {
            if (paramName !== '=>' && typeof paramType !== 'string') {
              warnings.push({
                message: `Method "${key}" in model "${model._name}" has invalid parameter type for "${paramName}"`,
                severity: 'error',
              });
            }
          }
        }
      }
    }
  }
}

/**
 * Quick validation check - just schema validation without semantic checks
 * @param bundle - The bundle to validate
 * @returns True if schema is valid
 */
export function isValidSystemRuntimeBundle(bundle: unknown): bundle is SystemRuntimeBundle {
  return SystemRuntimeBundleSchema.safeParse(bundle).success;
}
