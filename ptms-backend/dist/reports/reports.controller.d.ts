import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getOverviewStats(sessionId?: string, program?: string): Promise<{
        stats: {
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
        };
    }>;
    getApplicationTrends(sessionId?: string, months?: string): Promise<{
        trends: {
            submitted: number;
            approved: number;
            rejected: number;
            month: string;
        }[];
    }>;
    getStatusDistribution(sessionId?: string, program?: string): Promise<{
        distribution: {
            name: string;
            value: number;
            color: string;
        }[];
    }>;
    getProgramDistribution(sessionId?: string): Promise<{
        distribution: {
            students: number;
            approved: number;
            pending: number;
            rejected: number;
            program: string;
        }[];
    }>;
    getTopCompanies(sessionId?: string, limit?: string): Promise<{
        companies: {
            students: number;
            industry: string;
            company: string;
        }[];
    }>;
    getIndustryDistribution(sessionId?: string): Promise<{
        distribution: {
            name: string;
            value: number;
            color: string;
        }[];
    }>;
    getDocumentStats(sessionId?: string): Promise<{
        stats: any[];
    }>;
    getReviewPerformance(sessionId?: string, weeks?: string): Promise<{
        performance: {
            week: string;
            reviewed: number;
            avgTime: number;
        }[];
    }>;
}
