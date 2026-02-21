/**
 * Sample configurations for testing wickedbased
 */

import { DockerImage, GitHubSource, HealthCheck, EnvironmentVariable } from '../../src/index';

/**
 * Sample Docker image configuration
 */
export const sampleDockerImage = new DockerImage({
  registryType: 'DOCKER_HUB',
  registry: 'postgrest',
  repository: 'postgrest',
  tag: 'v14.2'
});

/**
 * Sample Docker image with DOCR
 */
export const sampleDocrDockerImage = new DockerImage({
  registryType: 'DOCR',
  registry: 'postgrest-registry',
  repository: 'postgrest',
  tag: 'v14.2'
});

/**
 * Sample GitHub source configuration
 */
export const sampleGitHubSource = new GitHubSource({
  repo: 'supabase/postgrest',
  branch: 'v14.2',
  sourceDir: '/',
  dockerfilePath: 'Dockerfile',
  deployOnPush: false
});

/**
 * Sample health check configuration
 */
export const sampleHealthCheck = new HealthCheck({
  httpPath: '/',
  port: 3000,
  initialDelaySeconds: 45,
  periodSeconds: 10,
  timeoutSeconds: 10,
  successThreshold: 1,
  failureThreshold: 3
});

/**
 * Sample environment variables
 */
export const sampleEnvs = [
  new EnvironmentVariable({
    key: 'DATABASE_URL',
    value: 'postgresql://user:pass@db:5432/postgres',
    type: 'SECRET',
    scope: 'RUN_TIME'
  }),
  new EnvironmentVariable({
    key: 'PORT',
    value: '3000',
    type: 'GENERAL',
    scope: 'RUN_TIME'
  }),
  new EnvironmentVariable({
    key: 'BUILD_ARG',
    value: 'production',
    type: 'GENERAL',
    scope: 'BUILD_TIME'
  })
];

/**
 * Expected YAML output for a basic service
 */
export const expectedServiceYaml = `name: rest
instance_size_slug: professional-xs
instance_count: 1
source:
  registry_type: DOCKER_HUB
  registry: postgrest
  repository: postgrest
  tag: v14.2
http_port: 3000
health_check:
  http_path: /
  port: 3000
  initial_delay_seconds: 45
  period_seconds: 10
  timeout_seconds: 10
  success_threshold: 1
  failure_threshold: 3
envs:
  - key: DATABASE_URL
    value: postgresql://user:pass@db:5432/postgres
    type: SECRET
    scope: RUN_TIME
  - key: PORT
    value: "3000"
    type: GENERAL
    scope: RUN_TIME
  - key: BUILD_ARG
    value: production
    type: GENERAL
    scope: BUILD_TIME
`;

/**
 * Expected YAML output for a basic job
 */
export const expectedJobYaml = `name: migrate
kind: PRE_DEPLOY
run_command: npx prisma migrate deploy
instance_size_slug: professional-xs
instance_count: 1
source:
  registry_type: DOCKER_HUB
  registry: node
  repository: node
  tag: 20-alpine
envs: []
`;

/**
 * Sample service JSON output
 */
export const sampleServiceJSON = {
  name: 'rest',
  instance_size_slug: 'professional-xs',
  instance_count: 1,
  source: {
    registry_type: 'DOCKER_HUB',
    registry: 'postgrest',
    repository: 'postgrest',
    tag: 'v14.2'
  },
  http_port: 3000,
  health_check: {
    http_path: '/',
    port: 3000,
    initial_delay_seconds: 45,
    period_seconds: 10,
    timeout_seconds: 10,
    success_threshold: 1,
    failure_threshold: 3
  },
  envs: [
    {
      key: 'DATABASE_URL',
      value: 'postgresql://user:pass@db:5432/postgres',
      type: 'SECRET',
      scope: 'RUN_TIME'
    }
  ]
};

/**
 * Sample job JSON output
 */
export const sampleJobJSON = {
  name: 'migrate',
  kind: 'PRE_DEPLOY',
  run_command: 'npx prisma migrate deploy',
  instance_size_slug: 'professional-xs',
  instance_count: 1,
  source: {
    registry_type: 'DOCKER_HUB',
    registry: 'node',
    repository: 'node',
    tag: '20-alpine'
  },
  envs: []
};

/**
 * Invalid configurations for testing validation
 */
export const invalidConfigs = {
  missingName: {},
  invalidPort: {
    name: 'test',
    httpPort: 70000
  },
  negativeInstanceCount: {
    name: 'test',
    instanceSizeSlug: 'basic-xxs',
    instanceCount: -1
  },
  invalidHealthCheck: {
    name: 'test',
    healthCheck: {
      httpPath: '/health',
      port: -1
    }
  }
};

/**
 * Edge case configurations
 */
export const edgeCaseConfigs = {
  minimalService: {
    name: 'minimal',
    instanceSizeSlug: 'basic-xxs',
    instanceCount: 1
  },
  serviceWithMultipleEnvs: {
    name: 'multi-env',
    instanceSizeSlug: 'basic-xs',
    instanceCount: 2,
    envs: Array.from({ length: 50 }, (_, i) => ({
      key: `ENV_${i}`,
      value: `value_${i}`,
      type: 'GENERAL' as const,
      scope: 'RUN_TIME' as const
    }))
  },
  serviceWithInternalPorts: {
    name: 'multiport',
    instanceSizeSlug: 'basic-s',
    instanceCount: 1,
    httpPort: 8080,
    internalPorts: [8081, 8082]
  }
};

/**
 * Pulumi Output mock for testing
 */
export class MockPulumiOutput<T> {
  constructor(private value: T) {}

  apply<U>(fn: (v: T) => U): MockPulumiOutput<U> {
    return new MockPulumiOutput(fn(this.value));
  }

  then(onfulfilled?: (value: T) => T): PromiseLike<T> {
    return {
      then: (onfulfilled2?: (value: T) => T) => {
        const handler = onfulfilled || onfulfilled2;
        return Promise.resolve(handler ? handler(this.value) : this.value);
      }
    };
  }

  async promise(): Promise<T> {
    return this.value;
  }

  toJSON(): T {
    return this.value;
  }
}

/**
 * Sample Pulumi Output environment variable
 */
export const samplePulumiEnvVar = new EnvironmentVariable({
  key: 'DATABASE_URL',
  value: new MockPulumiOutput('postgresql://user:pass@db:5432/postgres'),
  type: 'SECRET',
  scope: 'RUN_TIME'
});
