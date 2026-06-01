-- CreateTable
CREATE TABLE "LoginVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoginVerificationToken_token_key" ON "LoginVerificationToken"("token");

-- CreateIndex
CREATE INDEX "LoginVerificationToken_userId_idx" ON "LoginVerificationToken"("userId");

-- AddForeignKey
ALTER TABLE "LoginVerificationToken" ADD CONSTRAINT "LoginVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
