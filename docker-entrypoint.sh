#!/bin/sh
set -e

mkdir -p /data/uploads

if [ -n "$DATABASE_URL" ]; then
  npx prisma migrate deploy
fi

exec "$@"
