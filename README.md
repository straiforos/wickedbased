# wickedbased

Supabase DO App Spec Library - TypeScript classes for DigitalOcean App Platform infrastructure with YAML serialization support. Wicked awesome, kid.

## Overview

`wickedbased` provides type-safe, object-oriented TypeScript classes for defining DigitalOcean App Platform resources. Replace those wicked fragile YAML templates with a robust, composable API that produces clean, properly-formatted YAML output. It's gonna be wicked pissa.

## Features

- **Type-safe**: Full TypeScript support with comprehensive type definitions
- **Validated**: Built-in validation ensures all configurations are valid before serialization
- **Composable**: Build complex configurations from reusable components
- **Pulumi Ready**: Seamlessly integrates with Pulumi Outputs for runtime value resolution
- **Clean YAML Output**: Automatic camelCase → snake_case transformation for API compatibility

## Installation

```bash
npm install wickedbased
# or
pnpm add wickedbased
# or
yarn add wickedbased
```

## Quick Start

```typescript
import { Service, DockerImage, HealthCheck, EnvironmentVariable } from 'wickedbased';

// Create a service with health checks and environment variables
const service = new Service({
  name: 'rest',
  instanceSizeSlug: 'professional-xs',
  instanceCount: 1,
  httpPort: 3000,
  source: new DockerImage({
    registryType: 'DOCKER_HUB',
    registry: 'postgrest',
    repository: 'postgrest',
    tag: 'v14.2'
  }),
  healthCheck: new HealthCheck({
    httpPath: '/',
    port: 3000,
    initialDelaySeconds: 45
  }),
  envs: [
    new EnvironmentVariable({
      key: 'DATABASE_URL',
      value: 'postgresql://user:pass@db:5432/postgres',
      type: 'SECRET',
      scope: 'RUN_TIME'
    })
  ]
});

// Convert to YAML
const yaml = await service.toYAML();
console.log(yaml);
```

Output:
```yaml
name: rest
instance_size_slug: professional-xs
instance_count: 1
http_port: 3000
source:
  registry_type: DOCKER_HUB
  registry: postgrest
  repository: postgrest
  tag: v14.2
health_check:
  http_path: /
  port: 3000
  initial_delay_seconds: 45
  period_seconds: 10
  timeout_seconds: 1
  success_threshold: 1
  failure_threshold: 3
envs:
  - key: DATABASE_URL
    value: postgresql://user:pass@db:5432/postgres
    type: SECRET
    scope: RUN_TIME
```

## Core Classes

### Service

Represents a web service that receives HTTP traffic.

```typescript
import { Service, DockerImage, HealthCheck } from 'wickedbased';

const service = new Service({
  name: 'my-service',
  instanceSizeSlug: 'professional-xs',
  instanceCount: 2,
  httpPort: 8080,
  internalPorts: [8081, 8082],
  healthCheck: new HealthCheck({
    httpPath: '/health',
    port: 8080,
    initialDelaySeconds: 30,
    periodSeconds: 10,
    timeoutSeconds: 5
  }),
  runCommand: 'npm start',
  source: new DockerImage({
    registryType: 'DOCKER_HUB',
    repository: 'node',
    tag: '20-alpine'
  })
});

const yaml = await service.toYAML();
```

### Job

Represents a one-time or scheduled task that runs to completion.

```typescript
import { Job, DockerImage } from 'wickedbased';

const preDeployJob = new Job({
  name: 'migrate',
  kind: 'PRE_DEPLOY',
  runCommand: 'npx prisma migrate deploy',
  instanceSizeSlug: 'professional-xs',
  instanceCount: 1,
  source: new DockerImage({
    registryType: 'DOCKER_HUB',
    repository: 'node',
    tag: '20-alpine'
  })
});

const yaml = await job.toYAML();
```

### Worker

Represents a background worker that runs continuously without HTTP traffic.

