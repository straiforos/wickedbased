/**
 * Worker resource for DigitalOcean App Platform
 *
 * Represents a background worker that runs continuously but does not
 * receive HTTP traffic. Workers are ideal for background jobs, message
 * processing, and other non-web-facing tasks.
 * Uses Zod for validation.
 */
import { z } from 'zod';
import { AppPlatformResource } from '../base/AppPlatformResource.js';
import { EnvironmentVariable } from '../config/EnvironmentVariable.js';
import { DockerImage } from '../config/DockerImage.js';
import { GitHubSource } from '../config/GitHubSource.js';
import { VolumeMount } from '../config/VolumeMount.js';
import { INSTANCE_SIZE_SLUGS } from '../validation/schemas.js';

/**
 * Source type for worker
 */
export type WorkerSource = DockerImage | GitHubSource;

/**
 * Worker configuration
 */
export class Worker extends AppPlatformResource {
  /**
   * The DigitalOcean instance size slug (e.g., 'basic-xxs', 'professional-xs')
   */
  readonly instanceSizeSlug: string;

  /**
   * Number of instances to run
   */
  readonly instanceCount: number;

  /**
   * Internal ports for inter-service communication (workers don't have HTTP ports)
   */
  readonly internalPorts?: number[];

  /**
   * Command to run in container
   */
  readonly runCommand?: string;

  /**
   * Volume mounts for persistent storage
   */
  readonly volumes?: VolumeMount[];

  /**
   * Source for building/deploying worker (exactly one recommended)
   */
  readonly source?: WorkerSource;

  /**
   * Creates a new Worker instance
   *
   * @param config - Worker configuration
   * @param config.name - Worker name (required)
   * @param config.instanceSizeSlug - Instance size slug (required)
   * @param config.instanceCount - Number of instances (required)
   * @param config.internalPorts - Internal ports (optional)
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
    internalPorts?: number[];
    runCommand?: string;
    volumes?: VolumeMount[];
    source?: WorkerSource;
    envs?: EnvironmentVariable[];
  }) {
    // Validate base resource properties first
    super({ name: config.name, envs: config.envs });

    // Validate primitive fields manually to preserve class instances
    z.object({
      instanceSizeSlug: z.enum(INSTANCE_SIZE_SLUGS),
      instanceCount: z.number().int().min(1, 'Instance count must be a positive integer'),
      internalPorts: z.array(z.number().int().min(1).max(65535)).optional(),
      runCommand: z.string().optional()
    }).parse({
      instanceSizeSlug: config.instanceSizeSlug,
      instanceCount: config.instanceCount,
      internalPorts: config.internalPorts,
      runCommand: config.runCommand
    });

    // Preserve class instances directly
    this.instanceSizeSlug = config.instanceSizeSlug;
    this.instanceCount = config.instanceCount;
    this.internalPorts = config.internalPorts;
    this.runCommand = config.runCommand;
    this.volumes = config.volumes;
    this.source = config.source;
  }

  /**
   * Converts worker to a JSON object
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
    if (this.internalPorts !== undefined) {
      json.internalPorts = this.internalPorts;
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
