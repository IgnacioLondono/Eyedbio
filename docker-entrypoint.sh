#!/bin/sh
set -e

mkdir -p /data/uploads
chown -R nextjs:nodejs /data

if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  attempt=1
  max_attempts=20

  while [ "$attempt" -le "$max_attempts" ]; do
    if node ./node_modules/prisma/build/index.js migrate deploy; then
      echo "Migrations completed."
      break
    fi

    if [ "$attempt" -eq "$max_attempts" ]; then
      echo "Database migration failed after ${max_attempts} attempts."
      exit 1
    fi

    echo "Database not ready, retrying in 3s... (${attempt}/${max_attempts})"
    attempt=$((attempt + 1))
    sleep 3
  done
fi

echo "Starting Eyed.bio..."
exec runuser -u nextjs -- "$@"
