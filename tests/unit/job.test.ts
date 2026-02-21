/**
 * Unit tests for Job class
 */
import { describe, it, expect } from 'vitest';
import { Job } from '../../src/resources/Job';
import { EnvironmentVariable } from '../../src/config/EnvironmentVariable';
import { DockerImage } from '../../src/config/DockerImage';
import { GitHubSource } from '../../src/config/GitHubSource';
import { ZodError } from 'zod';

describe('Job', () => {
  describe('constructor with valid values', () => {
    it('should create Job with required fields only', () => {
      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate'
      });

      expect(job.name).toBe('my-job');
      expect(job.kind).toBe('PRE_DEPLOY');
      expect(job.runCommand).toBe('npm run migrate');
      expect(job.instanceSizeSlug).toBe(undefined);
      expect(job.instanceCount).toBe(undefined);
      expect(job.source).toBe(undefined);
      expect(job.listEnvs()).toEqual([]);
    });

    it('should create Job with all fields', () => {
      const envVar = new EnvironmentVariable({
        key: 'DATABASE_URL',
        value: 'postgresql://localhost:5432/db'
      });
      const source = new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: 'node',
        tag: '20-alpine'
      });

      const job = new Job({
        name: 'my-job',
        kind: 'POST_DEPLOY',
        runCommand: 'npx prisma migrate deploy',
        instanceSizeSlug: 'professional-xs',
        instanceCount: 2,
        source,
        envs: [envVar]
      });

      expect(job.name).toBe('my-job');
      expect(job.kind).toBe('POST_DEPLOY');
      expect(job.runCommand).toBe('npx prisma migrate deploy');
      expect(job.instanceSizeSlug).toBe('professional-xs');
      expect(job.instanceCount).toBe(2);
      expect(job.source).toBe(source);
      expect(job.listEnvs()).toEqual([envVar]);
    });

    it('should accept PRE_DEPLOY kind', () => {
      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate'
      });

      expect(job.kind).toBe('PRE_DEPLOY');
    });

    it('should accept POST_DEPLOY kind', () => {
      const job = new Job({
        name: 'my-job',
        kind: 'POST_DEPLOY',
        runCommand: 'npm run seed'
      });

      expect(job.kind).toBe('POST_DEPLOY');
    });

    it('should accept common instance size slugs', () => {
      const slugs = [
        'basic-xxs',
        'basic-xs',
        'basic-s',
        'professional-xs',
        'professional-s'
      ];

      slugs.forEach(slug => {
        const job = new Job({
          name: 'my-job',
          kind: 'PRE_DEPLOY',
          runCommand: 'npm run migrate',
          instanceSizeSlug: slug
        });

        expect(job.instanceSizeSlug).toBe(slug);
      });
    });

    it('should accept instance count of 1', () => {
      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate',
        instanceCount: 1
      });

      expect(job.instanceCount).toBe(1);
    });

    it('should accept large instance count', () => {
      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate',
        instanceCount: 50
      });

      expect(job.instanceCount).toBe(50);
    });

    it('should accept DockerImage source', () => {
      const source = new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: 'node',
        tag: '20-alpine'
      });

      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate',
        source
      });

      expect(job.source).toBe(source);
    });

    it('should accept GitHubSource', () => {
      const source = new GitHubSource({
        repo: 'owner/repo',
        branch: 'main'
      });

      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate',
        source
      });

      expect(job.source).toBe(source);
    });

    it('should accept environment variables', () => {
      const envs = [
        new EnvironmentVariable({ key: 'DATABASE_URL', value: 'postgresql://localhost:5432/db' }),
        new EnvironmentVariable({ key: 'NODE_ENV', value: 'production' })
      ];

      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate',
        envs
      });

      expect(job.listEnvs()).toEqual(envs);
    });

    it('should accept various run commands', () => {
      const commands = [
        'npm run migrate',
        'npx prisma migrate deploy',
        'python manage.py migrate',
        'java -jar app.jar',
        './scripts/migrate.sh'
      ];

      commands.forEach(cmd => {
        const job = new Job({
          name: 'my-job',
          kind: 'PRE_DEPLOY',
          runCommand: cmd
        });

        expect(job.runCommand).toBe(cmd);
      });
    });
  });

  describe('constructor validation errors', () => {
    it('should throw ZodError for missing name', () => {
      expect(() => new Job({
        name: '' as any,
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for missing kind', () => {
      expect(() => new Job({
        name: 'my-job',
        kind: undefined as any,
        runCommand: 'npm run migrate'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for invalid kind', () => {
      expect(() => new Job({
        name: 'my-job',
        kind: 'INVALID' as any,
        runCommand: 'npm run migrate'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for missing runCommand', () => {
      expect(() => new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: '' as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for empty runCommand', () => {
      expect(() => new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: ''
      })).toThrow(ZodError);
    });

    it('should throw ZodError for whitespace-only runCommand', () => {
      expect(() => new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: '   '
      })).toThrow(ZodError);
    });

    it('should throw ZodError for instanceCount 0', () => {
      expect(() => new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate',
        instanceCount: 0 as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for negative instanceCount', () => {
      expect(() => new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate',
        instanceCount: -1 as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for non-integer instanceCount', () => {
      expect(() => new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate',
        instanceCount: 1.5 as any
      })).toThrow(ZodError);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON with required fields', () => {
      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate'
      });

      const json = job.toJSON();

      expect(json).toEqual({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate',
        envs: []
      });
    });

    it('should serialize to JSON with all fields', () => {
      const envVar = new EnvironmentVariable({
        key: 'DATABASE_URL',
        value: 'postgresql://localhost:5432/db'
      });
      const source = new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: 'node',
        tag: '20-alpine'
      });

      const job = new Job({
        name: 'my-job',
        kind: 'POST_DEPLOY',
        runCommand: 'npx prisma migrate deploy',
        instanceSizeSlug: 'professional-xs',
        instanceCount: 2,
        source,
        envs: [envVar]
      });

      const json = job.toJSON();

      expect(json).toEqual({
        name: 'my-job',
        kind: 'POST_DEPLOY',
        runCommand: 'npx prisma migrate deploy',
        instanceSizeSlug: 'professional-xs',
        instanceCount: 2,
        source: source.toJSON(),
        envs: [envVar.toJSON()]
      });
    });

    it('should omit optional fields when undefined', () => {
      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate'
      });

      const json = job.toJSON();

      expect(json).not.toHaveProperty('instanceSizeSlug');
      expect(json).not.toHaveProperty('instanceCount');
      expect(json).not.toHaveProperty('source');
    });
  });

  describe('environment variable management', () => {
    it('should add environment variable', () => {
      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate'
      });

      const envVar = new EnvironmentVariable({
        key: 'DATABASE_URL',
        value: 'postgresql://localhost:5432/db'
      });

      job.addEnv(envVar);

      expect(job.getEnv('DATABASE_URL')).toBe(envVar);
      expect(job.listEnvs()).toEqual([envVar]);
    });

    it('should throw when adding duplicate environment variable', () => {
      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate',
        envs: [
          new EnvironmentVariable({ key: 'DATABASE_URL', value: 'postgresql://localhost:5432/db' })
        ]
      });

      expect(() => {
        job.addEnv(new EnvironmentVariable({ key: 'DATABASE_URL', value: 'postgresql://new:5432/db' }));
      }).toThrow(ZodError);
    });

    it('should remove environment variable', () => {
      const envVar = new EnvironmentVariable({
        key: 'DATABASE_URL',
        value: 'postgresql://localhost:5432/db'
      });

      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate',
        envs: [envVar]
      });

      const removed = job.removeEnv('DATABASE_URL');

      expect(removed).toBe(true);
      expect(job.getEnv('DATABASE_URL')).toBe(undefined);
      expect(job.listEnvs()).toEqual([]);
    });

    it('should return false when removing non-existent environment variable', () => {
      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate'
      });

      const removed = job.removeEnv('DATABASE_URL');

      expect(removed).toBe(false);
    });

    it('should get environment variable', () => {
      const envVar = new EnvironmentVariable({
        key: 'DATABASE_URL',
        value: 'postgresql://localhost:5432/db'
      });

      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate',
        envs: [envVar]
      });

      expect(job.getEnv('DATABASE_URL')).toBe(envVar);
    });
  });

  describe('toYAML', () => {
    it('should convert job to YAML', async () => {
      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate'
      });

      const yaml = await job.toYAML();

      expect(yaml).toContain('name: my-job');
      expect(yaml).toContain('kind: PRE_DEPLOY');
      expect(yaml).toContain('run_command: npm run migrate');
    });

    it('should convert job with source to YAML', async () => {
      const source = new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: 'node',
        tag: '20-alpine'
      });

      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate',
        source
      });

      const yaml = await job.toYAML();

      expect(yaml).toContain('name: my-job');
      expect(yaml).toContain('kind: PRE_DEPLOY');
      expect(yaml).toContain('registry_type: DOCKER_HUB');
      expect(yaml).toContain('repository: node');
      expect(yaml).toContain('tag: 20-alpine');
    });
  });

  describe('edge cases', () => {
    it('should accept very long job names', () => {
      const longName = 'a'.repeat(200);
      const job = new Job({
        name: longName,
        kind: 'PRE_DEPLOY',
        runCommand: 'npm run migrate'
      });

      expect(job.name).toBe(longName);
    });

    it('should accept very long run commands', () => {
      const longCommand = 'npm run ' + 'a'.repeat(500);
      const job = new Job({
        name: 'my-job',
        kind: 'PRE_DEPLOY',
        runCommand: longCommand
      });

      expect(job.runCommand).toBe(longCommand);
    });

    it('should accept run commands with special characters', () => {
      const commands = [
        'npm run migrate:prod',
        'npx prisma migrate deploy --schema=./prisma/schema.prisma',
        'docker run --rm -v $(pwd):/app node:20-alpine sh -c "npm ci && npm run migrate"',
        'python manage.py migrate --settings=settings.production'
      ];

      commands.forEach(cmd => {
        const job = new Job({
          name: 'my-job',
          kind: 'PRE_DEPLOY',
          runCommand: cmd
        });

        expect(job.runCommand).toBe(cmd);
      });
    });
  });
});
