/**
 * wickedbased - Supabase DO App Spec Library
 *
 * TypeScript classes for DigitalOcean App Platform infrastructure
 * with YAML serialization support.
 * Uses Zod for validation.
 */

// Base classes
export { AppPlatformResource } from './base/AppPlatformResource.js';

// Resource classes
export { Service } from './resources/Service.js';
export type { ServiceSource } from './resources/Service.js';

export { Job } from './resources/Job.js';
export type { JobSource, JobKind } from './resources/Job.js';

export { Worker } from './resources/Worker.js';
export type { WorkerSource } from './resources/Worker.js';

// Configuration classes
export { EnvironmentVariable } from './config/EnvironmentVariable.js';
export type { EnvironmentVariableConfig } from './config/EnvironmentVariable.js';

export { HealthCheck } from './config/HealthCheck.js';

export { DockerImage } from './config/DockerImage.js';
export type { DockerRegistryType } from './config/DockerImage.js';

export { GitHubSource } from './config/GitHubSource.js';

export { VolumeMount } from './config/VolumeMount.js';

// Validation schemas and constants
export {
  INSTANCE_SIZE_SLUGS,
  DockerRegistryType as DockerRegistryTypeSchema,
  GITHUB_REPO_PATTERN,
  EnvironmentVariableSchema,
  HealthCheckSchema,
  DockerImageSchema,
  GitHubSourceSchema,
  VolumeMountSchema,
  AppPlatformResourceBaseSchema,
  ServiceSchema,
  JobSchema,
  WorkerSchema
} from './validation/schemas.js';

// Validation errors
export { ValidationError } from './base/ValidationError.js';
export { fromZodError } from './validation/ZodError.js';

// Serialization
export { toYAML, toYAMLSync } from './serialization/serializer.js';
export { camelToSnake, transformKeys, removeEmpty, isPulumiOutput } from './serialization/transformers.js';

// Types
export * from './types/index.js';
