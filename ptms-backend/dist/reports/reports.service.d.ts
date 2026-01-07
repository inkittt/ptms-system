import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getOverviewStats(sessionId?: string, program?: string): Promise<{
        totalStudents: number;
        eligibleStudents: number;
        totalApplications: number;
        approvedApplications: number;
        pendingReview: number;
        changesRequested: number;
        rejectedApplications: number;
        sli03Issued: number;
        ongoingInternships: number;
        completedInternships: number;
        avgReviewTime: number;
        avgApprovalRate: number;
    }>;
    getApplicationTrends(sessionId?: string, months?: number): Promise<{
        submitted: number;
        approved: number;
        rejected: number;
        month: string;
    }[]>;
    getStatusDistribution(sessionId?: string, program?: string): Promise<{
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
}
