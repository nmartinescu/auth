# Docker Containerization Guide

## Architecture Overview

This project uses Docker and Docker Compose to containerize all services:

- **Main Service**: Single instance - API gateway and authentication (Port 3000)
- **Test Service**: Single instance - Test generation (Port 3004)
- **CPU Service**: Multiple instances - CPU scheduling algorithms (Load balanced via RabbitMQ)
- **Disk Service**: Multiple instances - Disk scheduling algorithms (Load balanced via RabbitMQ)
- **Memory Service**: Multiple instances - Memory management algorithms (Load balanced via RabbitMQ)
- **RabbitMQ**: Message broker for inter-service communication (Ports 5672, 15672)
- **MongoDB**: Database for persistent storage (Port 27017)

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+

## Quick Start

### 1. Clone and Setup

```bash
cd c:\Users\marti\Desktop\auth
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` file with your desired configuration:

```env
# Adjust the number of instances for each service
CPU_SERVICE_REPLICAS=2
DISK_SERVICE_REPLICAS=2
MEMORY_SERVICE_REPLICAS=2

# Set production-ready secrets
JWT_SECRET=your-production-secret
RABBITMQ_PASS=secure-password
MONGO_PASS=secure-password
```

### 3. Choose Your Mode

#### **Development Mode** (Hot Reload - Files are Watched)
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

#### **Production Mode** (Optimized Build)
```bash
docker-compose up -d --build
```

## Development Workflow

### Live Development with Hot Reload

1. **Start in development mode:**
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

2. **Edit your code** in `backend/` folders - changes are automatically reflected!
   - Code is mounted as a volume
   - Nodemon watches for changes and restarts the service
   - See changes instantly without rebuilding

3. **View logs to see restarts:**
```bash
docker-compose -f docker-compose.dev.yml logs -f cpu-service
```

4. **Install new npm packages:**
```bash
# Rebuild the specific service after adding to package.json
docker-compose -f docker-compose.dev.yml up -d --build cpu-service
```

### Key Differences: Dev vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| **Dockerfile** | `Dockerfile.dev` | `Dockerfile` |
| **Dependencies** | All (including devDependencies) | Production only |
| **Code mounting** | Volume mounted (live changes) | Copied into image |
| **Restart** | Nodemon auto-restart | Manual restart needed |
## Managing Services

### View Logs
```bash
# All services (production)
docker-compose logs -f

# All services (development)
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f main-service
docker-compose -f docker-compose.dev.yml logs -f cpu-service
```

### Stop All Services
```bash
# Production
docker-compose down

# Development
docker-compose -f docker-compose.dev.yml down
```

### Stop and Remove Volumes (Reset Database)
```bash
docker-compose -f docker-compose.dev.yml down -v
```

### Restart a Service
```bash
# Not needed in dev mode - nodemon auto-restarts on file changes!
# But if you need to manually restart:
docker-compose -f docker-compose.dev.yml restart cpu-service
```

### Rebuild After Package.json Changes
```bash
# In dev mode, only rebuild if you add new npm packages
docker-compose -f docker-compose.dev.yml up -d --build cpu-service

# Code changes don't require rebuild - they're automatically detected!
```ORY_SERVICE_REPLICAS=5
```
Then run: `docker-compose up -d`

## Managing Services

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f main-service
docker-compose logs -f cpu-service
```

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove Volumes (Reset Database)
```bash
docker-compose down -v
```

### Restart a Service
```bash
docker-compose restart cpu-service
```

### Rebuild After Code Changes
```bash
# Rebuild all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build cpu-service
```

## Service URLs

- **Main Service API**: http://localhost:3000
- **Test Service API**: http://localhost:3004
- **RabbitMQ Management UI**: http://localhost:15672 (admin/admin)
- **MongoDB**: mongodb://localhost:27017

## Load Balancing

CPU, Disk, and Memory services use RabbitMQ for load balancing:

1. Main service publishes tasks to RabbitMQ queues
2. Multiple service instances consume from the same queue
3. RabbitMQ distributes tasks round-robin among available workers
4. Each instance processes tasks independently

This provides:
- **Horizontal scalability**: Add more instances as needed
- **Fault tolerance**: If one instance fails, others continue processing
- **Load distribution**: Tasks are automatically balanced

## Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs [service-name]

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### Port already in use
Edit `docker-compose.yml` to change port mappings

### Out of memory
Reduce the number of replicas in `.env` file

## Production Deployment

For production:

1. **Change default passwords** in `.env`
2. **Set NODE_ENV=production**
3. **Use secrets management** (Docker Secrets, AWS Secrets Manager, etc.)
4. **Enable TLS** for RabbitMQ and MongoDB
5. **Set up monitoring** (Prometheus, Grafana)
6. **Configure logging** (ELK stack, CloudWatch)
7. **Use container orchestration** (Kubernetes, Docker Swarm)

## Docker Swarm (Production)

For production with true multi-replica support:

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml os-simulator

# Scale services
docker service scale os-simulator_cpu-service=5

# View services
docker stack services os-simulator
```

## Health Checks

Services include health checks:
- RabbitMQ: Auto-restart if unhealthy
- MongoDB: Auto-restart if unhealthy
- Services wait for dependencies before starting

## Network Architecture

All services run on a shared Docker network (`app-network`):
- Services communicate using service names (e.g., `rabbitmq`, `mongodb`)
- Isolated from host network for security
- Only necessary ports exposed to host
