import * as fs from 'fs';
import * as path from 'path';

interface ServiceConfig {
  serviceName: string;
  serviceType: string;
  port: string;
}

export function generateTypeScriptFiles(serviceDir: string, config: ServiceConfig): void {
  const srcDir = path.join(serviceDir, 'src');
  fs.mkdirSync(srcDir, { recursive: true });

  // package.json
  const packageJson = {
    name: `@codex/${config.serviceName}`,
    version: '1.0.0',
    scripts: {
      dev: 'ts-node src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js',
      test: 'jest'
    },
    dependencies: {
      express: '^4.18.0',
      helmet: '^7.1.0',
      'express-rate-limit': '^7.1.0'
    },
    devDependencies: {
      '@types/express': '^4.17.0',
      '@types/node': '^20.10.0',
      typescript: '^5.3.0',
      'ts-node': '^10.9.0'
    }
  };
  fs.writeFileSync(path.join(serviceDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  // tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true
    }
  };
  fs.writeFileSync(path.join(serviceDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));

  // src/index.ts
  const indexTs = `import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || ${config.port};

// Zero-Trust Security Middleware
app.use(helmet({
  contentSecurityPolicy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true }
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: '${config.serviceName}' });
});

// Service routes
app.get('/api/v1/status', (req, res) => {
  res.json({ message: 'Service running', type: '${config.serviceType}' });
});

app.listen(PORT, () => {
  console.log(\`🔒 ${config.serviceName} listening on port \${PORT}\`);
});
`;
  fs.writeFileSync(path.join(srcDir, 'index.ts'), indexTs);

  // .env.example
  const envExample = `PORT=${config.port}
NODE_ENV=production
LOG_LEVEL=info
`;
  fs.writeFileSync(path.join(serviceDir, '.env.example'), envExample);
}
