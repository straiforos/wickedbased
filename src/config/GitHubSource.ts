/**
 * GitHub repository source configuration for App Platform
 *
 * Defines a GitHub repository as a build source for App Platform resources.
 * Supports specifying branch, source directory, and Dockerfile location.
 * Uses Zod for validation.
 */
import { GitHubSourceSchema } from '../validation/schemas.js';
import type { Serializable } from '../types/index.js';

/**
 * GitHub source configuration
 */
export class GitHubSource implements Serializable {
  /**
   * GitHub repository in format "owner/repo"
   */
  readonly repo: string;

  /**
   * The git branch to deploy from (required)
   */
  readonly branch: string;

  /**
   * Directory within repository containing app code
   * Relative to repository root (default: '/')
   */
  readonly sourceDir: string;

  /**
   * Path to Dockerfile
   * Relative to sourceDir (default: 'Dockerfile')
   */
  readonly dockerfilePath: string;

  /**
   * Whether to auto-deploy on push to specified branch
   * (default: false)
   */
  readonly deployOnPush: boolean;

  /**
   * Creates a new GitHubSource instance
   *
   * @param config - GitHub source configuration
   * @param config.repo - Repository in "owner/repo" format (required)
   * @param config.branch - Git branch name (required, non-empty)
   * @param config.sourceDir - Source directory (default: '/')
   * @param config.dockerfilePath - Dockerfile path (default: 'Dockerfile')
   * @param config.deployOnPush - Auto-deploy on push (default: false)
   * @throws ZodError if required fields are missing or invalid
   */
  constructor(config: {
    repo: string;
    branch: string;
    sourceDir?: string;
    dockerfilePath?: string;
    deployOnPush?: boolean;
  }) {
    const data = GitHubSourceSchema.parse(config);

    this.repo = data.repo;
    this.branch = data.branch;
    this.sourceDir = data.sourceDir;
    this.dockerfilePath = data.dockerfilePath;
    this.deployOnPush = data.deployOnPush;
  }

  /**
   * Converts GitHub source to a JSON object
   *
   * @returns JSON representation with camelCase keys
   */
  toJSON(): Record<string, unknown> {
    return {
      repo: this.repo,
      branch: this.branch,
      sourceDir: this.sourceDir,
      dockerfilePath: this.dockerfilePath,
      deployOnPush: this.deployOnPush
    };
  }
}

/**
 * GitHub source configuration type for type checking
 */
export interface GitHubSourceConfig {
  repo: string;
  branch: string;
  sourceDir?: string;
  dockerfilePath?: string;
  deployOnPush?: boolean;
}
