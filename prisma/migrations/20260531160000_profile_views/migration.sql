-- AlterTable
-- Add profile view tracking to count one view per viewer per profile.

CREATE TABLE "ProfileView" (
  "id" TEXT NOT NULL,
  "viewerId" TEXT NOT NULL,
  "profileUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProfileView_pkey" PRIMARY KEY ("id")
);

-- Relations
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_viewerId_fkey"
  FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_profileUserId_fkey"
  FOREIGN KEY ("profileUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Uniqueness: only one view per (viewer, profile)
CREATE UNIQUE INDEX "ProfileView_viewerId_profileUserId_key"
  ON "ProfileView" ("viewerId", "profileUserId");

-- Index for queries by profile
CREATE INDEX "ProfileView_profileUserId_idx"
  ON "ProfileView" ("profileUserId");

