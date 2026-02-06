# Use the official Node.js 20 LTS image as base
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies in a separate stage for better caching
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
# Install all dependencies (including dev dependencies for building)
RUN npm ci
# Copy source code
COPY . .
# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 archiver

# Set working directory
WORKDIR /app

# Copy built application and production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Create data directory and set proper ownership
RUN mkdir -p /app/data && chown -R archiver:nodejs /app

# Switch to non-root user
USER archiver

# Expose the port (can be overridden via PORT env var)
EXPOSE 3000

# Health check to ensure the application is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/ || exit 1

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_PATH=/app/data

# Start the application
CMD ["node", "dist/index.js"]