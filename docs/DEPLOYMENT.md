# CivicReport Deployment Guide

## Overview
This guide covers deploying CivicReport to production using Kubernetes on AWS with proper security, monitoring, and scalability configurations.

## Prerequisites

### Infrastructure Requirements
- **Kubernetes Cluster**: EKS 1.28+
- **Database**: AWS RDS PostgreSQL 15 with PostGIS
- **Cache**: AWS ElastiCache Redis 7
- **Storage**: AWS S3 for images and certificates
- **CDN**: AWS CloudFront for certificate distribution
- **Load Balancer**: AWS ALB with SSL termination
- **Monitoring**: DataDog or CloudWatch

### Tools Required
- kubectl
- helm
- docker
- aws-cli
- terraform (optional)

## Environment Setup

### 1. AWS Infrastructure

```bash
# Create EKS cluster
eksctl create cluster \
  --name civic-report-prod \
  --version 1.28 \
  --region us-east-1 \
  --nodegroup-name civic-report-nodes \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 10 \
  --managed
```

### 2. Database Setup

```sql
-- Create RDS PostgreSQL instance with PostGIS
-- Instance class: db.r5.large
-- Multi-AZ: Yes
-- Backup retention: 7 days
-- Encryption: Enabled

-- Connect and run schema
psql -h your-rds-endpoint -U postgres -d civic_report -f database/schema.sql
```

### 3. Redis Setup

```bash
# Create ElastiCache Redis cluster
aws elasticache create-replication-group \
  --replication-group-id civic-report-redis \
  --description "CivicReport Redis Cluster" \
  --node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-clusters 2 \
  --preferred-cache-cluster-a-zs us-east-1a us-east-1b
```

## Kubernetes Deployment

### 1. Create Namespace and Secrets

```bash
# Create namespace
kubectl create namespace civic-report

# Create secrets (replace with actual values)
kubectl create secret generic civic-report-secrets \
  --namespace=civic-report \
  --from-literal=DATABASE_URL="postgresql://username:password@rds-endpoint:5432/civic_report" \
  --from-literal=JWT_SECRET="your-super-secret-jwt-key" \
  --from-literal=OPENAI_API_KEY="your-openai-api-key" \
  --from-literal=TWITTER_API_KEY="your-twitter-api-key" \
  --from-literal=TWITTER_API_SECRET="your-twitter-api-secret" \
  --from-literal=AWS_ACCESS_KEY_ID="your-aws-access-key" \
  --from-literal=AWS_SECRET_ACCESS_KEY="your-aws-secret-key" \
  --from-literal=GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

### 2. Deploy Database Schema

```bash
# Create a job to run database migrations
kubectl apply -f infrastructure/k8s/migration-job.yaml
```

### 3. Deploy Application

```bash
# Deploy all services
kubectl apply -f infrastructure/k8s/deployment.yaml

# Verify deployments
kubectl get pods -n civic-report
kubectl get services -n civic-report
kubectl get ingress -n civic-report
```

### 4. Configure SSL/TLS

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
kubectl apply -f infrastructure/k8s/cluster-issuer.yaml
```

## Docker Images

### 1. Build Images

```bash
# Build backend image
docker build -t civic-report/backend:latest ./backend

# Tag for registry
docker tag civic-report/backend:latest your-registry/civic-report/backend:latest

# Push to registry
docker push your-registry/civic-report/backend:latest
```

### 2. Update Deployment

```bash
# Update image in deployment
kubectl set image deployment/backend-api backend-api=your-registry/civic-report/backend:latest -n civic-report

# Verify rollout
kubectl rollout status deployment/backend-api -n civic-report
```

## Environment Configuration

### Production Environment Variables

```yaml
# ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: civic-report-config
  namespace: civic-report
data:
  NODE_ENV: "production"
  API_VERSION: "v1"
  PORT: "3000"
  REDIS_HOST: "your-redis-endpoint"
  REDIS_PORT: "6379"
  LOG_LEVEL: "info"
  CORS_ORIGIN: "https://app.civicreport.com"
  API_RATE_LIMIT: "100"
  API_RATE_WINDOW: "60000"
  MAX_UPLOAD_SIZE: "10485760"
```

### Secrets Configuration

```yaml
# Secret
apiVersion: v1
kind: Secret
metadata:
  name: civic-report-secrets
  namespace: civic-report
type: Opaque
stringData:
  DATABASE_URL: "postgresql://username:password@rds-endpoint:5432/civic_report"
  JWT_SECRET: "your-256-bit-secret-key"
  OPENAI_API_KEY: "sk-your-openai-key"
  TWITTER_API_KEY: "your-twitter-api-key"
  TWITTER_API_SECRET: "your-twitter-api-secret"
  TWITTER_ACCESS_TOKEN: "your-access-token"
  TWITTER_ACCESS_TOKEN_SECRET: "your-access-token-secret"
  AWS_ACCESS_KEY_ID: "AKIAIOSFODNN7EXAMPLE"
  AWS_SECRET_ACCESS_KEY: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
  AWS_REGION: "us-east-1"
  AWS_S3_BUCKET: "civic-report-prod-images"
  GOOGLE_MAPS_API_KEY: "AIzaSyBOti4mM-6x9WDnKIBFR-Example"
```

## Monitoring and Logging

### 1. Install Monitoring Stack

```bash
# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --values infrastructure/helm/prometheus-values.yaml

# Install Grafana
helm install grafana grafana/grafana \
  --namespace monitoring \
  --values infrastructure/helm/grafana-values.yaml
```

