import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { UpdateBli03Dto } from './dto/update-bli03.dto';
import { DocumentType } from '@prisma/client';
export declare class ApplicationsService {
    private prisma;
    constructor(prisma: PrismaService);
    createApplication(userId: string, dto: CreateApplicationDto): Promise<{
        session: {
            id: string;
            name: string;
            year: number;
            semester: number;
        };
        user: {
            id: string;
            name: string;
            program: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            matricNo: string;
        };
    } & {
        id: string;
        userId: string;
        sessionId: string;
        companyId: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        startDate: Date | null;
        endDate: Date | null;
        agreedBeyond14Weeks: boolean;
        createdAt: Date;
        updatedAt: Date;
        contactPersonName: string | null;
        contactPersonPhone: string | null;
        emergencyContactEmail: string | null;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        organizationAddress: string | null;
        organizationDeclarationAccepted: boolean;
        organizationEmail: string | null;
        organizationFax: string | null;
        organizationName: string | null;
        organizationPhone: string | null;
        reportingPeriod: string | null;
        roleTasksSummary: string | null;
        studentEmail: string | null;
        studentPhone: string | null;
    }>;
    getApplicationsByUser(userId: string): Promise<({
        company: {
            id: string;
            name: string;
        };
        session: {
            id: string;
            name: string;
            year: number;
            semester: number;
        };
        documents: {
            id: string;
            status: import(".prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            type: import(".prisma/client").$Enums.DocumentType;
            fileUrl: string;
        }[];
        formResponses: {
            id: string;
            formTypeEnum: string;
            payloadJSON: import("@prisma/client/runtime/library").JsonValue;
            submittedAt: Date;
        }[];
        reviews: {
            id: string;
            decision: import(".prisma/client").$Enums.Decision;
            comments: string;
            decidedAt: Date;
            reviewer: {
                id: string;
                name: string;
                email: string;
            };
        }[];
    } & {
        id: string;
        userId: string;
        sessionId: string;
        companyId: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        startDate: Date | null;
        endDate: Date | null;
        agreedBeyond14Weeks: boolean;
        createdAt: Date;
        updatedAt: Date;
        contactPersonName: string | null;
        contactPersonPhone: string | null;
        emergencyContactEmail: string | null;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        organizationAddress: string | null;
        organizationDeclarationAccepted: boolean;
        organizationEmail: string | null;
        organizationFax: string | null;
        organizationName: string | null;
        organizationPhone: string | null;
        reportingPeriod: string | null;
        roleTasksSummary: string | null;
        studentEmail: string | null;
        studentPhone: string | null;
    })[]>;
    getApplicationById(applicationId: string, userId: string): Promise<{
        company: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string | null;
            industry: string | null;
            contactName: string | null;
            contactEmail: string | null;
            contactPhone: string | null;
            fax: string | null;
        };
        session: {
            id: string;
            name: string;
            year: number;
            semester: number;
        };
        user: {
            id: string;
            name: string;
            program: string;
            email: string;
            matricNo: string;
        };
        documents: {
            id: string;
            status: import(".prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            updatedAt: Date;
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
            applicationId: string;
            formTypeEnum: string;
            payloadJSON: import("@prisma/client/runtime/library").JsonValue;
            submittedAt: Date;
            verifiedBy: string | null;
        }[];
        reviews: ({
            reviewer: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            applicationId: string;
            reviewerId: string;
            decision: import(".prisma/client").$Enums.Decision;
            comments: string | null;
            decidedAt: Date;
        })[];
    } & {
        id: string;
        userId: string;
        sessionId: string;
        companyId: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        startDate: Date | null;
        endDate: Date | null;
        agreedBeyond14Weeks: boolean;
        createdAt: Date;
        updatedAt: Date;
        contactPersonName: string | null;
        contactPersonPhone: string | null;
        emergencyContactEmail: string | null;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        organizationAddress: string | null;
        organizationDeclarationAccepted: boolean;
        organizationEmail: string | null;
        organizationFax: string | null;
        organizationName: string | null;
        organizationPhone: string | null;
        reportingPeriod: string | null;
        roleTasksSummary: string | null;
        studentEmail: string | null;
        studentPhone: string | null;
    }>;
    getActiveSessions(): Promise<{
        id: string;
        name: string;
        year: number;
        semester: number;
        minCredits: number;
        minWeeks: number;
        maxWeeks: number;
    }[]>;
    getUserProfile(userId: string): Promise<{
        assignedSession: {
            id: string;
            name: string;
            year: number;
            semester: number;
        };
        id: string;
        name: string;
        program: string;
        email: string;
        matricNo: string;
        phone: string;
        creditsEarned: number;
        studentSessions: {
            sessionId: string;
            session: {
                id: string;
                name: string;
                year: number;
                semester: number;
            };
        }[];
    }>;
    generateBLI01PDF(applicationId: string, userId: string): Promise<Buffer>;
    uploadDocument(applicationId: string, userId: string, file: Express.Multer.File, documentType: DocumentType): Promise<any>;
    getPendingDocuments(coordinatorId: string, filters: {
        sessionId?: string;
        status?: string;
        program?: string;
    }): Promise<({
        application: {
            company: {
                id: string;
                name: string;
            };
            session: {
                id: string;
                name: string;
                year: number;
                semester: number;
                coordinatorId: string;
            };
            user: {
                id: string;
                name: string;
                program: string;
                email: string;
                matricNo: string;
            };
        } & {
            id: string;
            userId: string;
            sessionId: string;
            companyId: string | null;
            status: import(".prisma/client").$Enums.ApplicationStatus;
            startDate: Date | null;
            endDate: Date | null;
            agreedBeyond14Weeks: boolean;
            createdAt: Date;
            updatedAt: Date;
            contactPersonName: string | null;
            contactPersonPhone: string | null;
            emergencyContactEmail: string | null;
            emergencyContactName: string | null;
            emergencyContactPhone: string | null;
            organizationAddress: string | null;
            organizationDeclarationAccepted: boolean;
            organizationEmail: string | null;
            organizationFax: string | null;
            organizationName: string | null;
            organizationPhone: string | null;
            reportingPeriod: string | null;
            roleTasksSummary: string | null;
            studentEmail: string | null;
            studentPhone: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
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
    })[]>;
    getDocumentById(documentId: string, coordinatorId?: string): Promise<{
        application: {
            company: {
                id: string;
                name: string;
            };
            session: {
                id: string;
                name: string;
                year: number;
                semester: number;
                coordinatorId: string;
            };
            user: {
                id: string;
                name: string;
                program: string;
                email: string;
                matricNo: string;
            };
            reviews: ({
                reviewer: {
                    id: string;
                    name: string;
                    email: string;
                };
            } & {
                id: string;
                applicationId: string;
                reviewerId: string;
                decision: import(".prisma/client").$Enums.Decision;
                comments: string | null;
                decidedAt: Date;
            })[];
        } & {
            id: string;
            userId: string;
            sessionId: string;
            companyId: string | null;
            status: import(".prisma/client").$Enums.ApplicationStatus;
            startDate: Date | null;
            endDate: Date | null;
            agreedBeyond14Weeks: boolean;
            createdAt: Date;
            updatedAt: Date;
            contactPersonName: string | null;
            contactPersonPhone: string | null;
            emergencyContactEmail: string | null;
            emergencyContactName: string | null;
            emergencyContactPhone: string | null;
            organizationAddress: string | null;
            organizationDeclarationAccepted: boolean;
            organizationEmail: string | null;
            organizationFax: string | null;
            organizationName: string | null;
            organizationPhone: string | null;
            reportingPeriod: string | null;
            roleTasksSummary: string | null;
            studentEmail: string | null;
            studentPhone: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
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
    }>;
    reviewDocument(documentId: string, reviewerId: string, reviewDto: ReviewDocumentDto): Promise<{
        reviewer: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        applicationId: string;
        reviewerId: string;
        decision: import(".prisma/client").$Enums.Decision;
        comments: string | null;
        decidedAt: Date;
    }>;
    updateBli03Data(applicationId: string, userId: string, dto: UpdateBli03Dto): Promise<{
        company: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string | null;
            industry: string | null;
            contactName: string | null;
            contactEmail: string | null;
            contactPhone: string | null;
            fax: string | null;
        };
        session: {
            id: string;
            name: string;
            year: number;
            semester: number;
        };
        user: {
            id: string;
            name: string;
            program: string;
            email: string;
            matricNo: string;
        };
    } & {
        id: string;
        userId: string;
        sessionId: string;
        companyId: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        startDate: Date | null;
        endDate: Date | null;
        agreedBeyond14Weeks: boolean;
        createdAt: Date;
        updatedAt: Date;
        contactPersonName: string | null;
        contactPersonPhone: string | null;
        emergencyContactEmail: string | null;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        organizationAddress: string | null;
        organizationDeclarationAccepted: boolean;
        organizationEmail: string | null;
        organizationFax: string | null;
        organizationName: string | null;
        organizationPhone: string | null;
        reportingPeriod: string | null;
        roleTasksSummary: string | null;
        studentEmail: string | null;
        studentPhone: string | null;
    }>;
    submitBli04(applicationId: string, userId: string, bli04Data: any): Promise<{
        formResponse: {
            id: string;
            applicationId: string;
            formTypeEnum: string;
            payloadJSON: import("@prisma/client/runtime/library").JsonValue;
            submittedAt: Date;
            verifiedBy: string | null;
        };
        document: any;
    }>;
    getBli03Submissions(coordinatorId: string, filters?: {
        sessionId?: string;
        program?: string;
    }): Promise<({
        session: {
            id: string;
            name: string;
            year: number;
            semester: number;
        };
        user: {
            id: string;
            name: string;
            program: string;
            email: string;
            matricNo: string;
        };
        formResponses: {
            id: string;
            applicationId: string;
            formTypeEnum: string;
            payloadJSON: import("@prisma/client/runtime/library").JsonValue;
            submittedAt: Date;
            verifiedBy: string | null;
        }[];
    } & {
        id: string;
        userId: string;
        sessionId: string;
        companyId: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        startDate: Date | null;
        endDate: Date | null;
        agreedBeyond14Weeks: boolean;
        createdAt: Date;
        updatedAt: Date;
        contactPersonName: string | null;
        contactPersonPhone: string | null;
        emergencyContactEmail: string | null;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        organizationAddress: string | null;
        organizationDeclarationAccepted: boolean;
        organizationEmail: string | null;
        organizationFax: string | null;
        organizationName: string | null;
        organizationPhone: string | null;
        reportingPeriod: string | null;
        roleTasksSummary: string | null;
        studentEmail: string | null;
        studentPhone: string | null;
    })[]>;
    getBli03SubmissionById(applicationId: string, coordinatorId: string): Promise<{
        session: {
            id: string;
            name: string;
            year: number;
            semester: number;
            coordinatorId: string;
        };
        user: {
            id: string;
            name: string;
            program: string;
            email: string;
            matricNo: string;
        };
        formResponses: {
            id: string;
            applicationId: string;
            formTypeEnum: string;
            payloadJSON: import("@prisma/client/runtime/library").JsonValue;
            submittedAt: Date;
            verifiedBy: string | null;
        }[];
    } & {
        id: string;
        userId: string;
        sessionId: string;
        companyId: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        startDate: Date | null;
        endDate: Date | null;
        agreedBeyond14Weeks: boolean;
        createdAt: Date;
        updatedAt: Date;
        contactPersonName: string | null;
        contactPersonPhone: string | null;
        emergencyContactEmail: string | null;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        organizationAddress: string | null;
        organizationDeclarationAccepted: boolean;
        organizationEmail: string | null;
        organizationFax: string | null;
        organizationName: string | null;
        organizationPhone: string | null;
        reportingPeriod: string | null;
        roleTasksSummary: string | null;
        studentEmail: string | null;
        studentPhone: string | null;
    }>;
    generateBLI03PDF(applicationId: string, userId: string): Promise<Buffer>;
    generateSLI03PDF(applicationId: string, userId: string): Promise<Buffer>;
    generateDLI01PDF(applicationId: string, userId: string): Promise<Buffer>;
    generateBLI04PDF(applicationId: string, userId?: string): Promise<Buffer>;
    generateSLI04PDF(applicationId: string, userId: string, sli04Data: any): Promise<Buffer>;
    getStudentDocuments(applicationId: string, userId: string): Promise<{
        application: {
            id: string;
            status: import(".prisma/client").$Enums.ApplicationStatus;
            user: {
                id: string;
                name: string;
                program: string;
                matricNo: string;
            };
            session: {
                id: string;
                name: string;
                year: number;
                semester: number;
            };
        };
        documents: {
            id: string;
            status: import(".prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            updatedAt: Date;
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
    }>;
}