```typescript
import { Worker, DockerImage } from 'wickedbased';

const worker = new Worker({
  name: 'background-processor',
  instanceSizeSlug: 'professional-xs',
  instanceCount: 2,
  runCommand: 'npm run worker',
  source: new DockerImage({
    registryType: 'DOCKER_HUB',
    repository: 'node',
    tag: '20-alpine'
  })
});

const yaml = await worker.toYAML();
```

## Configuration Classes

### EnvironmentVariable

Environment variables with type and scope support.

```typescript
const envVar = new EnvironmentVariable({
  key: 'DATABASE_URL',
  value: 'postgresql://localhost:5432/db',
  type: 'SECRET',      // GENERAL | SECRET
  scope: 'RUN_TIME'     // RUN_TIME | BUILD_TIME | DEPLOY_TIME
});
```

### HealthCheck

Health check configuration with customizable timing parameters.

```typescript
const healthCheck = new HealthCheck({
  httpPath: '/',
  port: 3000,
  initialDelaySeconds: 45,  // Wait before first check (default: 0)
  periodSeconds: 10,        // Time between checks (default: 10)
  timeoutSeconds: 10,       // Check timeout (default: 1)
  successThreshold: 1,      // Successes needed (default: 1)
  failureThreshold: 3       // Failures to mark unhealthy (default: 3)
});
```

### DockerImage

Docker image source configuration.

```typescript
// Docker Hub (without registry)
const dockerHub = new DockerImage({
  registryType: 'DOCKER_HUB',
  repository: 'nginx',
  tag: 'latest'
});

// DigitalOcean Container Registry (requires registry)
const docr = new DockerImage({
  registryType: 'DOCR',
  registry: 'my-registry',
  repository: 'my-app',
  tag: 'v1.0.0'
});

// GitHub Container Registry
const ghcr = new DockerImage({
  registryType: 'GHCR',
  repository: 'my-org/my-app',
  tag: 'main'
});
```

### GitHubSource

GitHub repository source configuration.

```typescript
const gitHubSource = new GitHubSource({
  repo: 'owner/repo',
  branch: 'main',
  sourceDir: '/',                    // Source directory (default: /)
  dockerfilePath: 'Dockerfile',      // Dockerfile path (default: Dockerfile)
  deployOnPush: false                // Auto-deploy on push (default: false)
});
```

## Environment Variable Management

All resources (Service, Job, Worker) support environment variable management:

```typescript
const service = new Service({
  name: 'my-service',
  instanceSizeSlug: 'basic-xxs',
  instanceCount: 1,
  envs: [
    new EnvironmentVariable({
      key: 'PORT',
      value: '3000'
    })
  ]
});

// Add environment variable
service.addEnv(new EnvironmentVariable({
  key: 'NODE_ENV',
  value: 'production',
  type: 'GENERAL'
}));

// Get environment variable
const port = service.getEnv('PORT');

// Remove environment variable
service.removeEnv('NODE_ENV');

// List all environment variables
const allEnvs = service.listEnvs();
```

## Pulumi Integration

Use Pulumi Outputs for runtime value resolution:

```typescript
import * as pulumi from '@pulumi/pulumi';
import { Service, DockerImage, EnvironmentVariable } from 'wickedbased';

// Assume dbUrl is a Pulumi Output from a database resource
const dbUrl = pulumi.output('postgresql://user:pass@db:5432/postgres');

const service = new Service({
  name: 'my-service',
  instanceSizeSlug: 'basic-xxs',
  instanceCount: 1,
  source: new DockerImage({
    registryType: 'DOCKER_HUB',
    repository: 'node',
    tag: '20-alpine'
  }),
  envs: [
    new EnvironmentVariable({
      key: 'DATABASE_URL',
      value: dbUrl,  // Pulumi Output - resolved at runtime
      type: 'SECRET',
      scope: 'RUN_TIME'
    })
  ]
});

// toYAML() automatically resolves Pulumi Outputs
const yaml = await service.toYAML();
```

