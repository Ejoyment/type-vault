import * as fs from 'fs';
import * as path from 'path';

interface ServiceConfig {
  serviceName: string;
  serviceType: string;
  port: string;
}

export function generateK8sManifests(serviceDir: string, config: ServiceConfig): void {
  const k8sDir = path.join(serviceDir, 'k8s');
  fs.mkdirSync(k8sDir, { recursive: true });

  // Deployment with Zero-Trust security
  const deployment = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${config.serviceName}
  labels:
    app: ${config.serviceName}
    type: ${config.serviceType}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${config.serviceName}
  template:
    metadata:
      labels:
        app: ${config.serviceName}
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
        seccompProfile:
          type: RuntimeDefault
      containers:
      - name: ${config.serviceName}
        image: codex/${config.serviceName}:latest
        ports:
        - containerPort: ${config.port}
          protocol: TCP
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: ${config.port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: ${config.port}
          initialDelaySeconds: 5
          periodSeconds: 5
        env:
        - name: PORT
          value: "${config.port}"
        - name: NODE_ENV
          value: "production"
`;
  fs.writeFileSync(path.join(k8sDir, 'deployment.yaml'), deployment);

  // Service
  const service = `apiVersion: v1
kind: Service
metadata:
  name: ${config.serviceName}
  labels:
    app: ${config.serviceName}
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: ${config.port}
    protocol: TCP
  selector:
    app: ${config.serviceName}
`;
  fs.writeFileSync(path.join(k8sDir, 'service.yaml'), service);

  // NetworkPolicy for Zero-Trust
  const networkPolicy = `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${config.serviceName}-netpol
spec:
  podSelector:
    matchLabels:
      app: ${config.serviceName}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: codex-services
    ports:
    - protocol: TCP
      port: ${config.port}
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
`;
  fs.writeFileSync(path.join(k8sDir, 'network-policy.yaml'), networkPolicy);

  // PodSecurityPolicy
  const psp = `apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: ${config.serviceName}-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
  - ALL
  volumes:
  - 'configMap'
  - 'emptyDir'
  - 'projected'
  - 'secret'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
  readOnlyRootFilesystem: true
`;
  fs.writeFileSync(path.join(k8sDir, 'pod-security-policy.yaml'), psp);
}
