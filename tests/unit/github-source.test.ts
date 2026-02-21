/**
 * Unit tests for GitHubSource class
 */
import { describe, it, expect } from 'vitest';
import { GitHubSource } from '../../src/config/GitHubSource';
import { ZodError } from 'zod';

describe('GitHubSource', () => {
  describe('constructor with valid values', () => {
    it('should create GitHubSource with required fields only', () => {
      const source = new GitHubSource({
        repo: 'owner/repo',
        branch: 'main'
      });

      expect(source.repo).toBe('owner/repo');
      expect(source.branch).toBe('main');
      expect(source.sourceDir).toBe('/');
      expect(source.dockerfilePath).toBe('Dockerfile');
      expect(source.deployOnPush).toBe(false);
    });

    it('should create GitHubSource with all fields specified', () => {
      const source = new GitHubSource({
        repo: 'owner/repo',
        branch: 'main',
        sourceDir: '/app',
        dockerfilePath: 'Dockerfile.prod',
        deployOnPush: true
      });

      expect(source.repo).toBe('owner/repo');
      expect(source.branch).toBe('main');
      expect(source.sourceDir).toBe('/app');
      expect(source.dockerfilePath).toBe('Dockerfile.prod');
      expect(source.deployOnPush).toBe(true);
    });

    it('should accept various GitHub repo formats', () => {
      const repos = [
        'owner/repo',
        'my-org/my-repo',
        'user123/repo-456',
        'MyOrg/MyRepo',
        'a/b'
      ];

      repos.forEach(repo => {
        const source = new GitHubSource({
          repo,
          branch: 'main'
        });

        expect(source.repo).toBe(repo);
      });
    });

    it('should accept common branch names', () => {
      const branches = ['main', 'master', 'develop', 'staging', 'production', 'feature/new-feature'];

      branches.forEach(branch => {
        const source = new GitHubSource({
          repo: 'owner/repo',
          branch
        });

        expect(source.branch).toBe(branch);
      });
    });

    it('should accept deployOnPush true', () => {
      const source = new GitHubSource({
        repo: 'owner/repo',
        branch: 'main',
        deployOnPush: true
      });

      expect(source.deployOnPush).toBe(true);
    });

    it('should accept deployOnPush false', () => {
      const source = new GitHubSource({
        repo: 'owner/repo',
        branch: 'main',
        deployOnPush: false
      });

      expect(source.deployOnPush).toBe(false);
    });

    it('should accept various sourceDir values', () => {
      const dirs = ['/', '/app', '/app/api', '/services/backend', '/workspace'];

      dirs.forEach(dir => {
        const source = new GitHubSource({
          repo: 'owner/repo',
          branch: 'main',
          sourceDir: dir
        });

        expect(source.sourceDir).toBe(dir);
      });
    });

    it('should accept various dockerfilePath values', () => {
      const paths = [
        'Dockerfile',
        'Dockerfile.prod',
        'Dockerfile.dev',
        'docker/Dockerfile',
        'build/Dockerfile',
        'deployment/docker/Dockerfile'
      ];

      paths.forEach(path => {
        const source = new GitHubSource({
          repo: 'owner/repo',
          branch: 'main',
          dockerfilePath: path
        });

        expect(source.dockerfilePath).toBe(path);
      });
    });
  });

  describe('constructor validation errors', () => {
    it('should throw ZodError for missing repo', () => {
      expect(() => new GitHubSource({
        repo: '' as any,
        branch: 'main'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for undefined repo', () => {
      expect(() => new GitHubSource({
        repo: undefined as any,
        branch: 'main'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for null repo', () => {
      expect(() => new GitHubSource({
        repo: null as any,
        branch: 'main'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for invalid repo format (no slash)', () => {
      expect(() => new GitHubSource({
        repo: 'owner',
        branch: 'main'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for invalid repo format (too many slashes)', () => {
      expect(() => new GitHubSource({
        repo: 'owner/repo/extra',
        branch: 'main'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for invalid repo format (trailing slash)', () => {
      expect(() => new GitHubSource({
        repo: 'owner/',
        branch: 'main'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for invalid repo format (leading slash)', () => {
      expect(() => new GitHubSource({
        repo: '/repo',
        branch: 'main'
      })).toThrow(ZodError);
    });

    it('should throw ZodError for missing branch', () => {
      expect(() => new GitHubSource({
        repo: 'owner/repo',
        branch: '' as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for undefined branch', () => {
      expect(() => new GitHubSource({
        repo: 'owner/repo',
        branch: undefined as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for null branch', () => {
      expect(() => new GitHubSource({
        repo: 'owner/repo',
        branch: null as any
      })).toThrow(ZodError);
    });

    it('should throw ZodError for empty branch', () => {
      expect(() => new GitHubSource({
        repo: 'owner/repo',
        branch: ''
      })).toThrow(ZodError);
    });

    it('should throw ZodError for whitespace-only branch', () => {
      expect(() => new GitHubSource({
        repo: 'owner/repo',
        branch: '   '
      })).toThrow(ZodError);
    });

    it('should throw ZodError for empty dockerfilePath', () => {
      expect(() => new GitHubSource({
        repo: 'owner/repo',
        branch: 'main',
        dockerfilePath: ''
      })).toThrow(ZodError);
    });

    it('should throw ZodError for whitespace-only dockerfilePath', () => {
      expect(() => new GitHubSource({
        repo: 'owner/repo',
        branch: 'main',
        dockerfilePath: '   '
      })).toThrow(ZodError);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON with required fields and defaults', () => {
      const source = new GitHubSource({
        repo: 'owner/repo',
        branch: 'main'
      });

      const json = source.toJSON();

      expect(json).toEqual({
        repo: 'owner/repo',
        branch: 'main',
        sourceDir: '/',
        dockerfilePath: 'Dockerfile',
        deployOnPush: false
      });
    });

    it('should serialize to JSON with all fields', () => {
      const source = new GitHubSource({
        repo: 'owner/repo',
        branch: 'main',
        sourceDir: '/app',
        dockerfilePath: 'Dockerfile.prod',
        deployOnPush: true
      });

      const json = source.toJSON();

      expect(json).toEqual({
        repo: 'owner/repo',
        branch: 'main',
        sourceDir: '/app',
        dockerfilePath: 'Dockerfile.prod',
        deployOnPush: true
      });
    });
  });

  describe('edge cases', () => {
    it('should accept very long branch names', () => {
      const longBranch = 'feature/' + 'a'.repeat(200);
      const source = new GitHubSource({
        repo: 'owner/repo',
        branch: longBranch
      });

      expect(source.branch).toBe(longBranch);
    });

    it('should accept branches with special characters', () => {
      const branches = [
        'feature/new-feature',
        'fix/bug-123',
        'release/v1.0.0',
        'hotfix/critical-fix',
        'feature/TEST-123-description'
      ];

      branches.forEach(branch => {
        const source = new GitHubSource({
          repo: 'owner/repo',
          branch
        });

        expect(source.branch).toBe(branch);
      });
    });

    it('should accept very long repo names', () => {
      const longRepo = 'a'.repeat(100) + '/' + 'b'.repeat(100);
      const source = new GitHubSource({
        repo: longRepo,
        branch: 'main'
      });

      expect(source.repo).toBe(longRepo);
    });

    it('should accept repo names with numbers', () => {
      const repos = [
        'user123/repo456',
        'org123/my-repo-v2',
        'company1/team1-app'
      ];

      repos.forEach(repo => {
        const source = new GitHubSource({
          repo,
          branch: 'main'
        });

        expect(source.repo).toBe(repo);
      });
    });

    it('should accept repo names with underscores', () => {
      const repos = [
        'my_org/my_repo',
        'org_name/repo_name',
        'org_123/repo_456'
      ];

      repos.forEach(repo => {
        const source = new GitHubSource({
          repo,
          branch: 'main'
        });

        expect(source.repo).toBe(repo);
      });
    });

    it('should accept mixed case repo names', () => {
      const repos = [
        'MyOrg/MyRepo',
        'Company/App',
        'ORG/REPO'
      ];

      repos.forEach(repo => {
        const source = new GitHubSource({
          repo,
          branch: 'main'
        });

        expect(source.repo).toBe(repo);
      });
    });
  });
});
