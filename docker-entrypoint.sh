#!/bin/sh
set -e

mkdir -p /data/uploads
chown -R nextjs:nodejs /data

export DATABASE_URL="$(node -e "
  const user = process.env.POSTGRES_USER || 'eyedbio';
  const pass = process.env.POSTGRES_PASSWORD || 'eyedbio_secret';
  const db = process.env.POSTGRES_DB || 'eyedbio';
  const host = process.env.POSTGRES_HOST || 'postgres';
  process.stdout.write(
    'postgresql://' +
      encodeURIComponent(user) +
      ':' +
      encodeURIComponent(pass) +
      '@' +
      host +
      ':5432/' +
      encodeURIComponent(db) +
      '?schema=public'
  );
")"

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

echo "Starting Eyed.bio..."
exec runuser -u nextjs -- "$@"
