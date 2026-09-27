#!/bin/sh
# Railway / Docker entrypoint for shore-academy.
# - Defaults DATABASE_URL to the persistent volume path (/data).
# - Applies Prisma migrations, then starts Next.js.
set -eu

# Persistent SQLite location. The Railway volume is mounted at /data
# (see railway.json). Override with DATABASE_URL=file:/path/to/db if needed.
export DATABASE_URL="${DATABASE_URL:-file:/data/dev.db}"

DB_DIR=$(dirname "${DATABASE_URL#file:}")
mkdir -p "${DB_DIR}"

echo "-> prisma migrate deploy (DATABASE_URL=${DATABASE_URL})"
npx prisma migrate deploy

PORT="${PORT:-43123}"
echo "-> starting next on 0.0.0.0:${PORT}"
exec npx next start --hostname 0.0.0.0 --port "${PORT}"
