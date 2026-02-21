/**
 * Health check configuration for App Platform services
 *
 * Defines how App Platform monitors service health through HTTP checks.
 * Uses Zod for validation.
 */
import { HealthCheckSchema } from '../validation/schemas.js';
import type { Serializable } from '../types/index.js';

/**
 * Health check configuration
 */
export class HealthCheck implements Serializable {
  /**
   * The HTTP path to check (e.g., '/', '/health')
   */
  readonly httpPath: string;

  /**
   * The TCP port to check
   */
  readonly port: number;

  /**
   * Initial delay before starting health checks (in seconds)
   */
  readonly initialDelaySeconds: number;

  /**
   * Interval between health checks (in seconds)
   */
  readonly periodSeconds: number;

  /**
   * Time to wait for health check response (in seconds)
   */
  readonly timeoutSeconds: number;

  /**
   * Number of consecutive successful checks before considering healthy
   */
  readonly successThreshold: number;

  /**
   * Number of consecutive failed checks before considering unhealthy
   */
  readonly failureThreshold: number;

  /**
   * Creates a new HealthCheck instance
   *
   * @param config - Health check configuration
   * @param config.httpPath - HTTP path to check (required)
   * @param config.port - TCP port to check (required, 1-65535)
   * @param config.initialDelaySeconds - Initial delay in seconds (default: 10)
   * @param config.periodSeconds - Check interval in seconds (default: 10)
   * @param config.timeoutSeconds - Check timeout in seconds (default: 5)
   * @param config.successThreshold - Success threshold (default: 1)
   * @param config.failureThreshold - Failure threshold (default: 3)
   * @throws ZodError if required fields are missing or invalid
   */
  constructor(config: {
    httpPath: string;
    port: number;
    initialDelaySeconds?: number;
    periodSeconds?: number;
    timeoutSeconds?: number;
    successThreshold?: number;
    failureThreshold?: number;
  }) {
    const data = HealthCheckSchema.parse(config);

    this.httpPath = data.httpPath;
    this.port = data.port;
    this.initialDelaySeconds = data.initialDelaySeconds;
    this.periodSeconds = data.periodSeconds;
    this.timeoutSeconds = data.timeoutSeconds;
    this.successThreshold = data.successThreshold;
    this.failureThreshold = data.failureThreshold;
  }

  /**
   * Converts health check to a JSON object
   *
   * @returns JSON representation with camelCase keys
   */
  toJSON(): Record<string, unknown> {
    return {
      httpPath: this.httpPath,
      port: this.port,
      initialDelaySeconds: this.initialDelaySeconds,
      periodSeconds: this.periodSeconds,
      timeoutSeconds: this.timeoutSeconds,
      successThreshold: this.successThreshold,
      failureThreshold: this.failureThreshold
    };
  }
}

/**
 * Health check configuration type for type checking
 */
export interface HealthCheckConfig {
  httpPath: string;
  port: number;
  initialDelaySeconds?: number;
  periodSeconds?: number;
  timeoutSeconds?: number;
  successThreshold?: number;
  failureThreshold?: number;
}
