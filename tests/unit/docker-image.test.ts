/**
 * Unit tests for DockerImage class
 */
import { describe, it, expect } from 'vitest';
import { DockerImage } from '../../src/config/DockerImage';
import { ZodError } from 'zod';

describe('DockerImage', () => {
  describe('constructor with DOCKER_HUB', () => {
    it('should create DockerImage for Docker Hub with registry', () => {
      const image = new DockerImage({
        registryType: 'DOCKER_HUB',
        registry: 'docker.io',
        repository: 'nginx',
        tag: 'latest'
      });

      expect(image.registryType).toBe('DOCKER_HUB');
      expect(image.registry).toBe('docker.io');
      expect(image.repository).toBe('nginx');
      expect(image.tag).toBe('latest');
    });

    it('should create DockerImage for Docker Hub without registry', () => {
      const image = new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: 'nginx',
        tag: 'latest'
      });

      expect(image.registryType).toBe('DOCKER_HUB');
      expect(image.registry).toBe(undefined);
      expect(image.repository).toBe('nginx');
      expect(image.tag).toBe('latest');
    });

    it('should accept common Docker Hub images', () => {
      const images = [
        { repo: 'nginx', tag: 'latest' },
        { repo: 'node', tag: '20-alpine' },
        { repo: 'postgres', tag: '15' },
        { repo: 'redis', tag: '7-alpine' }
      ];

      images.forEach(({ repo, tag }) => {
        const image = new DockerImage({
          registryType: 'DOCKER_HUB',
          repository: repo,
          tag
        });

        expect(image.repository).toBe(repo);
        expect(image.tag).toBe(tag);
      });
    });

    it('should accept library images', () => {
      const image = new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: 'library/node',
        tag: '20'
      });

      expect(image.repository).toBe('library/node');
    });
  });

  describe('constructor with DOCR', () => {
    it('should create DockerImage for DOCR with registry', () => {
      const image = new DockerImage({
        registryType: 'DOCR',
        registry: 'my-registry',
        repository: 'my-app',
        tag: 'v1.0.0'
      });

      expect(image.registryType).toBe('DOCR');
      expect(image.registry).toBe('my-registry');
      expect(image.repository).toBe('my-app');
      expect(image.tag).toBe('v1.0.0');
    });

    it('should accept various DOCR registry names', () => {
      const registries = ['my-registry', 'my-registry-123', 'my-registry.prod', 'my_registry'];

      registries.forEach(registry => {
        const image = new DockerImage({
          registryType: 'DOCR',
          registry,
          repository: 'my-app',
          tag: 'latest'
        });

        expect(image.registry).toBe(registry);
      });
    });
  });

  describe('constructor with GHCR', () => {
    it('should create DockerImage for GHCR with registry', () => {
      const image = new DockerImage({
        registryType: 'GHCR',
        registry: 'ghcr.io',
        repository: 'my-org/my-app',
        tag: 'main'
      });

      expect(image.registryType).toBe('GHCR');
      expect(image.registry).toBe('ghcr.io');
      expect(image.repository).toBe('my-org/my-app');
      expect(image.tag).toBe('main');
    });

    it('should create DockerImage for GHCR without registry', () => {
      const image = new DockerImage({
        registryType: 'GHCR',
        repository: 'my-org/my-app',
        tag: 'main'
      });

      expect(image.registryType).toBe('GHCR');
      expect(image.registry).toBe(undefined);
      expect(image.repository).toBe('my-org/my-app');
      expect(image.tag).toBe('main');
    });
  });

  describe('constructor validation errors', () => {
    it('should throw ZodError for missing registryType', () => {
      expect(() => new DockerImage({
        registryType: undefined as any,
        repository: 'nginx',
        tag: 'latest'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for invalid registryType', () => {
      expect(() => new DockerImage({
        registryType: 'INVALID' as any,
        repository: 'nginx',
        tag: 'latest'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for DOCR without registry', () => {
      expect(() => new DockerImage({
        registryType: 'DOCR',
        repository: 'nginx',
        tag: 'latest'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for DOCR with empty registry', () => {
      expect(() => new DockerImage({
        registryType: 'DOCR',
        registry: '',
        repository: 'nginx',
        tag: 'latest'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for DOCR with whitespace-only registry', () => {
      expect(() => new DockerImage({
        registryType: 'DOCR',
        registry: '   ',
        repository: 'nginx',
        tag: 'latest'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for missing repository', () => {
      expect(() => new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: '' as any,
        tag: 'latest'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for empty repository', () => {
      expect(() => new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: '',
        tag: 'latest'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for whitespace-only repository', () => {
      expect(() => new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: '   ',
        tag: 'latest'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for missing tag', () => {
      expect(() => new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: 'nginx',
        tag: '' as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for empty tag', () => {
      expect(() => new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: 'nginx',
        tag: ''
      })).toThrow(ZodError);
    });

    it('should throw ZodError for whitespace-only tag', () => {
      expect(() => new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: 'nginx',
        tag: '   '
      })).toThrow(ZodError);
    });
  });

  describe('toJSON', () => {
    it('should serialize DOCKER_HUB with registry to JSON', () => {
      const image = new DockerImage({
        registryType: 'DOCKER_HUB',
        registry: 'docker.io',
        repository: 'nginx',
        tag: 'latest'
      });

      const json = image.toJSON();

      expect(json).toEqual({
        registryType: 'DOCKER_HUB',
        registry: 'docker.io',
        repository: 'nginx',
        tag: 'latest'
      });
    });

    it('should serialize DOCKER_HUB without registry to JSON', () => {
      const image = new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: 'nginx',
        tag: 'latest'
      });

      const json = image.toJSON();

      expect(json).toEqual({
        registryType: 'DOCKER_HUB',
        repository: 'nginx',
        tag: 'latest'
      });
      expect(json).not.toHaveProperty('registry');
    });

    it('should serialize DOCR to JSON', () => {
      const image = new DockerImage({
        registryType: 'DOCR',
        registry: 'my-registry',
        repository: 'my-app',
        tag: 'v1.0.0'
      });

      const json = image.toJSON();

      expect(json).toEqual({
        registryType: 'DOCR',
        registry: 'my-registry',
        repository: 'my-app',
        tag: 'v1.0.0'
      });
    });

    it('should serialize GHCR with registry to JSON', () => {
      const image = new DockerImage({
        registryType: 'GHCR',
        registry: 'ghcr.io',
        repository: 'my-org/my-app',
        tag: 'main'
      });

      const json = image.toJSON();

      expect(json).toEqual({
        registryType: 'GHCR',
        registry: 'ghcr.io',
        repository: 'my-org/my-app',
        tag: 'main'
      });
    });

    it('should serialize GHCR without registry to JSON', () => {
      const image = new DockerImage({
        registryType: 'GHCR',
        repository: 'my-org/my-app',
        tag: 'main'
      });

      const json = image.toJSON();

      expect(json).toEqual({
        registryType: 'GHCR',
        repository: 'my-org/my-app',
        tag: 'main'
      });
      expect(json).not.toHaveProperty('registry');
    });
  });

  describe('edge cases', () => {
    it('should accept very long repository names', () => {
      const longRepo = 'a'.repeat(255);
      const image = new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: longRepo,
        tag: 'latest'
      });

      expect(image.repository).toBe(longRepo);
    });

    it('should accept very long tag names', () => {
      const longTag = 'a'.repeat(128);
      const image = new DockerImage({
        registryType: 'DOCKER_HUB',
        repository: 'nginx',
        tag: longTag
      });

      expect(image.tag).toBe(longTag);
    });

    it('should accept tags with special characters', () => {
      const tags = ['v1.0.0', '1.2.3-beta', 'latest', 'stable', '2024.01.15'];

      tags.forEach(tag => {
        const image = new DockerImage({
          registryType: 'DOCKER_HUB',
          repository: 'nginx',
          tag
        });

        expect(image.tag).toBe(tag);
      });
    });

    it('should accept complex repository paths', () => {
      const repos = [
        'library/nginx',
        'my-org/my-repo',
        'registry.example.com/namespace/repo',
        'ghcr.io/org/repo'
      ];

      repos.forEach(repo => {
        const image = new DockerImage({
          registryType: 'DOCKER_HUB',
          repository: repo,
          tag: 'latest'
        });

        expect(image.repository).toBe(repo);
      });
    });
  });
});
