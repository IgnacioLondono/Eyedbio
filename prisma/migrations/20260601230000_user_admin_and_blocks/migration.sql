-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';
ALTER TABLE "User" ADD COLUMN "blockedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "blockedReason" TEXT;

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_blockedAt_idx" ON "User"("blockedAt");
