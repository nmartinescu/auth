# Quick Docker Commands Reference

## Development (Hot Reload)

### Start all services with live code reloading:
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

### Watch logs while developing:
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Stop development services:
```bash
docker-compose -f docker-compose.dev.yml down
```

## Production

### Start all services (optimized):
```bash
docker-compose up -d --build
```

### Stop production services:
```bash
docker-compose down
```

## Common Tasks

### View running containers:
```bash
docker-compose -f docker-compose.dev.yml ps
```

### Rebuild after adding npm packages:
```bash
docker-compose -f docker-compose.dev.yml up -d --build <service-name>
```

### Scale a service:
```bash
docker-compose -f docker-compose.dev.yml up -d --scale cpu-service=3
```

### Reset everything (including database):
```bash
docker-compose -f docker-compose.dev.yml down -v
```

## How It Works

### Development Mode:
- ✅ Code changes → Auto-reload (nodemon)
- ✅ No rebuild needed for code changes
- ✅ Volumes mount your local files
- ⚠️ Rebuild only when package.json changes

### Production Mode:
- ✅ Optimized build size
- ✅ Production dependencies only
- ⚠️ Rebuild required for any changes
