# syntax=docker/dockerfile:1.9

# --- Base image with shared configuration ---
FROM node:20-bookworm-slim AS base

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable

# --- Install dependencies ---
FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci --include=dev

# --- Build the Next.js application ---
FROM base AS builder

ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# --- Production image ---
FROM base AS runner

# Ensure runtime user exists
RUN useradd --system --uid 1001 nextjs

# Copy Next.js build output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
