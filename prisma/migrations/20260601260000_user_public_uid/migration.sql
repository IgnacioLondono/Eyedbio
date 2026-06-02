-- Serial público permanente por usuario (EYE-000001, EYE-000002, …)

ALTER TABLE "User" ADD COLUMN "publicUid" TEXT;

WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS n
  FROM "User"
)
UPDATE "User" AS u
SET "publicUid" = 'EYE-' || LPAD(o.n::text, 6, '0')
FROM ordered AS o
WHERE u.id = o.id;

CREATE SEQUENCE IF NOT EXISTS "user_public_uid_seq" AS BIGINT;

SELECT setval(
  'user_public_uid_seq',
  COALESCE(
    (SELECT MAX(CAST(SUBSTRING("publicUid" FROM 5) AS BIGINT)) FROM "User" WHERE "publicUid" ~ '^EYE-[0-9]+$'),
    0
  ),
  true
);

ALTER TABLE "User" ALTER COLUMN "publicUid" SET NOT NULL;

CREATE UNIQUE INDEX "User_publicUid_key" ON "User"("publicUid");
