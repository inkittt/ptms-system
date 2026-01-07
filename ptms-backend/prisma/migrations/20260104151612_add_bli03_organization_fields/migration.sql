-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "contactPersonName" TEXT,
ADD COLUMN     "contactPersonPhone" TEXT,
ADD COLUMN     "emergencyContactEmail" TEXT,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "organizationAddress" TEXT,
ADD COLUMN     "organizationDeclarationAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "organizationEmail" TEXT,
ADD COLUMN     "organizationFax" TEXT,
ADD COLUMN     "organizationName" TEXT,
ADD COLUMN     "organizationPhone" TEXT,
ADD COLUMN     "reportingPeriod" TEXT,
ADD COLUMN     "roleTasksSummary" TEXT,
ADD COLUMN     "studentEmail" TEXT,
ADD COLUMN     "studentPhone" TEXT;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "fax" TEXT;
