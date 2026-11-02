# Multi-stage production Dockerfile for RepoMind Platform

# ==========================================
# STAGE 1: Build Frontend SPA
# ==========================================
FROM node:22-alpine AS client-builder
WORKDIR /app/client

# Copy package files and install dependencies
COPY client/package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy client source and build
COPY client/ ./
RUN npm run build

# ==========================================
# STAGE 2: Production Server Runtime
# ==========================================
FROM node:22-alpine AS production
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install curl for container healthcheck
RUN apk add --no-cache curl

# Copy root package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy server code and samples
COPY server/ ./server/

# Copy built frontend assets from STAGE 1 into client/dist
COPY --from=client-builder /app/client/dist ./client/dist

# Ensure uploads and temp directories exist
RUN mkdir -p server/uploads server/temp_uploads

# Expose server port
EXPOSE 5000

# Container Healthcheck pinging /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start RepoMind Express server (which also serves the client dist SPA)
CMD ["node", "server/server.js"]