## Validation

All configurations are validated on construction:

```typescript
import { ValidationError } from 'wickedbased';

try {
  const service = new Service({
    name: '',  // Empty name - will throw ValidationError
    instanceSizeSlug: 'basic-xxs',
    instanceCount: 1
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation failed for field "${error.field}": ${error.constraint}`);
    // Validation failed for field "name": must be non-empty (excluding whitespace)
  }
}
```

### Common Validation Rules

- **name**: Non-empty string
- **instanceSizeSlug**: Valid DO instance size slug (e.g., 'basic-xxs', 'professional-xs')
- **instanceCount**: Positive integer
- **httpPort**: Integer between 1 and 65535
- **envs.key**: Non-empty string, unique within resource
- **healthCheck.port**: Integer between 1 and 65535
- **healthCheck.timing**: Non-negative integers (periodSeconds, timeoutSeconds must be > 0)

## Instance Size Slugs

Common DigitalOcean App Platform instance sizes:

| Size | vCPUs | RAM | Transfer |
|------|-------|-----|----------|
| basic-xxs | 0.125 vCPU | 256 MB | 200 GB |
| basic-xs | 0.25 vCPU | 512 MB | 500 GB |
| basic-s | 0.5 vCPU | 1 GB | 1 TB |
| basic-m | 1 vCPU | 2 GB | 2.5 TB |
| professional-xs | 1 vCPU | 2 GB | 4 TB |
| professional-s | 2 vCPU | 4 GB | 5 TB |
| professional-m | 4 vCPU | 8 GB | 6 TB |
| professional-l | 8 vCPU | 16 GB | 8 TB |

## Migration from YAML Templates

### Before (YAML Template)

```yaml
# templates/service.yaml
name: rest
instance_size_slug: professional-xs
instance_count: 1
source:
  registry_type: DOCKER_HUB
  repository: postgrest
  tag: v14.2
http_port: 3000
health_check:
  http_path: /
  port: 3000
  initial_delay_seconds: 45
envs:
  - key: DATABASE_URL
    value: "{{ .Values.database.url }}"
    type: SECRET
    scope: RUN_TIME
```

### After (wickedbased)

```typescript
import { Service, DockerImage, HealthCheck, EnvironmentVariable } from 'wickedbased';

const service = new Service({
  name: 'rest',
  instanceSizeSlug: 'professional-xs',
  instanceCount: 1,
  source: new DockerImage({
    registryType: 'DOCKER_HUB',
    repository: 'postgrest',
    tag: 'v14.2'
  }),
  httpPort: 3000,
  healthCheck: new HealthCheck({
    httpPath: '/',
    port: 3000,
    initialDelaySeconds: 45
  }),
  envs: [
    new EnvironmentVariable({
      key: 'DATABASE_URL',
      value: databaseUrl,  // Direct value or Pulumi Output
      type: 'SECRET',
      scope: 'RUN_TIME'
    })
  ]
});

const yaml = await service.toYAML();
```

## Advanced Usage

### Multiple Services

```typescript
import { Service, DockerImage, GitHubSource } from 'wickedbased';

const apiService = new Service({
  name: 'api',
  instanceSizeSlug: 'professional-xs',
  instanceCount: 2,
  httpPort: 8080,
  source: new GitHubSource({
    repo: 'org/api',
    branch: 'main'
  })
});

const webService = new Service({
  name: 'web',
  instanceSizeSlug: 'basic-s',
  instanceCount: 1,
  httpPort: 80,
  source: new DockerImage({
    registryType: 'DOCKER_HUB',
    repository: 'nginx',
    tag: 'latest'
  })
});

const apiYaml = await apiService.toYAML();
const webYaml = await webService.toYAML();
```

### Pre and Post Deploy Jobs

```typescript
import { Job, DockerImage } from 'wickedbased';

