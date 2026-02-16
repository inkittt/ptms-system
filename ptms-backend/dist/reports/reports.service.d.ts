import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getOverviewStats(coordinatorId: string, sessionId?: string, program?: string): Promise<{
        totalStudents: number;
        eligibleStudents: number;
        totalApplications: number;
        approvedApplications: number;
        approved: number;
        pendingReview: number;
        changesRequested: number;
        rejectedApplications: number;
        overdue: number;
        sli03Issued: number;
        ongoingInternships: number;
        completedInternships: number;
        avgReviewTime: number;
        avgApprovalRate: number;
    }>;
    getApplicationTrends(coordinatorId: string, sessionId?: string, months?: number): Promise<{
        submitted: number;
        approved: number;
        rejected: number;
        month: string;
    }[]>;
    getStatusDistribution(coordinatorId: string, sessionId?: string, program?: string): Promise<{
        name: string;
        value: number;
        color: string;
    }[]>;
    getProgramDistribution(sessionId?: string): Promise<{
        students: number;
        approved: number;
        pending: number;
        rejected: number;
        program: string;
    }[]>;
    getTopCompanies(sessionId?: string, limit?: number): Promise<{
        students: number;
        industry: string;
        address?: string;
        contactName?: string;
        contactEmail?: string;
        contactPhone?: string;
        company: string;
    }[]>;
    getIndustryDistribution(sessionId?: string): Promise<{
        name: string;
        value: number;
        color: string;
    }[]>;
    getDocumentStats(sessionId?: string): Promise<any[]>;
    getReviewPerformance(sessionId?: string, weeks?: number): Promise<{
        week: string;
        reviewed: number;
        avgTime: number;
    }[]>;
    getStudentProgress(sessionId?: string): Promise<{
        students: {
            id: string;
            name: string;
            matricNo: string;
            program: string;
            status: string;
            progress: number;
            completedSteps: number;
            totalSteps: number;
            applicationStatus: import(".prisma/client").$Enums.ApplicationStatus;
            documents: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.DocumentStatus;
                applicationId: string;
                type: import(".prisma/client").$Enums.DocumentType;
                fileUrl: string;
                version: number;
                signedBy: string | null;
                signedAt: Date | null;
                storageType: string;
                driveFileId: string | null;
                driveWebViewLink: string | null;
                driveWebContentLink: string | null;
            }[];
            formResponses: {
                id: string;
                coordinatorSignature: string | null;
                coordinatorSignatureType: string | null;
                coordinatorSignedAt: Date | null;
                studentSignature: string | null;
                studentSignatureType: string | null;
                studentSignedAt: Date | null;
                supervisorSignature: string | null;
                supervisorSignatureType: string | null;
                supervisorSignedAt: Date | null;
                applicationId: string;
                formTypeEnum: string;
                payloadJSON: import("@prisma/client/runtime/library").JsonValue;
                submittedAt: Date;
                verifiedBy: string | null;
                supervisorName: string | null;
            }[];
        }[];
        summary: {
            notStarted: number;
            submitted: number;
            ongoing: number;
            completed: number;
            total: number;
        };
    }>;
}
