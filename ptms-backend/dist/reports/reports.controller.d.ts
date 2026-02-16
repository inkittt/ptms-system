import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getOverviewStats(user: any, sessionId?: string, program?: string): Promise<{
        stats: {
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
        };
    }>;
    getApplicationTrends(user: any, sessionId?: string, months?: string): Promise<{
        trends: {
            submitted: number;
            approved: number;
            rejected: number;
            month: string;
        }[];
    }>;
    getStatusDistribution(user: any, sessionId?: string, program?: string): Promise<{
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
            address?: string;
            contactName?: string;
            contactEmail?: string;
            contactPhone?: string;
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
    getStudentProgress(sessionId?: string): Promise<{
        progress: {
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
        };
    }>;
}
