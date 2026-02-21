/**
 * Volume mount configuration for App Platform services
 *
 * Defines persistent storage volumes that can be mounted to services.
 * Volumes persist across deployments and provide durable storage.
 * Uses Zod for validation.
 */
import { VolumeMountSchema } from '../validation/schemas.js';
import type { Serializable } from '../types/index.js';

/**
 * Volume mount configuration
 */
export class VolumeMount implements Serializable {
  /**
   * Name of the volume (must be unique within the service)
   */
  readonly name: string;

  /**
   * Path where volume is mounted in the container
   * Must be an absolute path starting with /
   */
  readonly mountPath: string;

  /**
   * Size of the volume (as a string like "1GB", "10GB")
   */
  readonly size: string;

  /**
   * Creates a new VolumeMount instance
   *
   * @param config - Volume mount configuration
   * @param config.name - Volume name (required, non-empty)
   * @param config.mountPath - Mount path (required, must be absolute)
   * @param config.size - Volume size (default: "1GB")
   * @throws ZodError if required fields are missing or invalid
   */
  constructor(config: {
    name: string;
    mountPath: string;
    size?: string;
  }) {
    const data = VolumeMountSchema.parse({
      name: config.name,
      mountPath: config.mountPath,
      size: config.size ?? '1GB'
    });

    this.name = data.name;
    this.mountPath = data.mountPath;
    this.size = data.size;
  }

  /**
   * Converts volume mount to a JSON object
   *
   * @returns JSON representation with camelCase keys
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      mountPath: this.mountPath,
      size: this.size
    };
  }
}

/**
 * Volume mount configuration type for type checking
 * @deprecated Use VolumeMountInput from validation/schemas instead
 */
export interface VolumeMountConfig {
  name: string;
  mountPath: string;
  size?: string;
}
