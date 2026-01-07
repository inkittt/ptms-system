-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "coordinatorId" UUID;

-- CreateIndex
CREATE INDEX "Session_coordinatorId_idx" ON "Session"("coordinatorId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
