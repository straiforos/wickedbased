/**
 * Job resource for DigitalOcean App Platform
 *
 * Represents a one-time or scheduled task that runs to completion.
 * Jobs can run before or after service deployments.
 * Uses Zod for validation.
 */
import { z } from 'zod';
import { AppPlatformResource } from '../base/AppPlatformResource.js';
import { EnvironmentVariable } from '../config/EnvironmentVariable.js';
import { DockerImage } from '../config/DockerImage.js';
import { GitHubSource } from '../config/GitHubSource.js';
import { INSTANCE_SIZE_SLUGS } from '../validation/schemas.js';

/**
 * Job kind determines when job runs
 */
export type JobKind = 'PRE_DEPLOY' | 'POST_DEPLOY';

/**
 * Source type for job
 */
export type JobSource = DockerImage | GitHubSource;

/**
 * Job configuration
 */
export class Job extends AppPlatformResource {
  /**
   * The kind of job (when it runs relative to deployments)
   */
  readonly kind: JobKind;

  /**
   * Command to run in job container
   */
  readonly runCommand: string;

  /**
   * The DigitalOcean instance size slug
   */
  readonly instanceSizeSlug?: string;

  /**
   * Number of instances to run
   */
  readonly instanceCount?: number;

  /**
   * Source for building/deploying job (exactly one recommended)
   */
  readonly source?: JobSource;

  /**
   * Creates a new Job instance
   *
   * @param config - Job configuration
   * @param config.name - Job name (required)
   * @param config.kind - Job kind: PRE_DEPLOY or POST_DEPLOY (required)
   * @param config.runCommand - Command to run (required)
   * @param config.instanceSizeSlug - Instance size slug (optional)
   * @param config.instanceCount - Number of instances (optional)
   * @param config.source - Source config (optional but recommended)
   * @param config.envs - Environment variables (optional)
   * @throws ZodError if required fields are missing or invalid
   */
  constructor(config: {
    name: string;
    kind: JobKind;
    runCommand: string;
    instanceSizeSlug?: string;
    instanceCount?: number;
    source?: JobSource;
    envs?: EnvironmentVariable[];
  }) {
    // Validate base resource properties first
    super({ name: config.name, envs: config.envs });

    // Validate primitive fields manually to preserve class instances
    const JobKindSchema = z.enum(['PRE_DEPLOY', 'POST_DEPLOY']);
    z.object({
      kind: JobKindSchema,
      runCommand: z.string().refine(val => val.trim().length > 0, 'Run command must be non-empty'),
      instanceSizeSlug: z.enum(INSTANCE_SIZE_SLUGS).optional(),
      instanceCount: z.number().int().min(1).optional()
    }).parse({
      kind: config.kind,
      runCommand: config.runCommand,
      instanceSizeSlug: config.instanceSizeSlug,
      instanceCount: config.instanceCount
    });

    // Preserve class instances directly
    this.kind = config.kind;
    this.runCommand = config.runCommand;
    this.instanceSizeSlug = config.instanceSizeSlug;
    this.instanceCount = config.instanceCount;
    this.source = config.source;
  }

  /**
   * Converts to job to a JSON object
   *
   * @returns JSON representation with camelCase keys
   */
  toJSON(): Record<string, unknown> {
    const json: Record<string, unknown> = {
      name: this.name,
      kind: this.kind,
      runCommand: this.runCommand,
      envs: this.envs.map(env => env.toJSON())
    };

    // Add optional fields only if defined
    if (this.instanceSizeSlug !== undefined) {
      json.instanceSizeSlug = this.instanceSizeSlug;
    }

    if (this.instanceCount !== undefined) {
      json.instanceCount = this.instanceCount;
    }

    if (this.source !== undefined) {
      json.source = this.source.toJSON();
    }

    return json;
  }
}
