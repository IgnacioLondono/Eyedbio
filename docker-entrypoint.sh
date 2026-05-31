#!/bin/sh
set -e

mkdir -p /data/uploads
chown -R nextjs:nodejs /data

if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  runuser -u nextjs -- npx prisma migrate deploy
fi

exec runuser -u nextjs -- "$@"
