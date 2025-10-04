# Dockerfile for Node.js/Express backend
# Multi-stage build for development and production

# Development stage
FROM node:20-alpine AS development
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for nodemon)
RUN npm install

# Copy application code
COPY . .

# Expose ports for both servers (server.cjs on 3000, LexiBotServer.cjs on 5000)
EXPOSE 3000 5000

# Default command for development with hot-reload
CMD ["npm", "run", "dev:both"]

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose ports
EXPOSE 3000 5000

# Default command for production
CMD ["npm", "start"]
