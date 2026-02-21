/**
 * Zod validation error conversion
 *
 * Converts Zod errors to ValidationError for consistent error interface.
 */
import type { ZodError, ZodIssue } from 'zod';
import { ValidationError } from '../base/ValidationError.js';

/**
 * Convert a Zod error to a ValidationError
 *
 * Extracts field path, value, and constraint from Zod error
 * and creates a consistent ValidationError instance.
 *
 * @param error - The Zod error to convert
 * @returns A ValidationError with extracted information
 */
export function fromZodError(error: ZodError): ValidationError {
  // Get the first issue (usually what we care about)
  const issues = error.issues;
  const issue = issues[0];

  if (!issue) {
    return new ValidationError('unknown', null, 'Unknown validation error');
  }

  // Build field path string
  const field = issue.path.length > 0 ? issue.path.join('.') : 'unknown';

  // Get the value that failed
  const value = (issue as ZodIssue & { received?: unknown }).received;

  // Get the constraint message
  const constraint = issue.message || 'Validation failed';

  return new ValidationError(field, value, constraint);
}

