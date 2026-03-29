import * as fs from 'fs';
import * as path from 'path';

interface ServiceConfig {
  serviceName: string;
  serviceType: string;
  port: string;
}

export function generateDockerFiles(serviceDir: string, config: ServiceConfig): void {
  // Dockerfile with Zero-Trust principles
  const dockerfile = `# Multi-stage build for minimal attack surface
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production image - minimal and non-root
FROM node:20-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy only necessary files
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs package.json ./

# Security hardening
RUN apk --no-cache add dumb-init && \\
    rm -rf /tmp/* /var/cache/apk/*

USER nodejs
EXPOSE ${config.port}

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
`;
  fs.writeFileSync(path.join(serviceDir, 'Dockerfile'), dockerfile);

  // .dockerignore
  const dockerignore = `node_modules
npm-debug.log
dist
.git
.env
*.md
`;
  fs.writeFileSync(path.join(serviceDir, '.dockerignore'), dockerignore);

  // docker-compose.yml for local development
  const dockerCompose = `version: '3.8'

services:
  ${config.serviceName}:
    build: .
    ports:
      - "${config.port}:${config.port}"
    environment:
      - NODE_ENV=development
      - PORT=${config.port}
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
`;
  fs.writeFileSync(path.join(serviceDir, 'docker-compose.yml'), dockerCompose);
}
