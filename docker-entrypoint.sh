#!/bin/sh
set -e

mkdir -p /data/uploads
chown -R nextjs:nodejs /data

if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  attempt=1
  while [ "$attempt" -le 15 ]; do
    if node ./node_modules/prisma/build/index.js migrate deploy; then
      echo "Migrations completed."
      break
    fi
    if [ "$attempt" -eq 15 ]; then
      echo "Database migration failed after 15 attempts."
      exit 1
    fi
    echo "Database not ready, retrying in 3s... ($attempt/15)"
    attempt=$((attempt + 1))
    sleep 3
  done
fi

exec runuser -u nextjs -- "$@"
