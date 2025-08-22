##### DEPENDENCIES

FROM --platform=linux/amd64 node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install Prisma Client - remove if not using Prisma
COPY prisma ./

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

##### BUILDER

FROM --platform=linux/amd64 node:20-alpine AS builder
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLIENTVAR
# Provide safe dummy values for runtime-only envs to avoid build-time failures
ARG OPENAI_API_KEY=dummy
ARG ANTHROPIC_API_KEY=dummy
ARG AUTH_DISCORD_ID=dummy
ARG AUTH_DISCORD_SECRET=dummy
ARG AUTH_SECRET=dummy
ARG QDRANT_URL=http://localhost:6333
ARG MINIO_ENDPOINT=http://localhost:9000
ENV OPENAI_API_KEY=$OPENAI_API_KEY \
    ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
    AUTH_DISCORD_ID=$AUTH_DISCORD_ID \
    AUTH_DISCORD_SECRET=$AUTH_DISCORD_SECRET \
    AUTH_SECRET=$AUTH_SECRET \
    QDRANT_URL=$QDRANT_URL \
    MINIO_ENDPOINT=$MINIO_ENDPOINT
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  if [ -f yarn.lock ]; then SKIP_ENV_VALIDATION=1 yarn build; \
  elif [ -f package-lock.json ]; then SKIP_ENV_VALIDATION=1 npm run build; \
  elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && SKIP_ENV_VALIDATION=1 pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

##### RUNNER

FROM --platform=linux/amd64 node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
