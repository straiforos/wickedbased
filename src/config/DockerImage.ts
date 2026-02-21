/**
 * Docker image configuration for App Platform source
 *
 * Defines a Docker registry source for building or deploying containers.
 * Supports Docker Hub, DigitalOcean Container Registry (DOCR), and GHCR.
 * Uses Zod for validation.
 */
import { z } from 'zod';
import {
  DockerImageSchema,
  DockerRegistryType as DockerRegistryTypeZod
} from '../validation/schemas.js';
import type { Serializable } from '../types/index.js';

/**
 * Docker registry type
 */
export type DockerRegistryType = z.infer<typeof DockerRegistryTypeZod>;

/**
 * Docker image source configuration
 */
export class DockerImage implements Serializable {
  /**
   * The type of Docker registry
   */
  readonly registryType: DockerRegistryType;

  /**
   * The registry name (e.g., 'docker.io', 'my-docr', 'ghcr.io')
   * Required for DOCR, optional for others
   */
  readonly registry?: string;

  /**
   * The repository name (e.g., 'nginx', 'library/node')
   */
  readonly repository: string;

  /**
   * The image tag (e.g., 'latest', 'v1.2.3', 'alpine')
   */
  readonly tag: string;

  /**
   * Creates a new DockerImage instance
   *
   * @param config - Docker image configuration
   * @param config.registryType - Registry type (required)
   * @param config.registry - Registry name (required for DOCR, optional for others)
   * @param config.repository - Repository name (required)
   * @param config.tag - Image tag (required)
   * @throws ZodError if required fields are missing or invalid
   */
  constructor(config: {
    registryType: DockerRegistryType;
    registry?: string;
    repository: string;
    tag: string;
  }) {
    const data = DockerImageSchema.parse(config);

    this.registryType = data.registryType;
    this.registry = data.registry;
    this.repository = data.repository;
    this.tag = data.tag;
  }

  /**
   * Converts Docker image to a JSON object
   *
   * @returns JSON representation with camelCase keys
   */
  toJSON(): Record<string, unknown> {
    const json: Record<string, unknown> = {
      registryType: this.registryType,
      repository: this.repository,
      tag: this.tag
    };

    // Only include registry if it's specified
    if (this.registry) {
      json.registry = this.registry;
    }

    return json;
  }
}

/**
 * Docker image configuration type for type checking
 */
export interface DockerImageConfig {
  registryType: DockerRegistryType;
  registry?: string;
  repository: string;
  tag: string;
}
