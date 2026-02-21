/**
 * Main serialization logic for converting JSON objects to YAML
 *
 * Uses js-yaml for serialization with camelCase → snake_case transformation.
 * Handles Pulumi Outputs and filters out undefined/null values.
 */
import * as yaml from 'js-yaml';
import { transformKeys, removeEmpty, isPulumiOutput } from './transformers.js';

/**
 * Converts a JSON object to a YAML string
 *
 * Performs the following transformations:
 * 1. Removes undefined and null values
 * 2. Transforms all camelCase keys to snake_case
 * 3. Serializes to YAML using js-yaml
 *
 * @param obj - The JSON object to convert
 * @returns Promise that resolves to the YAML string
 */
export async function toYAML(obj: Record<string, unknown>): Promise<string> {
  // First, check if there are any Pulumi Outputs to resolve
  const pulumiOutputs = extractPulumiOutputs(obj);

  if (pulumiOutputs.length > 0) {
    // Use Pulumi's all() to resolve all outputs
    try {
      // Dynamically import pulumi only if available
      const pulumi = await importPulumi();
      const resolved = await pulumi.all(pulumiOutputs.map(o => o.value));

      // Create a mapping of outputs to their resolved values
      const resolvedMap = new Map(pulumiOutputs.map((output, index) => [output.value, resolved[index]]));

      // Replace Pulumi Outputs with their resolved values
      const objWithResolved = replacePulumiOutputs(obj, resolvedMap);

      // Remove empty values and transform keys
      const cleaned = removeEmpty(objWithResolved) as Record<string, unknown>;
      const transformed = transformKeys(cleaned);

      // Serialize to YAML
      return yaml.dump(transformed, {
        indent: 2,
        lineWidth: -1, // Don't wrap lines
        noRefs: true,
        sortKeys: false
      });
    } catch {
      // Pulumi not available or import failed, continue without resolution
      const cleaned = removeEmpty(obj) as Record<string, unknown>;
      const transformed = transformKeys(cleaned);
      return yaml.dump(transformed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
      });
    }
  }

  // No Pulumi Outputs, proceed directly
  const cleaned = removeEmpty(obj) as Record<string, unknown>;
  const transformed = transformKeys(cleaned);

  return yaml.dump(transformed, {
    indent: 2,
    lineWidth: -1, // Don't wrap lines
    noRefs: true,
    sortKeys: false
  });
}

/**
 * Extracts all Pulumi Outputs from an object
 *
 * Recursively searches through the object and collects all Pulumi Outputs.
 *
 * @param obj - The object to search
 * @param outputs - Accumulator for found outputs (internal use)
 * @returns Array of Pulumi Output objects with their paths
 */
function extractPulumiOutputs(
  obj: unknown,
  outputs: Array<{ value: unknown; path: string }> = []
): Array<{ value: unknown; path: string }> {
  if (isPulumiOutput(obj)) {
    outputs.push({ value: obj, path: '' });
  } else if (Array.isArray(obj)) {
    obj.forEach((item) => {
      extractPulumiOutputs(item, outputs);
    });
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [_, value] of Object.entries(obj)) {
      extractPulumiOutputs(value, outputs);
    }
  }

  return outputs;
}

/**
 * Replaces Pulumi Outputs with their resolved values
 *
 * Creates a deep copy of the object with all Pulumi Outputs replaced
 * by their resolved values from the mapping.
 *
 * @param obj - The object to process
 * @param resolvedMap - Mapping of Pulumi Outputs to resolved values
 * @returns New object with resolved values
 */
function replacePulumiOutputs(
  obj: unknown,
  resolvedMap: Map<unknown, unknown>
): unknown {
  if (isPulumiOutput(obj)) {
    return resolvedMap.get(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => replacePulumiOutputs(item, resolvedMap));
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      result[key] = replacePulumiOutputs(value, resolvedMap);
    }

    return result;
  }

  return obj;
}

/**
 * Dynamically imports the pulumi package
 *
 * @returns Promise that resolves to the pulumi module
 * @throws Error if pulumi is not installed
 */
async function importPulumi(): Promise<any> {
  try {
    return await import('@pulumi/pulumi');
  } catch {
    throw new Error(
      'Pulumi is required for resolving Pulumi Outputs. ' +
      'Install it with: npm install @pulumi/pulumi'
    );
  }
}

/**
 * Synchronous version of toYAML for cases without Pulumi Outputs
 *
 * This version is faster when you know there are no Pulumi Outputs
 * to resolve. Throws an error if Pulumi Outputs are found.
 *
 * @param obj - The JSON object to convert
 * @returns The YAML string
 * @throws Error if Pulumi Outputs are found
 */
export function toYAMLSync(obj: Record<string, unknown>): string {
  // Check for Pulumi Outputs
  const pulumiOutputs = extractPulumiOutputs(obj);
  if (pulumiOutputs.length > 0) {
    throw new Error(
      'Pulumi Outputs found. Use async toYAML() instead to resolve them.'
    );
  }

  // Remove empty values and transform keys
  const cleaned = removeEmpty(obj) as Record<string, unknown>;
  const transformed = transformKeys(cleaned);

  return yaml.dump(transformed, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false
  });
}
