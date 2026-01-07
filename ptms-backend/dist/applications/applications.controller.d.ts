import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { UpdateBli03Dto } from './dto/update-bli03.dto';
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
        };
    }>;
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
        };
    }>;
    submitBli04(user: any, applicationId: string, bli04Data: any): Promise<{
        formResponse: {
            id: string;
            applicationId: string;
            formTypeEnum: string;
            payloadJSON: import("@prisma/client/runtime/library").JsonValue;
            submittedAt: Date;
            verifiedBy: string | null;
        };
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
        };
    }>;
}
