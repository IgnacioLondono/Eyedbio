-- Corrige perfiles cuyo fondo es video/gif pero backgroundType quedó en "image".
UPDATE "User"
SET "backgroundType" = 'video'
WHERE "backgroundUrl" IS NOT NULL
  AND "backgroundType" IS DISTINCT FROM 'video'
  AND "backgroundUrl" ~* '\.(mp4|webm|mov)(\?|$)';

UPDATE "User"
SET "backgroundType" = 'gif'
WHERE "backgroundUrl" IS NOT NULL
  AND "backgroundType" IS DISTINCT FROM 'gif'
  AND "backgroundUrl" ~* '\.gif(\?|$)';
