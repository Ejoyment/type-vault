import * as fs from 'fs';
import * as path from 'path';
import { generateTypeScriptFiles } from './templates/typescript';
import { generateDockerFiles } from './templates/docker';
import { generateK8sManifests } from './templates/kubernetes';

interface ServiceConfig {
  serviceName: string;
  serviceType: string;
  port: string;
}

export async function scaffoldService(config: ServiceConfig): Promise<void> {
  const serviceDir = path.join(process.cwd(), config.serviceName);

  if (fs.existsSync(serviceDir)) {
    throw new Error(`Directory ${config.serviceName} already exists`);
  }

  fs.mkdirSync(serviceDir, { recursive: true });

  // Generate TypeScript boilerplate
  generateTypeScriptFiles(serviceDir, config);

  // Generate Docker files
  generateDockerFiles(serviceDir, config);

  // Generate Kubernetes manifests
  generateK8sManifests(serviceDir, config);
}
