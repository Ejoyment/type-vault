# CODEX INC Service Scaffolder

CLI tool for rapidly bootstrapping Zero-Trust compliant microservices.

## Installation

```bash
npm install -g @codex-inc/service-scaffold
```

## Usage

```bash
codex-scaffold new
```

Follow the interactive prompts to configure your service.

## What Gets Generated

- TypeScript boilerplate with Express.js
- Zero-Trust security middleware (Helmet, rate limiting)
- Multi-stage Dockerfile (non-root user, minimal image)
- Docker Compose for local development
- Kubernetes manifests (Deployment, Service, NetworkPolicy, PodSecurityPolicy)
- Health check endpoints

## Zero-Trust Security Features

- Non-root container execution
- Read-only root filesystem
- Dropped Linux capabilities
- Network policies (default deny)
- Security headers (CSP, HSTS)
- Rate limiting
- Minimal attack surface

## Development

```bash
npm install
npm run build
npm start
```
