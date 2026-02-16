import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { UpdateBli03Dto } from './dto/update-bli03.dto';
import { SubmitBli03Dto } from './dto/submit-bli03.dto';
import { ApproveBli03Dto } from './dto/approve-bli03.dto';
import { DocumentType, Decision } from '@prisma/client';
import { Readable } from 'stream';
export declare class ApplicationsService {
    private prisma;
    private storageService;
    private notificationsService;
    constructor(prisma: PrismaService, storageService: StorageService, notificationsService: NotificationsService);
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
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            matricNo: string;
            program: string;
        };
    } & {
        id: string;
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
        studentSignature: string | null;
        studentSignatureType: string | null;
        studentSignedAt: Date | null;
        supervisorSignature: string | null;
        supervisorSignatureType: string | null;
        supervisorSignedAt: Date | null;
        coordinatorSignature: string | null;
        coordinatorSignatureType: string | null;
        coordinatorSignedAt: Date | null;
        userId: string;
        sessionId: string;
        companyId: string | null;
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
            supervisorSignature: string;
            supervisorSignatureType: string;
            supervisorSignedAt: Date;
            formTypeEnum: string;
            payloadJSON: import("@prisma/client/runtime/library").JsonValue;
            submittedAt: Date;
            verifiedBy: string;
            supervisorName: string;
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
        studentSignature: string | null;
        studentSignatureType: string | null;
        studentSignedAt: Date | null;
        supervisorSignature: string | null;
        supervisorSignatureType: string | null;
        supervisorSignedAt: Date | null;
        coordinatorSignature: string | null;
        coordinatorSignatureType: string | null;
        coordinatorSignedAt: Date | null;
        userId: string;
        sessionId: string;
        companyId: string | null;
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
            email: string;
            matricNo: string;
            program: string;
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
            studentSignature: string | null;
            studentSignatureType: string | null;
            studentSignedAt: Date | null;
            supervisorSignature: string | null;
            supervisorSignatureType: string | null;
            supervisorSignedAt: Date | null;
            coordinatorSignature: string | null;
            coordinatorSignatureType: string | null;
            coordinatorSignedAt: Date | null;
            applicationId: string;
            formTypeEnum: string;
            payloadJSON: import("@prisma/client/runtime/library").JsonValue;
            submittedAt: Date;
            verifiedBy: string | null;
            supervisorName: string | null;
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
        studentSignature: string | null;
        studentSignatureType: string | null;
        studentSignedAt: Date | null;
        supervisorSignature: string | null;
        supervisorSignatureType: string | null;
        supervisorSignedAt: Date | null;
        coordinatorSignature: string | null;
        coordinatorSignatureType: string | null;
        coordinatorSignedAt: Date | null;
        userId: string;
        sessionId: string;
        companyId: string | null;
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
        email: string;
        matricNo: string;
        program: string;
        phone: string;
        creditsEarned: number;
        studentSessions: {
            session: {
                id: string;
                name: string;
                year: number;
                semester: number;
            };
            sessionId: string;
        }[];
    }>;
    generateBLI01PDF(applicationId: string, userId: string | null): Promise<Buffer>;
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
                email: string;
                matricNo: string;
                program: string;
            };
        } & {
            id: string;
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
            studentSignature: string | null;
            studentSignatureType: string | null;
            studentSignedAt: Date | null;
            supervisorSignature: string | null;
            supervisorSignatureType: string | null;
            supervisorSignedAt: Date | null;
            coordinatorSignature: string | null;
            coordinatorSignatureType: string | null;
            coordinatorSignedAt: Date | null;
            userId: string;
            sessionId: string;
            companyId: string | null;
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
                email: string;
                matricNo: string;
                program: string;
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
            studentSignature: string | null;
            studentSignatureType: string | null;
            studentSignedAt: Date | null;
            supervisorSignature: string | null;
            supervisorSignatureType: string | null;
            supervisorSignedAt: Date | null;
            coordinatorSignature: string | null;
            coordinatorSignatureType: string | null;
            coordinatorSignedAt: Date | null;
            userId: string;
            sessionId: string;
            companyId: string | null;
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
    downloadUploadedDocument(documentId: string, coordinatorId: string): Promise<Buffer>;
    downloadStudentDocument(applicationId: string, documentId: string, studentId: string): Promise<Buffer>;
    downloadAllStudentDocumentsAsZip(userId: string, coordinatorId: string): Promise<{
        stream: Readable;
        studentName: string;
        matricNo: string;
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
            email: string;
            matricNo: string;
            program: string;
        };
    } & {
        id: string;
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
        studentSignature: string | null;
        studentSignatureType: string | null;
        studentSignedAt: Date | null;
        supervisorSignature: string | null;
        supervisorSignatureType: string | null;
        supervisorSignedAt: Date | null;
        coordinatorSignature: string | null;
        coordinatorSignatureType: string | null;
        coordinatorSignedAt: Date | null;
        userId: string;
        sessionId: string;
        companyId: string | null;
    }>;
    submitBli04(applicationId: string, userId: string, bli04Data: any): Promise<{
        formResponse: any;
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
            email: string;
            matricNo: string;
            program: string;
        };
        formResponses: {
            id: string;
            studentSignature: string | null;
            studentSignatureType: string | null;
            studentSignedAt: Date | null;
            supervisorSignature: string | null;
            supervisorSignatureType: string | null;
            supervisorSignedAt: Date | null;
            coordinatorSignature: string | null;
            coordinatorSignatureType: string | null;
            coordinatorSignedAt: Date | null;
            applicationId: string;
            formTypeEnum: string;
            payloadJSON: import("@prisma/client/runtime/library").JsonValue;
            submittedAt: Date;
            verifiedBy: string | null;
            supervisorName: string | null;
        }[];
    } & {
        id: string;
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
        studentSignature: string | null;
        studentSignatureType: string | null;
        studentSignedAt: Date | null;
        supervisorSignature: string | null;
        supervisorSignatureType: string | null;
        supervisorSignedAt: Date | null;
        coordinatorSignature: string | null;
        coordinatorSignatureType: string | null;
        coordinatorSignedAt: Date | null;
        userId: string;
        sessionId: string;
        companyId: string | null;
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
            email: string;
            matricNo: string;
            program: string;
        };
        formResponses: {
            id: string;
            supervisorSignature: string;
            supervisorSignatureType: string;
            supervisorSignedAt: Date;
            formTypeEnum: string;
            payloadJSON: import("@prisma/client/runtime/library").JsonValue;
            submittedAt: Date;
            verifiedBy: string;
            supervisorName: string;
        }[];
    } & {
        id: string;
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
        studentSignature: string | null;
        studentSignatureType: string | null;
        studentSignedAt: Date | null;
        supervisorSignature: string | null;
        supervisorSignatureType: string | null;
        supervisorSignedAt: Date | null;
        coordinatorSignature: string | null;
        coordinatorSignatureType: string | null;
        coordinatorSignedAt: Date | null;
        userId: string;
        sessionId: string;
        companyId: string | null;
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
                matricNo: string;
                program: string;
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
    saveBli04Draft(applicationId: string, userId: string, bli04Data: any): Promise<any>;
    generateSupervisorLink(applicationId: string, userId: string): Promise<{
        token: string;
        expiresAt: Date;
        supervisorEmail: string;
        supervisorName: string;
    }>;
    verifySupervisorToken(token: string): Promise<{
        application: {
            session: {
                id: string;
                name: string;
                year: number;
                semester: number;
            };
            user: {
                id: string;
                name: string;
                email: string;
                matricNo: string;
                program: string;
            };
            formResponses: {
                id: string;
                studentSignature: string | null;
                studentSignatureType: string | null;
                studentSignedAt: Date | null;
                supervisorSignature: string | null;
                supervisorSignatureType: string | null;
                supervisorSignedAt: Date | null;
                coordinatorSignature: string | null;
                coordinatorSignatureType: string | null;
                coordinatorSignedAt: Date | null;
                applicationId: string;
                formTypeEnum: string;
                payloadJSON: import("@prisma/client/runtime/library").JsonValue;
                submittedAt: Date;
                verifiedBy: string | null;
                supervisorName: string | null;
            }[];
        } & {
            id: string;
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
            studentSignature: string | null;
            studentSignatureType: string | null;
            studentSignedAt: Date | null;
            supervisorSignature: string | null;
            supervisorSignatureType: string | null;
            supervisorSignedAt: Date | null;
            coordinatorSignature: string | null;
            coordinatorSignatureType: string | null;
            coordinatorSignedAt: Date | null;
            userId: string;
            sessionId: string;
            companyId: string | null;
        };
        bli04Data: import("@prisma/client/runtime/library").JsonValue;
        supervisorName: string;
        supervisorEmail: string;
        tokenId: string;
    }>;
    submitSupervisorSignature(token: string, signatureData: any): Promise<{
        success: boolean;
        formResponse: {
            id: string;
            studentSignature: string | null;
            studentSignatureType: string | null;
            studentSignedAt: Date | null;
            supervisorSignature: string | null;
            supervisorSignatureType: string | null;
            supervisorSignedAt: Date | null;
            coordinatorSignature: string | null;
            coordinatorSignatureType: string | null;
            coordinatorSignedAt: Date | null;
            applicationId: string;
            formTypeEnum: string;
            payloadJSON: import("@prisma/client/runtime/library").JsonValue;
            submittedAt: Date;
            verifiedBy: string | null;
            supervisorName: string | null;
        };
    }>;
    getBli04Submissions(coordinatorId: string, filters?: {
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
            email: string;
            matricNo: string;
            program: string;
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
            studentSignature: string | null;
            studentSignatureType: string | null;
            studentSignedAt: Date | null;
            supervisorSignature: string | null;
            supervisorSignatureType: string | null;
            supervisorSignedAt: Date | null;
            coordinatorSignature: string | null;
            coordinatorSignatureType: string | null;
            coordinatorSignedAt: Date | null;
            applicationId: string;
            formTypeEnum: string;
            payloadJSON: import("@prisma/client/runtime/library").JsonValue;
            submittedAt: Date;
            verifiedBy: string | null;
            supervisorName: string | null;
        }[];
    } & {
        id: string;
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
        studentSignature: string | null;
        studentSignatureType: string | null;
        studentSignedAt: Date | null;
        supervisorSignature: string | null;
        supervisorSignatureType: string | null;
        supervisorSignedAt: Date | null;
        coordinatorSignature: string | null;
        coordinatorSignatureType: string | null;
        coordinatorSignedAt: Date | null;
        userId: string;
        sessionId: string;
        companyId: string | null;
    })[]>;
    verifyBli04Submission(applicationId: string, coordinatorId: string, decision: Decision, comments?: string): Promise<{
        id: string;
        applicationId: string;
        reviewerId: string;
        decision: import(".prisma/client").$Enums.Decision;
        comments: string | null;
        decidedAt: Date;
    }>;
    submitBli03WithSignature(applicationId: string, userId: string, dto: SubmitBli03Dto): Promise<{
        message: string;
    }>;
    approveBli03Submission(applicationId: string, coordinatorId: string, dto: ApproveBli03Dto): Promise<{
        message: string;
    }>;
    unlockDocumentsAfterApproval(applicationId: string, approvedDocumentType: DocumentType): Promise<void>;
    getDocumentUnlockStatus(applicationId: string, userId?: string): Promise<{
        unlockStatus: {
            bli01: boolean;
            bli02: boolean;
            bli03: boolean;
            sli03: boolean;
            dli01: boolean;
            bli04: boolean;
        };
        applicationStatus: import(".prisma/client").$Enums.ApplicationStatus;
        bli03Approved: boolean;
        bli04Verified: boolean;
    }>;
    uploadStudentSignature(applicationId: string, userId: string, file: Express.Multer.File): Promise<{
        signatureUploaded: boolean;
        signedAt: Date;
    }>;
    uploadSupervisorSignature(applicationId: string, file: Express.Multer.File, token?: string): Promise<{
        signatureUploaded: boolean;
        signedAt: Date;
    }>;
}
