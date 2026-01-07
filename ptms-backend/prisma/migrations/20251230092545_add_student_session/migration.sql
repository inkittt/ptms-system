-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "minCredits" SET DEFAULT 113;

-- CreateTable
CREATE TABLE "StudentSession" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "creditsEarned" INTEGER NOT NULL,
    "isEligible" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentSession_sessionId_idx" ON "StudentSession"("sessionId");

-- CreateIndex
CREATE INDEX "StudentSession_userId_idx" ON "StudentSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSession_sessionId_userId_key" ON "StudentSession"("sessionId", "userId");

-- AddForeignKey
ALTER TABLE "StudentSession" ADD CONSTRAINT "StudentSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSession" ADD CONSTRAINT "StudentSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