### 2. Configure Logging

```yaml
# Fluentd ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: civic-report
data:
  fluent.conf: |
    <source>
      @type kubernetes
      tag kubernetes.*
      format json
      time_format %Y-%m-%dT%H:%M:%S.%NZ
    </source>
    
    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch-service
      port 9200
      index_name civic-report
    </match>
```

### 3. Set Up Alerts

```yaml
# Prometheus AlertManager Rules
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: civic-report-alerts
  namespace: civic-report
spec:
  groups:
  - name: civic-report
    rules:
    - alert: HighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: High error rate detected
        
    - alert: HighResponseTime
      expr: histogram_quantile(0.95, http_request_duration_seconds) > 2
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: High response time detected
        
    - alert: QueueDepthHigh
      expr: queue_depth > 100
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: Processing queue depth is high
```

## Scaling Configuration

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-api-hpa
  namespace: civic-report
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Cluster Autoscaler

```bash
# Install cluster autoscaler
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml

# Configure for EKS
kubectl annotate deployment.apps/cluster-autoscaler \
  cluster-autoscaler.kubernetes.io/safe-to-evict="false" \
  -n kube-system
```

## Security Configuration

### 1. Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: civic-report-network-policy
  namespace: civic-report
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
```

### 2. Pod Security Standards

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: civic-report
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### 3. RBAC Configuration

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: civic-report
  name: civic-report-role
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: civic-report-binding
  namespace: civic-report
subjects:
- kind: ServiceAccount
  name: civic-report-sa
  namespace: civic-report
roleRef:
  kind: Role
  name: civic-report-role
  apiGroup: rbac.authorization.k8s.io
```

## Backup and Disaster Recovery

### 1. Database Backups

```bash
# Automated RDS backups are enabled
# For additional backups:
pg_dump -h your-rds-endpoint -U postgres civic_report > backup-$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup-$(date +%Y%m%d).sql s3://civic-report-backups/database/
```

### 2. Application State Backup

```bash
# Backup Kubernetes resources
kubectl get all,configmaps,secrets -n civic-report -o yaml > civic-report-k8s-backup.yaml

# Store in version control or S3
aws s3 cp civic-report-k8s-backup.yaml s3://civic-report-backups/k8s/
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Create additional indexes for production
CREATE INDEX CONCURRENTLY idx_reports_location_created ON reports USING GIST(location, created_at);
CREATE INDEX CONCURRENTLY idx_reports_status_priority ON reports(status, (ai_analysis->>'urgency_score'));

-- Update statistics
ANALYZE reports;
ANALYZE government_officials;

-- Configure connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
```

### 2. Redis Configuration

```bash
# Configure Redis for production
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
redis-cli CONFIG SET save "900 1 300 10 60 10000"
```

### 3. CDN Configuration

```bash
# Configure CloudFront for certificate distribution
aws cloudfront create-distribution \
  --distribution-config file://infrastructure/aws/cloudfront-config.json
```

## Health Checks and Monitoring

### Application Health Endpoints

```typescript
// Health check implementation
@Get('/health/live')
healthCheck() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}

@Get('/health/ready')
async readinessCheck() {
  const checks = await Promise.allSettled([
    this.databaseService.ping(),
    this.redisService.ping(),
    this.openaiService.ping(),
  ]);
  
  return {
    status: checks.every(c => c.status === 'fulfilled') ? 'ok' : 'error',
    checks: {
      database: checks[0].status === 'fulfilled' ? 'ok' : 'error',
      redis: checks[1].status === 'fulfilled' ? 'ok' : 'error',
      openai: checks[2].status === 'fulfilled' ? 'ok' : 'error',
    },
    timestamp: new Date().toISOString(),
  };
}
```

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   ```bash
   kubectl top pods -n civic-report
   kubectl describe pod <pod-name> -n civic-report
   ```

2. **Database Connection Issues**
   ```bash
   kubectl logs deployment/backend-api -n civic-report | grep -i database
   ```

3. **Queue Processing Delays**
   ```bash
   redis-cli -h your-redis-endpoint
   > KEYS bull:*
   > LLEN bull:report-processing:waiting
   ```

### Emergency Procedures

1. **Scale Down for Maintenance**
   ```bash
   kubectl scale deployment backend-api --replicas=0 -n civic-report
   ```

2. **Emergency Database Connection**
   ```bash
   kubectl run postgres-client --image=postgres:15 -it --rm --restart=Never -- \
     psql -h your-rds-endpoint -U postgres civic_report
   ```

3. **Clear Redis Cache**
   ```bash
   redis-cli -h your-redis-endpoint FLUSHDB
   ```

## Cost Optimization

### Resource Optimization

```yaml
# Optimized resource requests/limits
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### AWS Cost Optimization

```bash
# Use Spot instances for development
eksctl create nodegroup \
  --cluster civic-report-prod \
  --name spot-nodes \
  --instance-types=t3.medium,t3.large \
  --spot \
  --nodes-min=1 \
  --nodes-max=5
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**:
   - Review monitoring alerts
   - Check disk usage and performance
   - Update dependencies (security patches)

2. **Monthly**:
   - Review and optimize database queries
   - Analyze cost reports
   - Update Docker images

3. **Quarterly**:
   - Security audit
   - Disaster recovery testing
   - Performance optimization review

### Contact Information

- **DevOps Team**: devops@civicreport.com
- **On-call**: +1-555-CIVIC-01
- **Documentation**: https://docs.civicreport.com/deployment
- **Status Page**: https://status.civicreport.com
