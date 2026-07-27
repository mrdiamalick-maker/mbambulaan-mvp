# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run typecheck && npm test && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN apk add --no-cache postgresql-client && addgroup --system --gid 1001 mbambulaan && adduser --system --uid 1001 --ingroup mbambulaan mbambulaan
COPY --from=builder --chown=mbambulaan:mbambulaan /app/public ./public
COPY --from=builder --chown=mbambulaan:mbambulaan /app/.next/standalone ./
COPY --from=builder --chown=mbambulaan:mbambulaan /app/.next/static ./.next/static
COPY --from=builder --chown=mbambulaan:mbambulaan /app/infra/postgres/migrations ./infra/postgres/migrations
USER 1001:1001
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/health/live || exit 1
CMD ["node", "server.js"]
