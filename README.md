# CODEX INC Service Scaffolder

CLI tool for bootstrapping TypeScript/Express microservices with security-conscious defaults.

## Status

Working local CLI — not yet published to npm.

```bash
git clone https://github.com/Ejoyment/type-vault.git
cd type-vault
npm install
npm run build
node dist/cli.js new --service-name my-service --service-type api --port 3000
```

## What Gets Generated

- TypeScript/Express boilerplate (`src/index.ts`, `package.json`, `tsconfig.json`, `.env.example`)
- Multi-stage Dockerfile (non-root user, minimal image) + `docker-compose.yml`
- Kubernetes manifests: Deployment, Service, NetworkPolicy [+ whatever you land on for pod security]
- Security middleware (Helmet, rate limiting)

## Security-conscious defaults

- Non-root container execution
- Network policies (default deny)
- Security headers (CSP, HSTS)
- Rate limiting