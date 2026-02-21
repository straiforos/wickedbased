/**
 * Unit tests for HealthCheck class
 */
import { describe, it, expect } from 'vitest';
import { HealthCheck } from '../../src/config/HealthCheck';
import { ZodError } from 'zod';

describe('HealthCheck', () => {
  describe('constructor with valid values', () => {
    it('should create health check with required fields only', () => {
      const healthCheck = new HealthCheck({
        httpPath: '/',
        port: 3000
      });

      expect(healthCheck.httpPath).toBe('/');
      expect(healthCheck.port).toBe(3000);
      expect(healthCheck.initialDelaySeconds).toBe(0);
      expect(healthCheck.periodSeconds).toBe(10);
      expect(healthCheck.timeoutSeconds).toBe(1);
      expect(healthCheck.successThreshold).toBe(1);
      expect(healthCheck.failureThreshold).toBe(3);
    });

    it('should create health check with all fields specified', () => {
      const healthCheck = new HealthCheck({
        httpPath: '/health',
        port: 8080,
        initialDelaySeconds: 30,
        periodSeconds: 15,
        timeoutSeconds: 5,
        successThreshold: 2,
        failureThreshold: 5
      });

      expect(healthCheck.httpPath).toBe('/health');
      expect(healthCheck.port).toBe(8080);
      expect(healthCheck.initialDelaySeconds).toBe(30);
      expect(healthCheck.periodSeconds).toBe(15);
      expect(healthCheck.timeoutSeconds).toBe(5);
      expect(healthCheck.successThreshold).toBe(2);
      expect(healthCheck.failureThreshold).toBe(5);
    });

    it('should accept port 1', () => {
      const healthCheck = new HealthCheck({
        httpPath: '/',
        port: 1
      });

      expect(healthCheck.port).toBe(1);
    });

    it('should accept port 65535', () => {
      const healthCheck = new HealthCheck({
        httpPath: '/',
        port: 65535
      });

      expect(healthCheck.port).toBe(65535);
    });

    it('should accept common HTTP ports', () => {
      const ports = [80, 443, 3000, 8080, 5000];

      ports.forEach(port => {
        const healthCheck = new HealthCheck({
          httpPath: '/',
          port
        });
        expect(healthCheck.port).toBe(port);
      });
    });

    it('should accept various httpPath values', () => {
      const paths = ['/', '/health', '/api/healthz', '/status', '/ping'];

      paths.forEach(path => {
        const healthCheck = new HealthCheck({
          httpPath: path,
          port: 3000
        });
        expect(healthCheck.httpPath).toBe(path);
      });
    });

    it('should accept zero initialDelaySeconds', () => {
      const healthCheck = new HealthCheck({
        httpPath: '/',
        port: 3000,
        initialDelaySeconds: 0
      });

      expect(healthCheck.initialDelaySeconds).toBe(0);
    });

    it('should accept large timing values', () => {
      const healthCheck = new HealthCheck({
        httpPath: '/',
        port: 3000,
        initialDelaySeconds: 300,
        periodSeconds: 60,
        timeoutSeconds: 30,
        successThreshold: 10,
        failureThreshold: 20
      });

      expect(healthCheck.initialDelaySeconds).toBe(300);
      expect(healthCheck.periodSeconds).toBe(60);
      expect(healthCheck.timeoutSeconds).toBe(30);
      expect(healthCheck.successThreshold).toBe(10);
      expect(healthCheck.failureThreshold).toBe(20);
    });
  });

  describe('constructor validation errors', () => {
    it('should throw ZodError for missing httpPath', () => {
      expect(() => new HealthCheck({
        httpPath: '' as any,
        port: 3000
      })).toThrow(ZodError);
    });

    it('should throw ZodError for undefined httpPath', () => {
      expect(() => new HealthCheck({
        httpPath: undefined as any,
        port: 3000
      })).toThrow(ZodError);
    });

    it('should throw ZodError for null httpPath', () => {
      expect(() => new HealthCheck({
        httpPath: null as any,
        port: 3000
      })).toThrow(ZodError);
    });

    it('should throw ZodError for empty httpPath', () => {
      expect(() => new HealthCheck({
        httpPath: '',
        port: 3000
      })).toThrow(ZodError);
    });

    it('should throw ZodError for whitespace-only httpPath', () => {
      expect(() => new HealthCheck({
        httpPath: '   ',
        port: 3000
      })).toThrow(ZodError);
    });

    it('should throw ZodError for missing port', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: undefined as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for port 0', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 0 as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for port -1', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: -1 as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for port 65536', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 65536 as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for negative initialDelaySeconds', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 3000,
        initialDelaySeconds: -1
      })).toThrow(ZodError);
    });

    it('should throw ZodError for non-integer initialDelaySeconds', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 3000,
        initialDelaySeconds: 1.5 as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for zero periodSeconds', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 3000,
        periodSeconds: 0
      })).toThrow(ZodError);
    });

    it('should throw ZodError for negative periodSeconds', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 3000,
        periodSeconds: -1
      })).toThrow(ZodError);
    });

    it('should throw ZodError for non-integer periodSeconds', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 3000,
        periodSeconds: 1.5 as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for zero timeoutSeconds', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 3000,
        timeoutSeconds: 0
      })).toThrow(ZodError);
    });

    it('should throw ZodError for negative timeoutSeconds', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 3000,
        timeoutSeconds: -1
      })).toThrow(ZodError);
    });

    it('should throw ZodError for non-integer timeoutSeconds', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 3000,
        timeoutSeconds: 1.5 as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for zero successThreshold', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 3000,
        successThreshold: 0
      })).toThrow(ZodError);
    });

    it('should throw ZodError for negative successThreshold', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 3000,
        successThreshold: -1
      })).toThrow(ZodError);
    });

    it('should throw ZodError for non-integer successThreshold', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 3000,
        successThreshold: 1.5 as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for zero failureThreshold', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 3000,
        failureThreshold: 0
      })).toThrow(ZodError);
    });

    it('should throw ZodError for negative failureThreshold', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 3000,
        failureThreshold: -1
      })).toThrow(ZodError);
    });

    it('should throw ZodError for non-integer failureThreshold', () => {
      expect(() => new HealthCheck({
        httpPath: '/',
        port: 3000,
        failureThreshold: 1.5 as any
      })).toThrow(ZodError);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON with required fields and defaults', () => {
      const healthCheck = new HealthCheck({
        httpPath: '/',
        port: 3000
      });

      const json = healthCheck.toJSON();

      expect(json).toEqual({
        httpPath: '/',
        port: 3000,
        initialDelaySeconds: 0,
        periodSeconds: 10,
        timeoutSeconds: 1,
        successThreshold: 1,
        failureThreshold: 3
      });
    });

    it('should serialize to JSON with all fields', () => {
      const healthCheck = new HealthCheck({
        httpPath: '/health',
        port: 8080,
        initialDelaySeconds: 30,
        periodSeconds: 15,
        timeoutSeconds: 5,
        successThreshold: 2,
        failureThreshold: 5
      });

      const json = healthCheck.toJSON();

      expect(json).toEqual({
        httpPath: '/health',
        port: 8080,
        initialDelaySeconds: 30,
        periodSeconds: 15,
        timeoutSeconds: 5,
        successThreshold: 2,
        failureThreshold: 5
      });
    });
  });

  describe('edge cases', () => {
    it('should accept complex httpPath with query params', () => {
      const healthCheck = new HealthCheck({
        httpPath: '/health?token=abc123&verbose=true',
        port: 3000
      });

      expect(healthCheck.httpPath).toBe('/health?token=abc123&verbose=true');
    });

    it('should accept httpPath with hash fragments', () => {
      const healthCheck = new HealthCheck({
        httpPath: '/health#section',
        port: 3000
      });

      expect(healthCheck.httpPath).toBe('/health#section');
    });
  });
});
