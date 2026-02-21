/**
 * Abstract base class for DigitalOcean App Platform resources
 *
 * Provides common functionality for Service, Job, and Worker resources including:
 * - Environment variable management with uniqueness checking
 * - Serialization to YAML format
 * Uses Zod for validation.
 */
import { z } from 'zod';
import { EnvironmentVariable } from '../config/EnvironmentVariable.js';
import { toYAML } from '../serialization/serializer.js';
import type { YamlSerializable } from '../types/index.js';

/**
 * Abstract base class for App Platform resources
 */
export abstract class AppPlatformResource implements YamlSerializable {
  /**
   * The name of the resource (must be unique within the app)
   */
  readonly name: string;

  /**
   * Environment variables for the resource
   */
  protected readonly envs: EnvironmentVariable[];

  /**
   * Creates a new AppPlatformResource
   *
   * @param config - Resource configuration
   * @param config.name - The resource name (required)
   * @param config.envs - Initial environment variables (optional)
   * @throws ZodError if required fields are missing or invalid
   */
  constructor(config: { name: string; envs?: EnvironmentVariable[] }) {
    // Validate primitive fields manually
    z.object({
      name: z.string().refine(val => val.trim().length > 0, 'Name must be non-empty'),
      envs: z.array(z.any()).default([])
    }).parse({
      name: config.name,
      envs: config.envs
    });

    this.name = config.name;
    this.envs = config.envs?.slice() || [];
  }

  /**
   * Adds an environment variable to the resource
   *
   * @param env - The environment variable to add
   * @throws ZodError if an environment variable with the same key already exists
   */
  addEnv(env: EnvironmentVariable): void {
    const existingIndex = this.envs.findIndex(e => e.key === env.key);
    if (existingIndex !== -1) {
      throw new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          path: ['key'],
          message: `Environment variable with key "${env.key}" already exists`
        }
      ]);
    }
    this.envs.push(env);
  }

  /**
   * Removes an environment variable by key
   *
   * @param key - The key of the environment variable to remove
   * @returns true if the variable was found and removed, false otherwise
   */
  removeEnv(key: string): boolean {
    const index = this.envs.findIndex(e => e.key === key);
    if (index !== -1) {
      this.envs.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Gets an environment variable by key
   *
   * @param key - The key of the environment variable to retrieve
   * @returns The environment variable if found, undefined otherwise
   */
  getEnv(key: string): EnvironmentVariable | undefined {
    return this.envs.find(e => e.key === key);
  }

  /**
   * Returns all environment variables for this resource
   *
   * @returns Array of environment variables
   */
  listEnvs(): readonly EnvironmentVariable[] {
    return [...this.envs];
  }

  /**
   * Converts the resource to a JSON object representation
   *
   * This method must be implemented by subclasses to provide
   * resource-specific serialization.
   *
   * @returns JSON object representation of the resource
   */
  abstract toJSON(): Record<string, unknown>;

  /**
   * Converts the resource to a YAML string
   *
   * Uses js-yaml to serialize the JSON representation with proper
   * camelCase → snake_case transformation.
   *
   * @returns Promise that resolves to the YAML string
   */
  async toYAML(): Promise<string> {
    const json = this.toJSON();
    return await toYAML(json);
  }
}
