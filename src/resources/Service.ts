/**
 * Service resource for DigitalOcean App Platform
 *
 * Represents a web service that receives HTTP traffic and runs continuously.
 * Services are primary resource type in App Platform.
 * Uses Zod for validation.
 */
import { z } from 'zod';
import { AppPlatformResource } from '../base/AppPlatformResource.js';
import { EnvironmentVariable } from '../config/EnvironmentVariable.js';
import { HealthCheck } from '../config/HealthCheck.js';
import { DockerImage } from '../config/DockerImage.js';
import { GitHubSource } from '../config/GitHubSource.js';
import { VolumeMount } from '../config/VolumeMount.js';
import { INSTANCE_SIZE_SLUGS } from '../validation/schemas.js';

/**
 * Source type for service
 */
export type ServiceSource = DockerImage | GitHubSource;

/**
 * Service configuration
 */
export class Service extends AppPlatformResource {
  /**
   * The DigitalOcean instance size slug (e.g., 'basic-xxs', 'professional-xs')
   */
  readonly instanceSizeSlug: string;

  /**
   * Number of instances to run
   */
  readonly instanceCount: number;

  /**
   * HTTP port for service (e.g., 80, 443, 3000)
   */
  readonly httpPort?: number;

  /**
   * Internal ports for inter-service communication
   */
  readonly internalPorts?: number[];

  /**
   * Health check configuration
   */
  readonly healthCheck?: HealthCheck;

  /**
   * Command to run in container
   */
  readonly runCommand?: string;

  /**
   * Volume mounts for persistent storage
   */
  readonly volumes?: VolumeMount[];

  /**
   * Source for building/deploying service (exactly one required)
   */
  readonly source?: ServiceSource;

  /**
   * Creates a new Service instance
   *
   * @param config - Service configuration
   * @param config.name - Service name (required)
   * @param config.instanceSizeSlug - Instance size slug (required)
   * @param config.instanceCount - Number of instances (required)
   * @param config.httpPort - HTTP port (optional)
   * @param config.internalPorts - Internal ports (optional)
   * @param config.healthCheck - Health check config (optional)
   * @param config.runCommand - Container command (optional)
   * @param config.volumes - Volume mounts (optional)
   * @param config.source - Source config (optional but recommended)
   * @param config.envs - Environment variables (optional)
   * @throws ZodError if required fields are missing or invalid
   */
  constructor(config: {
    name: string;
    instanceSizeSlug: string;
    instanceCount: number;
    httpPort?: number;
    internalPorts?: number[];
    healthCheck?: HealthCheck;
    runCommand?: string;
    volumes?: VolumeMount[];
    source?: ServiceSource;
    envs?: EnvironmentVariable[];
  }) {
    // Validate base resource properties first
    super({ name: config.name, envs: config.envs });

    // Validate primitive fields manually to preserve class instances
    z.object({
      instanceSizeSlug: z.enum(INSTANCE_SIZE_SLUGS),
      instanceCount: z.number().int().min(1, 'Instance count must be a positive integer'),
      httpPort: z.number().int().min(1).max(65535, 'Port must be between 1 and 65535').optional(),
      internalPorts: z.array(z.number().int().min(1).max(65535)).optional(),
      runCommand: z.string().optional()
    }).parse({
      instanceSizeSlug: config.instanceSizeSlug,
      instanceCount: config.instanceCount,
      httpPort: config.httpPort,
      internalPorts: config.internalPorts,
      runCommand: config.runCommand
    });

    // Preserve class instances directly
    this.instanceSizeSlug = config.instanceSizeSlug;
    this.instanceCount = config.instanceCount;
    this.httpPort = config.httpPort;
    this.internalPorts = config.internalPorts;
    this.healthCheck = config.healthCheck;
    this.runCommand = config.runCommand;
    this.volumes = config.volumes;
    this.source = config.source;
  }

  /**
   * Converts to service to a JSON object
   *
   * @returns JSON representation with camelCase keys
   */
  toJSON(): Record<string, unknown> {
    const json: Record<string, unknown> = {
      name: this.name,
      instanceSizeSlug: this.instanceSizeSlug,
      instanceCount: this.instanceCount,
      envs: this.envs.map(env => env.toJSON())
    };

    // Add optional fields only if defined
    if (this.httpPort !== undefined) {
      json.httpPort = this.httpPort;
    }

    if (this.internalPorts !== undefined) {
      json.internalPorts = this.internalPorts;
    }

    if (this.healthCheck !== undefined) {
      json.healthCheck = this.healthCheck.toJSON();
    }

    if (this.runCommand !== undefined) {
      json.runCommand = this.runCommand;
    }

    if (this.volumes !== undefined && this.volumes.length > 0) {
      json.volumes = this.volumes.map(volume => volume.toJSON());
    }

    if (this.source !== undefined) {
      json.source = this.source.toJSON();
    }

    return json;
  }
}

/**
 * Export instance size slugs for external use
 */
export { INSTANCE_SIZE_SLUGS };
