# Multi-stage build for Next.js application - optimized for production

# Stage 1: Dependencies - Alpine is sufficient for pure JS dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Copy package files and install ALL dependencies (dev + prod for building)
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder - Use Alpine for faster, smaller build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Stage 3: Runner - Use Alpine for smallest production image (~5MB base vs ~100MB slim)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run the application
CMD ["node", "server.js"]