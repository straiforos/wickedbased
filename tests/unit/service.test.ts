/**
 * Unit tests for Service class
 */
import { describe, it, expect } from 'vitest';
import { Service } from '../../src/resources/Service';
import { EnvironmentVariable } from '../../src/config/EnvironmentVariable';
import { HealthCheck } from '../../src/config/HealthCheck';
import { DockerImage } from '../../src/config/DockerImage';
import { GitHubSource } from '../../src/config/GitHubSource';
import { VolumeMount } from '../../src/config/VolumeMount';
import { ZodError } from 'zod';

describe('Service', () => {
  describe('constructor with valid values', () => {
    it('should create Service with required fields only', () => {
      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1
      });

      expect(service.name).toBe('my-service');
      expect(service.instanceSizeSlug).toBe('basic-xxs');
      expect(service.instanceCount).toBe(1);
      expect(service.httpPort).toBe(undefined);
      expect(service.internalPorts).toBe(undefined);
      expect(service.healthCheck).toBe(undefined);
      expect(service.runCommand).toBe(undefined);
      expect(service.volumes).toBe(undefined);
      expect(service.source).toBe(undefined);
      expect(service.listEnvs()).toEqual([]);
    });

    it('should create Service with all fields', () => {
      const envVar = new EnvironmentVariable({
        key: 'PORT',
        value: '3000'
      });
      const healthCheck = new HealthCheck({
        httpPath: '/',
        port: 3000
      });
      const source = new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: 'nginx',
        tag: 'latest'
      });
      const volume = new VolumeMount({
        name: 'data',
        mountPath: '/data'
      });

      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'professional-xs',
        instanceCount: 2,
        httpPort: 8080,
        internalPorts: [8081, 8082],
        healthCheck,
        runCommand: 'npm start',
        volumes: [volume],
        source,
        envs: [envVar]
      });

      expect(service.name).toBe('my-service');
      expect(service.instanceSizeSlug).toBe('professional-xs');
      expect(service.instanceCount).toBe(2);
      expect(service.httpPort).toBe(8080);
      expect(service.internalPorts).toEqual([8081, 8082]);
      expect(service.healthCheck).toBe(healthCheck);
      expect(service.runCommand).toBe('npm start');
      expect(service.volumes).toEqual([volume]);
      expect(service.source).toBe(source);
      expect(service.listEnvs()).toEqual([envVar]);
    });

    it('should accept common instance size slugs', () => {
      const slugs = [
        'basic-xxs',
        'basic-xs',
        'basic-s',
        'basic-m',
        'professional-xs',
        'professional-s',
        'professional-m',
        'professional-l'
      ];

      slugs.forEach(slug => {
        const service = new Service({
          name: 'my-service',
          instanceSizeSlug: slug,
          instanceCount: 1
        });

        expect(service.instanceSizeSlug).toBe(slug);
      });
    });

    it('should accept instance count of 1', () => {
      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1
      });

      expect(service.instanceCount).toBe(1);
    });

    it('should accept large instance count', () => {
      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 100
      });

      expect(service.instanceCount).toBe(100);
    });

    it('should accept DockerImage source', () => {
      const source = new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: 'nginx',
        tag: 'latest'
      });

      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1,
        source
      });

      expect(service.source).toBe(source);
    });

    it('should accept GitHubSource', () => {
      const source = new GitHubSource({
        repo: 'owner/repo',
        branch: 'main'
      });

      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1,
        source
      });

      expect(service.source).toBe(source);
    });

    it('should accept environment variables', () => {
      const envs = [
        new EnvironmentVariable({ key: 'PORT', value: '3000' }),
        new EnvironmentVariable({ key: 'HOST', value: 'localhost' })
      ];

      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1,
        envs
      });

      expect(service.listEnvs()).toEqual(envs);
    });
  });

  describe('constructor validation errors', () => {
    it('should throw ZodError for missing name', () => {
      expect(() => new Service({
        name: '' as any,
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1
      })).toThrow(ZodError);
    });

    it('should throw ZodError for missing instanceSizeSlug', () => {
      expect(() => new Service({
        name: 'my-service',
        instanceSizeSlug: '' as any,
        instanceCount: 1
      })).toThrow(ZodError);
    });

    it('should throw ZodError for missing instanceCount', () => {
      expect(() => new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: undefined as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for instanceCount 0', () => {
      expect(() => new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 0 as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for negative instanceCount', () => {
      expect(() => new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: -1 as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for non-integer instanceCount', () => {
      expect(() => new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1.5 as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for httpPort 0', () => {
      expect(() => new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1,
        httpPort: 0 as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for httpPort 65536', () => {
      expect(() => new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1,
        httpPort: 65536 as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for negative internalPorts', () => {
      expect(() => new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1,
        internalPorts: [-1 as any]
      })).toThrow(ZodError);
    });

    it('should throw ZodError for internalPorts out of range', () => {
      expect(() => new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1,
        internalPorts: [65536 as any]
      })).toThrow(ZodError);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON with required fields', () => {
      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1
      });

      const json = service.toJSON();

      expect(json).toEqual({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1,
        envs: []
      });
    });

    it('should serialize to JSON with all fields', () => {
      const envVar = new EnvironmentVariable({
        key: 'PORT',
        value: '3000'
      });
      const healthCheck = new HealthCheck({
        httpPath: '/',
        port: 3000
      });
      const source = new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: 'nginx',
        tag: 'latest'
      });
      const volume = new VolumeMount({
        name: 'data',
        mountPath: '/data'
      });

      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'professional-xs',
        instanceCount: 2,
        httpPort: 8080,
        internalPorts: [8081, 8082],
        healthCheck,
        runCommand: 'npm start',
        volumes: [volume],
        source,
        envs: [envVar]
      });

      const json = service.toJSON();

      expect(json).toEqual({
        name: 'my-service',
        instanceSizeSlug: 'professional-xs',
        instanceCount: 2,
        httpPort: 8080,
        internalPorts: [8081, 8082],
        healthCheck: healthCheck.toJSON(),
        runCommand: 'npm start',
        volumes: [volume.toJSON()],
        source: source.toJSON(),
        envs: [envVar.toJSON()]
      });
    });

    it('should omit optional fields when undefined', () => {
      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1
      });

      const json = service.toJSON();

      expect(json).not.toHaveProperty('httpPort');
      expect(json).not.toHaveProperty('internalPorts');
      expect(json).not.toHaveProperty('healthCheck');
      expect(json).not.toHaveProperty('runCommand');
      expect(json).not.toHaveProperty('volumes');
      expect(json).not.toHaveProperty('source');
    });
  });

  describe('environment variable management', () => {
    it('should add environment variable', () => {
      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1
      });

      const envVar = new EnvironmentVariable({
        key: 'PORT',
        value: '3000'
      });

      service.addEnv(envVar);

      expect(service.getEnv('PORT')).toBe(envVar);
      expect(service.listEnvs()).toEqual([envVar]);
    });

    it('should throw when adding duplicate environment variable', () => {
      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1,
        envs: [
          new EnvironmentVariable({ key: 'PORT', value: '3000' })
        ]
      });

      expect(() => {
        service.addEnv(new EnvironmentVariable({ key: 'PORT', value: '8080' }));
      }).toThrow(ZodError);
    });

    it('should remove environment variable', () => {
      const envVar = new EnvironmentVariable({
        key: 'PORT',
        value: '3000'
      });

      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1,
        envs: [envVar]
      });

      const removed = service.removeEnv('PORT');

      expect(removed).toBe(true);
      expect(service.getEnv('PORT')).toBe(undefined);
      expect(service.listEnvs()).toEqual([]);
    });

    it('should return false when removing non-existent environment variable', () => {
      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1
      });

      const removed = service.removeEnv('PORT');

      expect(removed).toBe(false);
    });

    it('should get environment variable', () => {
      const envVar = new EnvironmentVariable({
        key: 'PORT',
        value: '3000'
      });

      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1,
        envs: [envVar]
      });

      expect(service.getEnv('PORT')).toBe(envVar);
    });

    it('should return undefined for non-existent environment variable', () => {
      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1
      });

      expect(service.getEnv('PORT')).toBe(undefined);
    });

    it('should return immutable list of environment variables', () => {
      const envVar = new EnvironmentVariable({
        key: 'PORT',
        value: '3000'
      });

      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1,
        envs: [envVar]
      });

      const list = service.listEnvs();
      // Modifying the returned list should not affect the service
      list.push(new EnvironmentVariable({ key: 'NEW_VAR', value: 'value' }));

      expect(service.listEnvs()).toEqual([envVar]);
      expect(service.listEnvs().length).toBe(1);
    });
  });

  describe('toYAML', () => {
    it('should convert service to YAML', async () => {
      const envVar = new EnvironmentVariable({
        key: 'PORT',
        value: '3000'
      });

      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1,
        envs: [envVar]
      });

      const yaml = await service.toYAML();

      expect(yaml).toContain('name: my-service');
      expect(yaml).toContain('instance_size_slug: basic-xxs');
      expect(yaml).toContain('instance_count: 1');
      expect(yaml).toContain('key: PORT');
      // js-yaml uses single quotes for simple strings
      expect(yaml).toContain('value: \'3000\'');
    });
  });

  describe('edge cases', () => {
    it('should accept very long service names', () => {
      const longName = 'a'.repeat(200);
      const service = new Service({
        name: longName,
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1
      });

      expect(service.name).toBe(longName);
    });

    it('should accept many internal ports', () => {
      const ports = Array.from({ length: 100 }, (_, i) => 8000 + i);
      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1,
        internalPorts: ports
      });

      expect(service.internalPorts).toEqual(ports);
    });

    it('should accept empty volumes array', () => {
      const service = new Service({
        name: 'my-service',
        instanceSizeSlug: 'basic-xxs',
        instanceCount: 1,
        volumes: []
      });

      expect(service.volumes).toEqual([]);
    });
  });
});
