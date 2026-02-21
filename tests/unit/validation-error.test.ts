/**
 * Unit tests for ValidationError class
 */
import { describe, it, expect } from 'vitest';
import { ValidationError } from '../../src/base/ValidationError';

describe('ValidationError', () => {
  describe('constructor', () => {
    it('should create an error with all properties', () => {
      const error = new ValidationError('testField', 'invalidValue', 'must be valid');

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ValidationError');
      expect(error.field).toBe('testField');
      expect(error.value).toBe('invalidValue');
      expect(error.constraint).toBe('must be valid');
    });

    it('should have correct error message', () => {
      const error = new ValidationError('testField', 'invalidValue', 'must be valid');

      expect(error.message).toBe('Validation failed for field "testField": must be valid');
    });

    it('should handle undefined values', () => {
      const error = new ValidationError('testField', undefined, 'is required');

      expect(error.field).toBe('testField');
      expect(error.value).toBe(undefined);
      expect(error.constraint).toBe('is required');
    });

    it('should handle null values', () => {
      const error = new ValidationError('testField', null, 'is required');

      expect(error.field).toBe('testField');
      expect(error.value).toBe(null);
      expect(error.constraint).toBe('is required');
    });

    it('should handle object values', () => {
      const obj = { nested: 'value' };
      const error = new ValidationError('testField', obj, 'has invalid format');

      expect(error.value).toEqual(obj);
    });

    it('should handle array values', () => {
      const arr = [1, 2, 3];
      const error = new ValidationError('testField', arr, 'must be non-empty');

      expect(error.value).toEqual(arr);
    });
  });

  describe('toString', () => {
    it('should return a string representation', () => {
      const error = new ValidationError('testField', 'invalidValue', 'must be valid');
      const str = error.toString();

      expect(str).toBe('ValidationError: Field "testField" with value "invalidValue" - must be valid');
    });

    it('should handle string values in toString', () => {
      const error = new ValidationError('testField', 'hello', 'must be uppercase');
      const str = error.toString();

      expect(str).toBe('ValidationError: Field "testField" with value "hello" - must be uppercase');
    });

    it('should handle number values in toString', () => {
      const error = new ValidationError('testField', 42, 'must be positive');
      const str = error.toString();

      expect(str).toBe('ValidationError: Field "testField" with value 42 - must be positive');
    });

    it('should handle boolean values in toString', () => {
      const error = new ValidationError('testField', true, 'must be false');
      const str = error.toString();

      expect(str).toBe('ValidationError: Field "testField" with value true - must be false');
    });

    it('should handle undefined values in toString', () => {
      const error = new ValidationError('testField', undefined, 'is required');
      const str = error.toString();

      expect(str).toBe('ValidationError: Field "testField" with value undefined - is required');
    });
  });

  describe('error stack trace', () => {
    it('should maintain proper stack trace', () => {
      const error = new ValidationError('testField', 'invalidValue', 'must be valid');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ValidationError');
    });
  });

  describe('instanceof checks', () => {
    it('should be an instance of Error', () => {
      const error = new ValidationError('testField', 'invalidValue', 'must be valid');

      expect(error instanceof Error).toBe(true);
    });

    it('should be an instance of ValidationError', () => {
      const error = new ValidationError('testField', 'invalidValue', 'must be valid');

      expect(error instanceof ValidationError).toBe(true);
    });
  });
});
