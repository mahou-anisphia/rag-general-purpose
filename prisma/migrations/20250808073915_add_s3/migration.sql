-- CreateEnum
CREATE TYPE "public"."DocumentStatus" AS ENUM ('PENDING', 'PROCESSING', 'INDEXED', 'ERROR');

-- CreateEnum
CREATE TYPE "public"."DocumentSource" AS ENUM ('MANUAL_UPLOAD', 'EMAIL_INGEST', 'API_UPLOAD');

-- CreateTable
CREATE TABLE "public"."Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "public"."DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "source" "public"."DocumentSource" NOT NULL DEFAULT 'MANUAL_UPLOAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uploadedById" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_fileKey_key" ON "public"."Document"("fileKey");

-- CreateIndex
CREATE INDEX "Document_uploadedById_idx" ON "public"."Document"("uploadedById");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "public"."Document"("status");

-- CreateIndex
CREATE INDEX "Document_createdAt_idx" ON "public"."Document"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
