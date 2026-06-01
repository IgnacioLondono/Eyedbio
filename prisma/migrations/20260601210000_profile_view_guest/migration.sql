-- CreateTable
CREATE TABLE "ProfileViewGuest" (
    "id" TEXT NOT NULL,
    "profileUserId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileViewGuest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileViewGuest_profileUserId_guestId_key" ON "ProfileViewGuest"("profileUserId", "guestId");

-- CreateIndex
CREATE INDEX "ProfileViewGuest_profileUserId_idx" ON "ProfileViewGuest"("profileUserId");

-- AddForeignKey
ALTER TABLE "ProfileViewGuest" ADD CONSTRAINT "ProfileViewGuest_profileUserId_fkey" FOREIGN KEY ("profileUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
