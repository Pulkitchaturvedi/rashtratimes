-- Initial migration for newsroom schema
CREATE TYPE "Role" AS ENUM ('REPORTER', 'EDITOR', 'PUBLISHER', 'ADMIN');
CREATE TYPE "Status" AS ENUM ('DRAFT', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "SubmissionStatus" AS ENUM ('NEW', 'TRIAGED', 'PROMOTED', 'REJECTED');

CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "passwordHash" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Article" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "body" JSONB NOT NULL,
  "excerpt" TEXT,
  "status" "Status" NOT NULL DEFAULT 'DRAFT',
  "section" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "lang" TEXT NOT NULL DEFAULT 'en',
  "location" TEXT,
  "heroImageId" TEXT,
  "heroImageUrl" TEXT,
  "authorId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "editorId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "publisherId" UUID,
  "scheduledAt" TIMESTAMPTZ,
  "publishedAt" TIMESTAMPTZ,
  "submissionId" UUID UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Revision" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "articleId" UUID NOT NULL REFERENCES "Article"("id") ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "note" TEXT,
  "from" "Status" NOT NULL,
  "to" "Status" NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "CitizenSubmission" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "location" TEXT,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "media" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "status" "SubmissionStatus" NOT NULL DEFAULT 'NEW',
  "articleId" UUID UNIQUE REFERENCES "Article"("id") ON DELETE SET NULL,
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "Article"
  ADD CONSTRAINT "Article_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "CitizenSubmission"("id") ON DELETE SET NULL;

CREATE TABLE "Media" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL UNIQUE,
  "url" TEXT NOT NULL,
  "mime" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "HomepageSlot" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slot" INTEGER NOT NULL UNIQUE,
  "articleId" UUID REFERENCES "Article"("id") ON DELETE SET NULL,
  "override" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "Article_status_idx" ON "Article"("status");
CREATE INDEX "Article_section_idx" ON "Article"("section");
CREATE INDEX "Article_author_idx" ON "Article"("authorId");
CREATE INDEX "CitizenSubmission_status_idx" ON "CitizenSubmission"("status");
