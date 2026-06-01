-- CreateTable
CREATE TABLE "ProfileReview" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "profileUserId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileReview_reviewerId_profileUserId_key" ON "ProfileReview"("reviewerId", "profileUserId");

-- CreateIndex
CREATE INDEX "ProfileReview_profileUserId_createdAt_idx" ON "ProfileReview"("profileUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProfileReview_createdAt_idx" ON "ProfileReview"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "ProfileReview" ADD CONSTRAINT "ProfileReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileReview" ADD CONSTRAINT "ProfileReview_profileUserId_fkey" FOREIGN KEY ("profileUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
