# syntax=docker/dockerfile:1.7

###############################################################################
# Stage 1 — deps: install all dependencies (cached as long as package*.json is unchanged)
###############################################################################
FROM node:20-alpine AS deps

# libc6-compat compatibility layer is recommended for Next.js on Alpine
# (some native modules like sharp expect glibc-style symbols).
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund


###############################################################################
# Stage 2 — builder: compile Next.js with output: 'standalone'
###############################################################################
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


###############################################################################
# Stage 3 — runner: minimal production image
###############################################################################
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Create a non-root user (security: never run app as root)
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# .next/standalone contains a minimal server.js + the node_modules actually used.
# public/ and .next/static must be copied alongside — Next.js does not include them
# in the standalone bundle (assumes a CDN handles them in production).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
