#!/bin/sh
set -e

mkdir -p /data/uploads
chown -R nextjs:nodejs /data

if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  attempt=1
  while [ "$attempt" -le 10 ]; do
    if runuser -u nextjs -- npx prisma migrate deploy; then
      break
    fi
    if [ "$attempt" -eq 10 ]; then
      echo "Database migration failed after 10 attempts."
      exit 1
    fi
    echo "Database not ready, retrying in 3s... ($attempt/10)"
    attempt=$((attempt + 1))
    sleep 3
  done
fi

exec runuser -u nextjs -- "$@"
