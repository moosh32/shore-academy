# ---------- dependencies ----------
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# prisma schema must exist before npm ci runs the postinstall hook (prisma generate)
COPY prisma ./prisma
RUN npm ci

# ---------- build ----------
FROM node:20-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    DATABASE_URL="file:./dev.db"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- production runner ----------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
# openssl is required by the Prisma engines on debian-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh \
 && mkdir -p /data
EXPOSE 43123
ENTRYPOINT ["./docker-entrypoint.sh"]
