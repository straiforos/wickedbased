/**
 * Zod schemas for DigitalOcean App Platform resource validation
 *
 * Provides type-safe validation for all configuration classes.
 * Uses TypeScript-first approach with Zod for runtime validation.
 */
import { z } from 'zod';

/**
 * Environment variable type enum
 */
export const EnvVarType = z.enum(['GENERAL', 'SECRET']);

/**
 * Environment variable scope enum
 */
export const EnvVarScope = z.enum(['RUN_TIME', 'BUILD_TIME', 'DEPLOY_TIME']);

/**
 * Health check defaults
 */
export const HEALTH_CHECK_DEFAULTS = {
  initialDelaySeconds: 0,
  periodSeconds: 10,
  timeoutSeconds: 1,
  successThreshold: 1,
  failureThreshold: 3
} as const;

/**
 * Docker registry type enum
 */
export const DockerRegistryType = z.enum(['DOCKER_HUB', 'DOCR', 'GHCR']);

/**
 * GitHub repository format (owner/repo)
 * Allows alphanumeric characters, underscores, and hyphens
 * Exactly one slash separator required
 */
export const GITHUB_REPO_PATTERN = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;

/**
 * Valid DigitalOcean instance size slugs
 */
export const INSTANCE_SIZE_SLUGS = [
  'basic-xxs', 'basic-xs', 'basic-s', 'basic-m',
  'professional-xs', 'professional-s', 'professional-m', 'professional-l'
] as const;

/**
 * EnvironmentVariable schema
 */
export const EnvironmentVariableSchema = z.object({
  key: z.string().refine(val => val.trim().length > 0, 'Key must be non-empty'),
  value: z.any().refine(val => val !== undefined && val !== null, 'Value is required'),
  type: EnvVarType.default('GENERAL'),
  scope: EnvVarScope.default('RUN_TIME')
});

/**
 * HealthCheck schema
 */
export const HealthCheckSchema = z.object({
  httpPath: z.string().refine(val => val.trim().length > 0, 'HTTP path must be non-empty'),
  port: z.number().int().min(1).max(65535, 'Port must be between 1 and 65535'),
  initialDelaySeconds: z.number().int().min(0).default(HEALTH_CHECK_DEFAULTS.initialDelaySeconds),
  periodSeconds: z.number().int().min(1).default(HEALTH_CHECK_DEFAULTS.periodSeconds),
  timeoutSeconds: z.number().int().min(1).default(HEALTH_CHECK_DEFAULTS.timeoutSeconds),
  successThreshold: z.number().int().min(1).default(HEALTH_CHECK_DEFAULTS.successThreshold),
  failureThreshold: z.number().int().min(1).default(HEALTH_CHECK_DEFAULTS.failureThreshold)
});

/**
 * DockerImage schema
 */
export const DockerImageSchema = z.object({
  registryType: DockerRegistryType,
  registry: z.string().refine(val => val === undefined || val.trim().length > 0, 'Registry must be non-empty when specified').optional(),
  repository: z.string().refine(val => val.trim().length > 0, 'Repository must be non-empty'),
  tag: z.string().refine(val => val.trim().length > 0, 'Tag must be non-empty')
}).refine(
  (data) => {
    // DOCR requires registry field
    if (data.registryType === 'DOCR') {
      return data.registry != null && data.registry !== undefined && data.registry.trim().length > 0;
    }
    return true;
  },
  {
    message: 'DOCR registry type requires non-empty registry field',
    path: ['registry']
  }
);

/**
 * GitHubSource schema
 */
export const GitHubSourceSchema = z.object({
  repo: z.string().regex(GITHUB_REPO_PATTERN, 'Must be in format "owner/repo"'),
  branch: z.string().refine(val => val.trim().length > 0, 'Branch must be non-empty'),
  sourceDir: z.string().default('/'),
  dockerfilePath: z.string().refine(val => val.trim().length > 0, 'Dockerfile path must be non-empty').default('Dockerfile'),
  deployOnPush: z.boolean().default(false)
});

/**
 * VolumeMount schema
 */
export const VolumeMountSchema = z.object({
  name: z.string().refine(val => val.trim().length > 0, 'Name must be non-empty'),
  mountPath: z.string().startsWith('/', 'Must be an absolute path (starting with /)'),
  size: z.string().min(1, 'Size must be non-empty').default('1GB')
});

/**
 * AppPlatformResource base schema
 */
export const AppPlatformResourceBaseSchema = z.object({
  name: z.string().min(1, 'Name must be non-empty'),
  envs: z.array(EnvironmentVariableSchema).optional().default([])
});

/**
 * Service schema
 */
export const ServiceSchema = AppPlatformResourceBaseSchema.extend({
  instanceSizeSlug: z.enum(INSTANCE_SIZE_SLUGS),
  instanceCount: z.number().int().min(1, 'Instance count must be a positive integer'),
  httpPort: z.number().int().min(1).max(65535).optional(),
  internalPorts: z.array(z.number().int().min(1).max(65535)).optional(),
  healthCheck: HealthCheckSchema.optional(),
  runCommand: z.string().optional(),
  volumes: z.array(VolumeMountSchema).optional(),
  source: z.union([DockerImageSchema, GitHubSourceSchema]).optional()
});

/**
 * Job kind enum
 */
export const JobKind = z.enum(['PRE_DEPLOY', 'POST_DEPLOY']);

/**
 * Job schema
 */
export const JobSchema = AppPlatformResourceBaseSchema.extend({
  kind: JobKind,
  runCommand: z.string().min(1, 'Run command must be non-empty'),
  instanceSizeSlug: z.enum(INSTANCE_SIZE_SLUGS).optional(),
  instanceCount: z.number().int().min(1).optional(),
  source: z.union([DockerImageSchema, GitHubSourceSchema]).optional()
});

/**
 * Worker schema (similar to Job but without kind)
 */
export const WorkerSchema = AppPlatformResourceBaseSchema.extend({
  runCommand: z.string().min(1, 'Run command must be non-empty'),
  instanceSizeSlug: z.enum(INSTANCE_SIZE_SLUGS).optional(),
  instanceCount: z.number().int().min(1).optional(),
  internalPorts: z.array(z.number().int().min(1).max(65535)).optional(),
  volumes: z.array(VolumeMountSchema).optional(),
  source: z.union([DockerImageSchema, GitHubSourceSchema]).optional()
});
