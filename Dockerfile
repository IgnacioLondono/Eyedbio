# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts

FROM deps AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

COPY . .

ENV DATABASE_URL="postgresql://eyedbio:eyedbio_secret@localhost:5432/eyedbio?schema=public"
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV UPLOAD_DIR="/data/uploads"
ENV PUBLIC_MEDIA_PREFIX="/media"
ENV AUTH_TRUST_HOST="true"
ENV HOSTNAME="0.0.0.0"
ENV PORT=9090

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/src/generated ./src/generated
COPY docker-entrypoint.sh ./docker-entrypoint.sh
COPY healthcheck.js ./healthcheck.js

RUN mkdir -p /data/uploads \
    && chmod +x docker-entrypoint.sh \
    && chown -R nextjs:nodejs /app /data

EXPOSE 9090

VOLUME ["/data"]

HEALTHCHECK --interval=15s --timeout=10s --start-period=120s --retries=8 \
  CMD ["node", "healthcheck.js"]

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
