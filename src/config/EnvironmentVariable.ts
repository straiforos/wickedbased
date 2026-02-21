/**
 * Environment variable configuration for App Platform resources
 *
 * Represents a single environment variable with its value, type, and scope.
 * Values can be strings or Pulumi Outputs for runtime resolution.
 * Uses Zod for validation.
 */
import { EnvironmentVariableSchema } from '../validation/schemas.js';
import type { Serializable } from '../types/index.js';

/**
 * Environment variable configuration
 */
export class EnvironmentVariable implements Serializable {
  /**
   * The key/name of environment variable
   */
  readonly key: string;

  /**
   * The value of environment variable (string or Pulumi Output)
   */
  readonly value: unknown;

  /**
   * The type of environment variable (determines encryption behavior)
   */
  readonly type: 'GENERAL' | 'SECRET';

  /**
   * The scope of environment variable
   */
  readonly scope: 'RUN_TIME' | 'BUILD_TIME' | 'DEPLOY_TIME';

  /**
   * Creates a new EnvironmentVariable instance
   *
   * @param config - Environment variable configuration
   * @param config.key - The variable key (required, non-empty)
   * @param config.value - The variable value (required)
   * @param config.type - The variable type (default: GENERAL)
   * @param config.scope - The variable scope (default: RUN_TIME)
   * @throws ZodError if required fields are missing or invalid
   */
  constructor(config: {
    key: string;
    value: unknown;
    type?: 'GENERAL' | 'SECRET';
    scope?: 'RUN_TIME' | 'BUILD_TIME' | 'DEPLOY_TIME';
  }) {
    const data = EnvironmentVariableSchema.parse(config);

    this.key = data.key;
    this.value = data.value;
    this.type = data.type;
    this.scope = data.scope;
  }

  /**
   * Converts environment variable to a JSON object
   *
   * @returns JSON representation with camelCase keys
   */
  toJSON(): Record<string, unknown> {
    return {
      key: this.key,
      value: this.value,
      type: this.type,
      scope: this.scope
    };
  }
}

/**
 * Environment variable configuration type for type checking
 * @deprecated Use EnvironmentVariableInput from validation/schemas instead
 */
export interface EnvironmentVariableConfig {
  key: string;
  value: unknown;
  type?: 'GENERAL' | 'SECRET';
  scope?: 'RUN_TIME' | 'BUILD_TIME' | 'DEPLOY_TIME';
}