const preDeployJob = new Job({
  name: 'migrate',
  kind: 'PRE_DEPLOY',
  runCommand: 'npx prisma migrate deploy',
  instanceSizeSlug: 'professional-xs',
  instanceCount: 1,
  source: new DockerImage({
    registryType: 'DOCKER_HUB',
    repository: 'node',
    tag: '20-alpine'
  })
});

const postDeployJob = new Job({
  name: 'seed',
  kind: 'POST_DEPLOY',
  runCommand: 'npm run seed',
  instanceSizeSlug: 'basic-xxs',
  instanceCount: 1,
  source: new DockerImage({
    registryType: 'DOCKER_HUB',
    repository: 'node',
    tag: '20-alpine'
  })
});
```

### Volume Mounts

```typescript
import { Service, DockerImage, VolumeMount } from 'wickedbased';

const service = new Service({
  name: 'data-service',
  instanceSizeSlug: 'basic-m',
  instanceCount: 1,
  source: new DockerImage({
    registryType: 'DOCKER_HUB',
    repository: 'node',
    tag: '20-alpine'
  }),
  volumes: [
    new VolumeMount({
      name: 'data',
      mountPath: '/data',
      size: 10  // Size in GB
    })
  ]
});
```

## API Reference

### Classes

- `Service` - Web service resource
- `Job` - One-time task resource
- `Worker` - Background worker resource
- `EnvironmentVariable` - Environment variable configuration
- `HealthCheck` - Health check configuration
- `DockerImage` - Docker image source
- `GitHubSource` - GitHub repository source
- `VolumeMount` - Volume mount configuration

### Methods

#### AppPlatformResource (base class)

```typescript
abstract class AppPlatformResource {
  readonly name: string;
  addEnv(env: EnvironmentVariable): void;
  removeEnv(key: string): boolean;
  getEnv(key: string): EnvironmentVariable | undefined;
  listEnvs(): readonly EnvironmentVariable[];
  abstract toJSON(): Record<string, unknown>;
  async toYAML(): Promise<string>;
}
```

#### Service

```typescript
class Service extends AppPlatformResource {
  constructor(config: {
    name: string;
    instanceSizeSlug: string;
    instanceCount: number;
    httpPort?: number;
    internalPorts?: number[];
    healthCheck?: HealthCheck;
    runCommand?: string;
    volumes?: VolumeMount[];
    source?: DockerImage | GitHubSource;
    envs?: EnvironmentVariable[];
  });
}
```

#### Job

```typescript
class Job extends AppPlatformResource {
  constructor(config: {
    name: string;
    kind: 'PRE_DEPLOY' | 'POST_DEPLOY';
    runCommand: string;
    instanceSizeSlug?: string;
    instanceCount?: number;
    source?: DockerImage | GitHubSource;
    envs?: EnvironmentVariable[];
  });
}
```

#### Worker

```typescript
class Worker extends AppPlatformResource {
  constructor(config: {
    name: string;
    instanceSizeSlug: string;
    instanceCount: number;
    internalPorts?: number[];
    runCommand?: string;
    volumes?: VolumeMount[];
    source?: DockerImage | GitHubSource;
    envs?: EnvironmentVariable[];
  });
}
```

## Error Handling

All validation errors throw `ValidationError`:

```typescript
import { ValidationError } from 'wickedbased';

try {
  const service = new Service({
    name: 'test',
    instanceSizeSlug: 'basic-xxs',
    instanceCount: -1  // Invalid
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(error.field);      // 'instanceCount'
    console.error(error.value);      // -1
    console.error(error.constraint); // 'must be a positive integer'
  }
}
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT

## Support

- GitHub Issues: [https://github.com/your-org/wickedbased/issues](https://github.com/your-org/wickedbased/issues)
- Documentation: [https://github.com/your-org/wickedbased/tree/main/packages/wickedbased](https://github.com/your-org/wickedbased/tree/main/packages/wickedbased)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
