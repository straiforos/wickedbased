/**
 * Custom error class for validation failures
 *
 * Provides detailed information about validation errors including the field name,
 * the invalid value, and the constraint that was violated.
 */
export class ValidationError extends Error {
  /**
   * The name of the field that failed validation
   */
  readonly field: string;

  /**
   * The value that was provided (failed validation)
   */
  readonly value: unknown;

  /**
   * The constraint that was violated (e.g., "must be non-empty", "must be a positive integer")
   */
  readonly constraint: string;

  /**
   * Creates a new ValidationError instance
   *
   * @param field - The name of the field that failed validation
   * @param value - The value that was provided
   * @param constraint - The constraint that was violated
   */
  constructor(field: string, value: unknown, constraint: string) {
    super(`Validation failed for field "${field}": ${constraint}`);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.constraint = constraint;

    // Maintains proper stack trace in Node.js
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Returns a string representation of the validation error
   */
  toString(): string {
    return `ValidationError: Field "${this.field}" with value ${JSON.stringify(this.value)} - ${this.constraint}`;
  }
}
