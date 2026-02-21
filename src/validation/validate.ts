/**
 * Validation helper using Zod schemas
 *
 * Provides a simple API for validating configuration objects
 * using Zod schemas and converting errors to consistent format.
 */
import { fromZodError } from './ZodError.js';
import { ValidationError } from '../base/ValidationError.js';
import type { z } from 'zod';

/**
 * Validate an object against a Zod schema
 *
 * Parses the input using the schema and throws a ValidationError
 * if validation fails.
 *
 * @param schema - The Zod schema to validate against
 * @param input - The input to validate
 * @returns The parsed and validated data
 * @throws ValidationError if validation fails
 */
export function validate<T>(
  schema: z.ZodType<T>,
  input: unknown
): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw fromZodError(result.error);
  }

  return result.data;
}

/**
 * Validate an object against a Zod schema with a specific prefix
 *
 * Useful for validating nested configurations like service.source
 *
 * @param schema - The Zod schema to validate against
 * @param input - The input to validate
 * @param prefix - Field prefix for error messages
 * @returns The parsed and validated data
 * @throws ValidationError if validation fails
 */
export function validateWithPrefix<T>(
  schema: z.ZodType<T>,
  input: unknown,
  prefix: string
): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    const error = fromZodError(result.error);
    // Prefix the field name with the provided prefix
    throw new ValidationError(
      `${prefix}.${error.field}`,
      error.value,
      error.constraint
    );
  }

  return result.data;
}
