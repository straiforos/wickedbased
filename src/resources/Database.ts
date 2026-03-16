/**
 * Database resource for DigitalOcean App Platform
 *
 * Represents a managed database (PostgreSQL or Redis) attached to an app.
 * Uses Zod for validation.
 */
import { DatabaseSchema } from '../validation/schemas.js';
import type { Serializable } from '../types/index.js';

/**
 * Database engine type
 */
export type DatabaseEngine = 'PG' | 'REDIS';

/**
 * Database configuration
 */
export interface DatabaseConfig {
  /** Database name (unique within the app) */
  name: string;
  /** Engine: PG (PostgreSQL) or REDIS */
  engine: DatabaseEngine;
  /** Engine version (e.g. "16", "7") */
  version: string;
  /** Number of nodes (1–3) */
  numNodes: number;
  /** Size slug (e.g. db-s-dev-database, db-s-1vcpu-1gb) */
  size: string;
  /** Whether this is a production database */
  production?: boolean;
}

/**
 * Database resource for App Platform spec
 */
export class Database implements Serializable {
  readonly name: string;
  readonly engine: DatabaseEngine;
  readonly version: string;
  readonly numNodes: number;
  readonly size: string;
  readonly production: boolean;

  constructor(config: DatabaseConfig) {
    const data = DatabaseSchema.parse({
      name: config.name,
      engine: config.engine,
      version: config.version,
      numNodes: config.numNodes,
      size: config.size,
      production: config.production ?? false
    });

    this.name = data.name;
    this.engine = data.engine;
    this.version = data.version;
    this.numNodes = data.numNodes;
    this.size = data.size;
    this.production = data.production;
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      engine: this.engine,
      version: this.version,
      numNodes: this.numNodes,
      size: this.size,
      production: this.production
    };
  }
}
