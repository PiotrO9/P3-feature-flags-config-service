/*
  Warnings:

  - You are about to drop the `Flag` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."FeatureFlagType" AS ENUM ('BOOLEAN', 'PERCENTAGE', 'CONFIG');

-- CreateEnum
CREATE TYPE "public"."Operator" AS ENUM ('EQUALS', 'IN', 'NOT_IN', 'GREATER_THAN', 'LESS_THAN');

-- DropTable
DROP TABLE "public"."Flag";

-- CreateTable
CREATE TABLE "public"."FeatureFlag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."FeatureFlagType" NOT NULL,
    "isEnabled" BOOLEAN,
    "rolloutPercentage" INTEGER,
    "configJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TargetingRule" (
    "id" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "attribute" TEXT NOT NULL,
    "operator" "public"."Operator" NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "TargetingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FlagEvaluationLog" (
    "id" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "userId" TEXT,
    "requestId" TEXT,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlagEvaluationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FlagChangeHistory" (
    "id" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "oldValue" JSONB NOT NULL,
    "newValue" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlagChangeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_key" ON "public"."FeatureFlag"("key");

-- AddForeignKey
ALTER TABLE "public"."TargetingRule" ADD CONSTRAINT "TargetingRule_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "public"."FeatureFlag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlagEvaluationLog" ADD CONSTRAINT "FlagEvaluationLog_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "public"."FeatureFlag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FlagChangeHistory" ADD CONSTRAINT "FlagChangeHistory_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "public"."FeatureFlag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
