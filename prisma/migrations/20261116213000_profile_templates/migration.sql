-- CreateTable
CREATE TABLE "ProfileTemplate" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "previewUrl" TEXT,
    "authorId" TEXT,
    "settingsJson" TEXT NOT NULL,
    "layout" TEXT NOT NULL DEFAULT 'classic',
    "category" TEXT NOT NULL DEFAULT 'general',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "official" BOOLEAN NOT NULL DEFAULT false,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "installs" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateInstall" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateInstall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileTemplate_slug_key" ON "ProfileTemplate"("slug");

-- CreateIndex
CREATE INDEX "ProfileTemplate_published_featured_createdAt_idx" ON "ProfileTemplate"("published", "featured", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProfileTemplate_authorId_idx" ON "ProfileTemplate"("authorId");

-- CreateIndex
CREATE INDEX "ProfileTemplate_category_idx" ON "ProfileTemplate"("category");

-- CreateIndex
CREATE INDEX "TemplateInstall_templateId_idx" ON "TemplateInstall"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateInstall_userId_templateId_key" ON "TemplateInstall"("userId", "templateId");

-- AddForeignKey
ALTER TABLE "ProfileTemplate" ADD CONSTRAINT "ProfileTemplate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateInstall" ADD CONSTRAINT "TemplateInstall_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateInstall" ADD CONSTRAINT "TemplateInstall_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ProfileTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
