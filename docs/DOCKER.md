# Docker Setup Guide for Jura

This guide provides detailed information about running Jura using Docker.

## Architecture

The application consists of two main services:

1. **Backend Service** (Node.js/Express)
   - Main API Server: Port 3000 (server.cjs)
   - LexiBot Server: Port 5000 (LexiBotServer.cjs)
   - Uses Google Gemini API for AI processing

2. **Frontend Service** (React/Vite)
   - Development Server: Port 5173
   - Production: Served via static file server

## Files Overview

- `Dockerfile` (frontend/backend): Multi-stage builds for dev and prod
- `docker-compose.yml`: Development configuration with hot-reload
- `docker-compose.prod.yml`: Production configuration
- `.dockerignore`: Excludes unnecessary files from Docker context
- `.env.example`: Template for environment variables

## Development vs Production

### Development Mode
- Uses `target: development` in Dockerfiles
- Mounts source code as volumes for hot-reload
- Runs `nodemon` for backend (auto-restart on changes)
- Runs `vite dev` for frontend (HMR - Hot Module Replacement)
- Includes dev dependencies

### Production Mode
- Uses `target: production` in Dockerfiles
- No volume mounts (code is baked into the image)
- Optimized builds with minimal dependencies
- Runs production servers
- Smaller image sizes

## Quick Start

### Development
```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env and add your API keys
# GEMINI_API_KEY=your_key_here
# GEMINI_API_KEY_1=your_key_here

# 3. Start all services
docker-compose up

# Or run in background
docker-compose up -d

# 4. View logs
docker-compose logs -f

# 5. Stop services
docker-compose down
```

### Production
```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

## Environment Variables

Required variables in `.env`:
```bash
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEY_1=your_gemini_api_key_1
```

Optional variables:
```bash
NODE_ENV=development
VITE_API_URL=http://localhost:3000
VITE_LEXI_API_URL=http://localhost:5000
```

## Network Architecture

All services are connected via the `jura-net` bridge network, allowing:
- Frontend to communicate with backend using service names
- Isolated network for security
- Easy service discovery

## Volume Mounts (Development)

Development mode mounts source code:
```yaml
volumes:
  - ./backend:/app        # Backend source
  - /app/node_modules     # Exclude node_modules
  - ./frontend:/app       # Frontend source
  - /app/node_modules     # Exclude node_modules
```

This enables hot-reload without rebuilding images.

## Common Commands

### Building
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Rebuild without cache
docker-compose build --no-cache
```

### Running
```bash
# Start all services
docker-compose up

# Start specific service
docker-compose up backend
docker-compose up frontend

# Start in detached mode
docker-compose up -d

# Start and rebuild
docker-compose up --build
```

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last N lines
docker-compose logs --tail=100 backend
```

### Executing Commands
```bash
# Open shell in container
docker-compose exec backend sh
docker-compose exec frontend sh

# Run specific command
docker-compose exec backend npm install
docker-compose exec frontend npm run build
```

### Cleanup
```bash
# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Remove images
docker rmi jura-backend jura-frontend

# Full cleanup (careful!)
docker-compose down -v --rmi all
```

## Troubleshooting

### Port Conflicts
If ports 3000, 5000, or 5173 are already in use:

**Option 1: Kill existing process**
```bash
# Linux/macOS
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Option 2: Change ports in docker-compose.yml**
```yaml
ports:
  - "3001:3000"  # Change host port (left side)
```

### Container Fails to Start

Check logs:
```bash
docker-compose logs backend
docker-compose logs frontend
```

Common issues:
- Missing environment variables
- Invalid API keys
- Port conflicts
- Insufficient memory

### Hot-Reload Not Working

1. Ensure using development compose file:
   ```bash
   docker-compose up  # Not prod
   ```

2. On Windows, enable file sharing in Docker Desktop

3. Try restarting:
   ```bash
   docker-compose restart
   ```

4. Rebuild without cache:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

### Build Failures

1. Check network connection (npm install needs internet)

2. Clear Docker cache:
   ```bash
   docker system prune -a
   ```

3. Check Dockerfile syntax

4. Verify .dockerignore isn't excluding needed files

### API Connection Issues

1. Verify all services are running:
   ```bash
   docker-compose ps
   ```

2. Check network connectivity:
   ```bash
   docker-compose exec frontend ping backend
   ```

3. Verify environment variables:
   ```bash
   docker-compose exec backend env | grep GEMINI
   docker-compose exec frontend env | grep VITE
   ```

4. Check backend logs for API errors:
   ```bash
   docker-compose logs backend | grep -i error
   ```

## Performance Optimization

### Development
- Volume mounts can be slower on Windows/macOS
- Use Docker Desktop's file sharing settings
- Consider running directly on host for better performance

### Production
- Images are optimized with multi-stage builds
- Only production dependencies included
- Smaller attack surface
- Faster startup times

## Security Considerations

1. **Never commit .env files** - Contains sensitive API keys
2. **Use .dockerignore** - Prevents sensitive files in images
3. **Run as non-root** (future improvement)
4. **Use specific image versions** - We use `node:20-alpine`
5. **Scan images for vulnerabilities**:
   ```bash
   docker scan jura-backend
   docker scan jura-frontend
   ```

## CI/CD Integration

Example GitHub Actions workflow:
```yaml
name: Docker Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build images
        run: docker-compose build
      - name: Run tests
        run: docker-compose up -d && docker-compose exec backend npm test
```

## Deployment

### Docker Hub
```bash
# Tag images
docker tag jura-backend username/jura-backend:v1.0
docker tag jura-frontend username/jura-frontend:v1.0

# Push to registry
docker push username/jura-backend:v1.0
docker push username/jura-frontend:v1.0
```

### Production Deployment
- Use docker-compose.prod.yml
- Set production environment variables
- Use reverse proxy (nginx) for SSL/TLS
- Implement health checks
- Set up logging and monitoring
- Use secrets management (Docker Secrets, Kubernetes Secrets)

## Health Checks

Add to docker-compose.yml for production:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Scaling

To run multiple instances:
```bash
docker-compose up --scale backend=3
```

Note: Requires load balancer configuration.

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Vite Docker Guide](https://vitejs.dev/guide/static-deploy.html)
