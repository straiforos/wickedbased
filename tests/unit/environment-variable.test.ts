/**
 * Unit tests for EnvironmentVariable class
 */
import { describe, it, expect } from 'vitest';
import { EnvironmentVariable } from '../../src/config/EnvironmentVariable';
import { ZodError } from 'zod';

describe('EnvironmentVariable', () => {
  describe('constructor with valid values', () => {
    it('should create environment variable with string value and defaults', () => {
      const envVar = new EnvironmentVariable({
        key: 'DATABASE_URL',
        value: 'postgresql://localhost:5432/db'
      });

      expect(envVar.key).toBe('DATABASE_URL');
      expect(envVar.value).toBe('postgresql://localhost:5432/db');
      expect(envVar.type).toBe('GENERAL');
      expect(envVar.scope).toBe('RUN_TIME');
    });

    it('should create environment variable with all fields specified', () => {
      const envVar = new EnvironmentVariable({
        key: 'API_KEY',
        value: 'secret-key-123',
        type: 'SECRET',
        scope: 'BUILD_TIME'
      });

      expect(envVar.key).toBe('API_KEY');
      expect(envVar.value).toBe('secret-key-123');
      expect(envVar.type).toBe('SECRET');
      expect(envVar.scope).toBe('BUILD_TIME');
    });

    it('should accept GENERAL type', () => {
      const envVar = new EnvironmentVariable({
        key: 'PORT',
        value: '3000',
        type: 'GENERAL',
        scope: 'RUN_TIME'
      });

      expect(envVar.type).toBe('GENERAL');
    });

    it('should accept SECRET type', () => {
      const envVar = new EnvironmentVariable({
        key: 'PASSWORD',
        value: 'secret',
        type: 'SECRET',
        scope: 'RUN_TIME'
      });

      expect(envVar.type).toBe('SECRET');
    });

    it('should accept RUN_TIME scope', () => {
      const envVar = new EnvironmentVariable({
        key: 'RUNTIME_VAR',
        value: 'value',
        scope: 'RUN_TIME'
      });

      expect(envVar.scope).toBe('RUN_TIME');
    });

    it('should accept BUILD_TIME scope', () => {
      const envVar = new EnvironmentVariable({
        key: 'BUILD_VAR',
        value: 'value',
        scope: 'BUILD_TIME'
      });

      expect(envVar.scope).toBe('BUILD_TIME');
    });

    it('should accept DEPLOY_TIME scope', () => {
      const envVar = new EnvironmentVariable({
        key: 'DEPLOY_VAR',
        value: 'value',
        scope: 'DEPLOY_TIME'
      });

      expect(envVar.scope).toBe('DEPLOY_TIME');
    });

    it('should accept Pulumi Output-like values', () => {
      class MockOutput {
        constructor(private val: string) {}
        then(fn: (v: string) => any) { return Promise.resolve(fn(this.val)); }
        isSecret = false;
      }

      const pulumiValue = new MockOutput('pulumi-value');
      const envVar = new EnvironmentVariable({
        key: 'PULUMI_VAR',
        value: pulumiValue as any
      });

      expect(envVar.value).toBe(pulumiValue);
    });
  });

  describe('constructor validation errors', () => {
    it('should throw ZodError for missing key', () => {
      expect(() => new EnvironmentVariable({
        key: '' as any,
        value: 'value'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for undefined key', () => {
      expect(() => new EnvironmentVariable({
        key: undefined as any,
        value: 'value'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for null key', () => {
      expect(() => new EnvironmentVariable({
        key: null as any,
        value: 'value'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for empty key', () => {
      expect(() => new EnvironmentVariable({
        key: '',
        value: 'value'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for whitespace-only key', () => {
      expect(() => new EnvironmentVariable({
        key: '   ',
        value: 'value'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for missing value', () => {
      expect(() => new EnvironmentVariable({
        key: 'TEST_VAR',
        value: undefined as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for null value', () => {
      expect(() => new EnvironmentVariable({
        key: 'TEST_VAR',
        value: null as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for invalid type', () => {
      expect(() => new EnvironmentVariable({
        key: 'TEST_VAR',
        value: 'value',
        type: 'INVALID' as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for invalid scope', () => {
      expect(() => new EnvironmentVariable({
        key: 'TEST_VAR',
        value: 'value',
        scope: 'INVALID' as any
      })).toThrow(ZodError);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON with all fields', () => {
      const envVar = new EnvironmentVariable({
        key: 'API_KEY',
        value: 'secret-key-123',
        type: 'SECRET',
        scope: 'RUN_TIME'
      });

      const json = envVar.toJSON();

      expect(json).toEqual({
        key: 'API_KEY',
        value: 'secret-key-123',
        type: 'SECRET',
        scope: 'RUN_TIME'
      });
    });

    it('should serialize to JSON with defaults', () => {
      const envVar = new EnvironmentVariable({
        key: 'PORT',
        value: '3000'
      });

      const json = envVar.toJSON();

      expect(json).toEqual({
        key: 'PORT',
        value: '3000',
        type: 'GENERAL',
        scope: 'RUN_TIME'
      });
    });

    it('should handle Pulumi Output values in JSON', () => {
      class MockOutput {
        constructor(private val: string) {}
        then(fn: (v: string) => any) { return Promise.resolve(fn(this.val)); }
        isSecret = false;
      }

      const pulumiValue = new MockOutput('pulumi-value');
      const envVar = new EnvironmentVariable({
        key: 'PULUMI_VAR',
        value: pulumiValue as any
      });

      const json = envVar.toJSON();

      expect(json.key).toBe('PULUMI_VAR');
      expect(json.value).toBe(pulumiValue);
      expect(json.type).toBe('GENERAL');
      expect(json.scope).toBe('RUN_TIME');
    });
  });

  describe('edge cases', () => {
    it('should accept very long key names', () => {
      const longKey = 'A'.repeat(1000);
      const envVar = new EnvironmentVariable({
        key: longKey,
        value: 'value'
      });

      expect(envVar.key).toBe(longKey);
    });

    it('should accept very long values', () => {
      const longValue = 'x'.repeat(10000);
      const envVar = new EnvironmentVariable({
        key: 'LONG_VAR',
        value: longValue
      });

      expect(envVar.value).toBe(longValue);
    });

    it('should accept special characters in values', () => {
      const specialValue = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/`~';
      const envVar = new EnvironmentVariable({
        key: 'SPECIAL_VAR',
        value: specialValue
      });

      expect(envVar.value).toBe(specialValue);
    });

    it('should accept newlines in values', () => {
      const multilineValue = 'line1\nline2\nline3';
      const envVar = new EnvironmentVariable({
        key: 'MULTILINE_VAR',
        value: multilineValue
      });

      expect(envVar.value).toBe(multilineValue);
    });
  });
});
