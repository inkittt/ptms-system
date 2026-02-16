import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { UpdateBli03Dto } from './dto/update-bli03.dto';
import { SubmitBli03Dto } from './dto/submit-bli03.dto';
import { ApproveBli03Dto } from './dto/approve-bli03.dto';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    createApplication(user: any, createApplicationDto: CreateApplicationDto): Promise<{
        message: string;
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
        };
    }>;
    getMyApplications(user: any): Promise<{
        applications: ({
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
        })[];
    }>;
    getActiveSessions(): Promise<{
        sessions: {
            id: string;
            name: string;
            year: number;
            semester: number;
            minCredits: number;
            minWeeks: number;
            maxWeeks: number;
        }[];
    }>;
    getProfile(user: any): Promise<{
        profile: {
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
        };
    }>;
    getApplicationById(user: any, id: string): Promise<{
        application: {
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
        };
    }>;
    generateBLI01PDF(user: any, id: string, res: Response): Promise<StreamableFile>;
    generateBLI03PDF(user: any, id: string, res: Response): Promise<StreamableFile>;
    generateSLI03PDF(user: any, id: string, res: Response): Promise<StreamableFile>;
    generateDLI01PDF(user: any, id: string, res: Response): Promise<StreamableFile>;
    generateBLI04PDF(user: any, id: string, res: Response): Promise<StreamableFile>;
    uploadDocument(user: any, applicationId: string, file: Express.Multer.File, uploadDocumentDto: UploadDocumentDto): Promise<{
        message: string;
        document: any;
    }>;
    getPendingDocuments(user: any, sessionId?: string, status?: string, program?: string): Promise<{
        documents: ({
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
        })[];
    }>;
    getDocument(user: any, documentId: string): Promise<{
        document: {
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
        };
    }>;
    downloadUploadedDocument(user: any, documentId: string, res: Response): Promise<StreamableFile>;
    downloadAllStudentDocuments(user: any, userId: string, res: Response): Promise<void>;
    reviewDocument(user: any, documentId: string, reviewDto: ReviewDocumentDto): Promise<{
        message: string;
        review: {
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
        };
    }>;
    updateBli03Data(user: any, applicationId: string, updateBli03Dto: UpdateBli03Dto): Promise<{
        message: string;
        application: {
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
        };
    }>;
    getBli03Submissions(user: any, sessionId?: string, program?: string): Promise<{
        submissions: ({
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
        })[];
    }>;
    getBli03SubmissionById(user: any, applicationId: string): Promise<{
        submission: {
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
        };
    }>;
    submitBli04(user: any, applicationId: string, bli04Data: any): Promise<{
        formResponse: any;
        document: any;
        message: string;
    }>;
    generateSLI04PDF(user: any, id: string, sli04Data: any, res: Response): Promise<StreamableFile>;
    getStudentDocuments(user: any, applicationId: string): Promise<{
        documents: {
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
        };
    }>;
    downloadStudentDocument(user: any, applicationId: string, documentId: string, res: Response): Promise<StreamableFile>;
    saveBli04Draft(user: any, applicationId: string, bli04Data: any): Promise<{
        message: string;
        formResponse: any;
    }>;
    generateSupervisorLink(user: any, applicationId: string): Promise<{
        token: string;
        expiresAt: Date;
        supervisorEmail: string;
        supervisorName: string;
        message: string;
    }>;
    getBli04Submissions(user: any, sessionId?: string, program?: string): Promise<{
        submissions: ({
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
        })[];
    }>;
    verifyBli04Submission(user: any, applicationId: string, verifyDto: {
        decision: string;
        comments?: string;
    }): Promise<{
        message: string;
        review: {
            id: string;
            applicationId: string;
            reviewerId: string;
            decision: import(".prisma/client").$Enums.Decision;
            comments: string | null;
            decidedAt: Date;
        };
    }>;
    submitBli03WithSignature(user: any, applicationId: string, submitBli03Dto: SubmitBli03Dto): Promise<{
        message: string;
    }>;
    approveBli03Submission(user: any, applicationId: string, approveBli03Dto: ApproveBli03Dto): Promise<{
        message: string;
    }>;
    getDocumentUnlockStatus(user: any, applicationId: string): Promise<{
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
    uploadStudentSignature(user: any, applicationId: string, file: Express.Multer.File): Promise<{
        signatureUploaded: boolean;
        signedAt: Date;
        message: string;
    }>;
    uploadSupervisorSignature(applicationId: string, file: Express.Multer.File, token?: string): Promise<{
        signatureUploaded: boolean;
        signedAt: Date;
        message: string;
    }>;
}
