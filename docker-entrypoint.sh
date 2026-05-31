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

if [ -n "$RESEND_API_KEY" ]; then
  echo "Email: Resend configurado"
elif [ -n "$SMTP_HOST" ]; then
  echo "Email: SMTP ${SMTP_HOST}:${SMTP_PORT:-587}"
else
  echo "Email: NO configurado — los códigos solo aparecerán en los logs"
fi

exec runuser -u nextjs -- env \
  DATABASE_URL="$DATABASE_URL" \
  NODE_ENV="${NODE_ENV:-production}" \
  HOSTNAME="${HOSTNAME:-0.0.0.0}" \
  PORT="${PORT:-9090}" \
  UPLOAD_DIR="${UPLOAD_DIR:-/data/uploads}" \
  PUBLIC_MEDIA_PREFIX="${PUBLIC_MEDIA_PREFIX:-/media}" \
  AUTH_SECRET="$AUTH_SECRET" \
  NEXTAUTH_URL="$NEXTAUTH_URL" \
  NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-}" \
  AUTH_TRUST_HOST="${AUTH_TRUST_HOST:-true}" \
  RESEND_API_KEY="${RESEND_API_KEY:-}" \
  RESEND_FROM="${RESEND_FROM:-}" \
  SMTP_HOST="${SMTP_HOST:-}" \
  SMTP_PORT="${SMTP_PORT:-587}" \
  SMTP_SECURE="${SMTP_SECURE:-false}" \
  SMTP_USER="${SMTP_USER:-}" \
  SMTP_PASS="${SMTP_PASS:-}" \
  SMTP_FROM="${SMTP_FROM:-}" \
  "$@"
