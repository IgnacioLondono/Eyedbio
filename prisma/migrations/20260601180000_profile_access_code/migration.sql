-- AlterTable
ALTER TABLE "User" ADD COLUMN "accessCodeEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "accessCodeHash" TEXT;
