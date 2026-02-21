/**
 * Key transformation utilities for JSON to YAML serialization
 *
 * Converts camelCase keys to snake_case for DigitalOcean App Platform API compatibility.
 */

/**
 * Converts a camelCase string to snake_case
 *
 * Examples:
 * - instanceSizeSlug → instance_size_slug
 * - httpPath → http_path
 * - deployOnPush → deploy_on_push
 *
 * @param str - The camelCase string to convert
 * @returns The snake_case string
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Recursively transforms all keys in an object from camelCase to snake_case
 *
 * Handles nested objects and arrays. Skips transformation for special keys
 * that should remain in camelCase (like envs key values).
 *
 * @param obj - The object to transform
 * @returns A new object with all keys transformed
 */
export function transformKeys(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item));
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Transform camelCase to snake_case
      const transformedKey = camelToSnake(key);

      // Recursively transform nested values
      result[transformedKey] = transformKeys(value);
    }

    return result;
  }

  return obj;
}

/**
 * Filters out undefined and null values from an object
 *
 * Used to clean up JSON objects before serialization, removing optional
 * fields that weren't specified.
 *
 * @param obj - The object to filter
 * @returns A new object with undefined/null values removed
 */
export function removeEmpty(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (Array.isArray(obj)) {
    const filtered = obj
      .map(item => removeEmpty(item))
      .filter(item => item !== undefined && item !== null);

    // Return undefined if array becomes empty after filtering
    return filtered.length > 0 ? filtered : undefined;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const filteredValue = removeEmpty(value);

      // Only include the key if the filtered value is defined
      if (filteredValue !== undefined && filteredValue !== null) {
        result[key] = filteredValue;
      }
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  return obj;
}

/**
 * Checks if a value is a Pulumi Output
 *
 * Pulumi Outputs have a special structure that needs to be resolved
 * during serialization. This check is conservative and looks for common
 * Pulumi Output characteristics.
 *
 * @param value - The value to check
 * @returns True if the value appears to be a Pulumi Output
 */
export function isPulumiOutput(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    'isSecret' in (value as object) &&
    'then' in (value as object)
  );
}
