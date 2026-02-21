/**
 * TypeScript type definitions for wickedbased
 *
 * This file contains all TypeScript type definitions used throughout the library.
 * These types are exported for users who need to work with types directly.
 */

/**
 * Interface for objects that can be serialized to JSON
 */
export interface Serializable {
  /**
   * Converts the object to a JSON representation
   *
   * @returns JSON object with camelCase property names
   */
  toJSON(): Record<string, unknown>;
}

/**
 * Interface for objects that can be serialized to YAML
 */
export interface YamlSerializable extends Serializable {
  /**
   * Converts the object to a YAML string
   *
   * Serializes the JSON representation to YAML with proper
   * camelCase → snake_case transformation.
   *
   * @returns Promise that resolves to a YAML string
   */
  toYAML(): Promise<string>;
}


/**
 * Service configuration type
 */
export interface ServiceConfig {
  /**
   * Service name (required)
   */
  name: string;

  /**
   * DigitalOcean instance size slug (required)
   * Examples: 'basic-xxs', 'basic-xs', 'basic-s', 'basic-m',
   *          'professional-xs', 'professional-s', 'professional-m', 'professional-l'
   */
  instanceSizeSlug: string;

  /**
   * Number of instances to run (required)
   */
  instanceCount: number;

  /**
   * HTTP port for the service (optional)
   */
  httpPort?: number;

  /**
   * Internal ports for inter-service communication (optional)
   */
  internalPorts?: number[];

  /**
   * Health check configuration (optional)
   */
  healthCheck?: HealthCheckConfig;

  /**
   * Command to run in the container (optional)
   */
  runCommand?: string;

  /**
   * Volume mounts for persistent storage (optional)
   */
  volumes?: VolumeMountConfig[];

  /**
   * Source for building/deploying the service (optional)
   */
  source?: DockerImageConfig | GitHubSourceConfig;

  /**
   * Environment variables (optional)
   */
  envs?: EnvironmentVariableConfig[];
}

/**
 * Job configuration type
 */
export interface JobConfig {
  /**
   * Job name (required)
   */
  name: string;

  /**
   * Job kind: when it runs relative to deployments (required)
   */
  kind: 'PRE_DEPLOY' | 'POST_DEPLOY';

  /**
   * Command to run in the job container (required)
   */
  runCommand: string;

  /**
   * The DigitalOcean instance size slug (optional)
   */
  instanceSizeSlug?: string;

  /**
   * Number of instances to run (optional)
   */
  instanceCount?: number;

  /**
   * Source for building/deploying the job (optional)
   */
  source?: DockerImageConfig | GitHubSourceConfig;

  /**
   * Environment variables (optional)
   */
  envs?: EnvironmentVariableConfig[];
}

/**
 * Worker configuration type
 */
export interface WorkerConfig {
  /**
   * Worker name (required)
   */
  name: string;

  /**
   * DigitalOcean instance size slug (required)
   */
  instanceSizeSlug: string;

  /**
   * Number of instances to run (required)
   */
  instanceCount: number;

  /**
   * Internal ports for inter-service communication (optional)
   */
  internalPorts?: number[];

  /**
   * Command to run in the container (optional)
   */
  runCommand?: string;

  /**
   * Volume mounts for persistent storage (optional)
   */
  volumes?: VolumeMountConfig[];

  /**
   * Source for building/deploying the worker (optional)
   */
  source?: DockerImageConfig | GitHubSourceConfig;

  /**
   * Environment variables (optional)
   */
  envs?: EnvironmentVariableConfig[];
}

/**
 * Environment variable configuration type
 */
export interface EnvironmentVariableConfig {
  /**
   * The variable key (required)
   */
  key: string;

  /**
   * The variable value (required, can be string or Pulumi Output)
   */
  value: string | unknown;

  /**
   * The variable type (default: GENERAL)
   */
  type?: 'GENERAL' | 'SECRET';

  /**
   * The variable scope (default: RUN_TIME)
   */
  scope?: 'RUN_TIME' | 'BUILD_TIME' | 'DEPLOY_TIME';
}

/**
 * Health check configuration type
 */
export interface HealthCheckConfig {
  /**
   * HTTP path to check (required)
   */
  httpPath: string;

  /**
   * Port number to check (required, 1-65535)
   */
  port: number;

  /**
   * Seconds to wait before starting health checks (default: 0)
   */
  initialDelaySeconds?: number;

  /**
   * Seconds between health checks (default: 10)
   */
  periodSeconds?: number;

  /**
   * Timeout for each health check in seconds (default: 1)
   */
  timeoutSeconds?: number;

  /**
   * Number of consecutive successes before marking healthy (default: 1)
   */
  successThreshold?: number;

  /**
   * Number of consecutive failures before marking unhealthy (default: 3)
   */
  failureThreshold?: number;
}

/**
 * Docker image configuration type
 */
export interface DockerImageConfig {
  /**
   * Registry type (required)
   */
  registryType: 'DOCKER_HUB' | 'DOCR' | 'GHCR';

  /**
   * Registry name (required for DOCR, optional for others)
   */
  registry?: string;

  /**
   * Repository name (required)
   */
  repository: string;

  /**
   * Image tag (required)
   */
  tag: string;
}

/**
 * Docker registry type
 */
export type DockerRegistryType = 'DOCKER_HUB' | 'DOCR' | 'GHCR';

/**
 * GitHub source configuration type
 */
export interface GitHubSourceConfig {
  /**
   * GitHub repository in format "owner/repo" (required)
   */
  repo: string;

  /**
   * Git branch name (required)
   */
  branch: string;

  /**
   * Source directory within repository (default: '/')
   */
  sourceDir?: string;

  /**
   * Dockerfile path relative to sourceDir (default: 'Dockerfile')
   */
  dockerfilePath?: string;

  /**
   * Whether to auto-deploy on push (default: false)
   */
  deployOnPush?: boolean;
}

/**
 * Volume mount configuration type
 */
export interface VolumeMountConfig {
  /**
   * Volume name (required)
   */
  name: string;

  /**
   * Mount path in container (required, must be absolute)
   */
  mountPath: string;

  /**
   * Volume size in GB (default: 1)
   */
  size?: number;
}

/**
 * Job kind type
 */
export type JobKind = 'PRE_DEPLOY' | 'POST_DEPLOY';

/**
 * Environment variable type
 */
export type EnvironmentVariableType = 'GENERAL' | 'SECRET';

/**
 * Environment variable scope
 */
export type EnvironmentVariableScope = 'RUN_TIME' | 'BUILD_TIME' | 'DEPLOY_TIME';

/**
 * Resource source type union
 */
export type ServiceSource = DockerImageConfig | GitHubSourceConfig;
export type JobSource = DockerImageConfig | GitHubSourceConfig;
export type WorkerSource = DockerImageConfig | GitHubSourceConfig;
