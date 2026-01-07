"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bli01_generator_1 = require("./utils/bli01-generator");
const bli03_generator_1 = require("./utils/bli03-generator");
const bli04_generator_1 = require("./utils/bli04-generator");
const sli03_generator_1 = require("./utils/sli03-generator");
const sli04_generator_1 = require("./utils/sli04-generator");
const dli01_generator_1 = require("./utils/dli01-generator");
let ApplicationsService = class ApplicationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createApplication(userId, dto) {
        const session = await this.prisma.session.findUnique({
            where: { id: dto.trainingSession },
        });
        if (!session) {
            throw new common_1.NotFoundException('Training session not found');
        }
        if (!session.isActive) {
            throw new common_1.BadRequestException('Training session is not active');
        }
        const existingApplication = await this.prisma.application.findFirst({
            where: {
                userId: userId,
                sessionId: dto.trainingSession,
                status: {
                    notIn: [client_1.ApplicationStatus.CANCELLED, client_1.ApplicationStatus.REJECTED],
                },
            },
            include: {
                formResponses: true,
                documents: true,
                reviews: true,
            },
        });
        if (existingApplication) {
            await this.prisma.formResponse.deleteMany({
                where: { applicationId: existingApplication.id },
            });
            await this.prisma.document.deleteMany({
                where: { applicationId: existingApplication.id },
            });
            await this.prisma.review.deleteMany({
                where: { applicationId: existingApplication.id },
            });
            await this.prisma.application.delete({
                where: { id: existingApplication.id },
            });
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                name: dto.studentName,
                matricNo: dto.matricNo,
                program: dto.program,
                faculty: dto.faculty,
                cgpa: parseFloat(dto.cgpa),
                phone: dto.icNo,
            },
        });
        const application = await this.prisma.application.create({
            data: {
                userId: userId,
                sessionId: dto.trainingSession,
                status: client_1.ApplicationStatus.DRAFT,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        matricNo: true,
                        program: true,
                        role: true,
                    },
                },
                session: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                        semester: true,
                    },
                },
            },
        });
        await this.prisma.formResponse.create({
            data: {
                applicationId: application.id,
                formTypeEnum: 'BLI_01',
                payloadJSON: {
                    studentName: dto.studentName,
                    icNo: dto.icNo,
                    matricNo: dto.matricNo,
                    cgpa: dto.cgpa,
                    program: dto.program,
                    faculty: dto.faculty,
                    submittedAt: new Date().toISOString(),
                },
            },
        });
        return application;
    }
    async getApplicationsByUser(userId) {
        const applications = await this.prisma.application.findMany({
            where: { userId },
            include: {
                session: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                        semester: true,
                    },
                },
                company: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                documents: {
                    select: {
                        id: true,
                        type: true,
                        fileUrl: true,
                        status: true,
                        createdAt: true,
                    },
                },
                formResponses: {
                    select: {
                        id: true,
                        formTypeEnum: true,
                        payloadJSON: true,
                        submittedAt: true,
                    },
                },
                reviews: {
                    select: {
                        id: true,
                        decision: true,
                        comments: true,
                        decidedAt: true,
                        reviewer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        decidedAt: 'desc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return applications;
    }
    async getApplicationById(applicationId, userId) {
        const application = await this.prisma.application.findFirst({
            where: {
                id: applicationId,
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        matricNo: true,
                        program: true,
                    },
                },
                session: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                        semester: true,
                    },
                },
                company: true,
                documents: true,
                formResponses: true,
                reviews: {
                    include: {
                        reviewer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        return application;
    }
    async getActiveSessions() {
        return this.prisma.session.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                year: true,
                semester: true,
                minCredits: true,
                minWeeks: true,
                maxWeeks: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getUserProfile(userId) {
        var _a;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                matricNo: true,
                program: true,
                phone: true,
                creditsEarned: true,
                studentSessions: {
                    where: {
                        status: 'active',
                    },
                    select: {
                        sessionId: true,
                        session: {
                            select: {
                                id: true,
                                name: true,
                                year: true,
                                semester: true,
                            },
                        },
                    },
                    take: 1,
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return Object.assign(Object.assign({}, user), { assignedSession: ((_a = user.studentSessions[0]) === null || _a === void 0 ? void 0 : _a.session) || null });
    }
    async generateBLI01PDF(applicationId, userId) {
        var _a;
        const application = await this.prisma.application.findFirst({
            where: {
                id: applicationId,
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        matricNo: true,
                        program: true,
                        phone: true,
                    },
                },
                session: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                        semester: true,
                    },
                },
                formResponses: {
                    where: {
                        formTypeEnum: 'BLI_01',
                    },
                    orderBy: {
                        submittedAt: 'desc',
                    },
                    take: 1,
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const bli01FormData = (_a = application.formResponses[0]) === null || _a === void 0 ? void 0 : _a.payloadJSON;
        if (!bli01FormData) {
            throw new common_1.NotFoundException('BLI-01 form data not found for this application');
        }
        const pdfData = {
            student: {
                fullName: bli01FormData.studentName || application.user.name,
                icNumber: bli01FormData.icNo || application.user.phone || 'N/A',
                matricNumber: bli01FormData.matricNo || application.user.matricNo,
                program: bli01FormData.program || application.user.program,
                faculty: bli01FormData.faculty || 'N/A',
                cgpa: bli01FormData.cgpa || 'N/A',
                phone: application.user.phone,
                email: application.user.email,
            },
            session: {
                id: application.session.id,
                name: application.session.name,
                year: application.session.year,
                semester: application.session.semester,
            },
            application: {
                id: application.id,
                createdAt: application.createdAt,
            },
        };
        (0, bli01_generator_1.validateBLI01Data)(pdfData);
        const pdfBuffer = await (0, bli01_generator_1.generateBLI01)(pdfData);
        return pdfBuffer;
    }
    async uploadDocument(applicationId, userId, file, documentType) {
        const application = await this.prisma.application.findFirst({
            where: {
                id: applicationId,
                userId: userId,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const existingDocument = await this.prisma.document.findFirst({
            where: {
                applicationId: applicationId,
                type: documentType,
            },
        });
        let document;
        if (existingDocument) {
            const fs = require('fs');
            const path = require('path');
            if (existingDocument.fileUrl && fs.existsSync(existingDocument.fileUrl)) {
                try {
                    fs.unlinkSync(existingDocument.fileUrl);
                }
                catch (error) {
                    console.error('Error deleting old file:', error);
                }
            }
            document = await this.prisma.document.update({
                where: { id: existingDocument.id },
                data: {
                    fileUrl: file.path,
                    status: client_1.DocumentStatus.PENDING_SIGNATURE,
                    version: existingDocument.version + 1,
                    updatedAt: new Date(),
                },
                include: {
                    application: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    matricNo: true,
                                    program: true,
                                },
                            },
                            session: {
                                select: {
                                    id: true,
                                    name: true,
                                    year: true,
                                    semester: true,
                                },
                            },
                        },
                    },
                },
            });
        }
        else {
            document = await this.prisma.document.create({
                data: {
                    applicationId: applicationId,
                    type: documentType,
                    fileUrl: file.path,
                    status: client_1.DocumentStatus.PENDING_SIGNATURE,
                    version: 1,
                },
                include: {
                    application: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    matricNo: true,
                                    program: true,
                                },
                            },
                            session: {
                                select: {
                                    id: true,
                                    name: true,
                                    year: true,
                                    semester: true,
                                },
                            },
                        },
                    },
                },
            });
        }
        if (application.status === client_1.ApplicationStatus.DRAFT) {
            await this.prisma.application.update({
                where: { id: applicationId },
                data: { status: client_1.ApplicationStatus.SUBMITTED },
            });
        }
        return document;
    }
    async getPendingDocuments(coordinatorId, filters) {
        const coordinatedSessions = await this.prisma.session.findMany({
            where: {
                coordinatorId: coordinatorId,
            },
            select: {
                id: true,
            },
        });
        const sessionIds = coordinatedSessions.map((session) => session.id);
        if (sessionIds.length === 0) {
            return [];
        }
        const where = {
            application: {
                sessionId: {
                    in: sessionIds,
                },
            },
        };
        if (filters.status) {
            where.status = filters.status;
        }
        else {
            where.status = {
                in: [
                    client_1.DocumentStatus.PENDING_SIGNATURE,
                    client_1.DocumentStatus.DRAFT,
                    client_1.DocumentStatus.SIGNED,
                    client_1.DocumentStatus.REJECTED,
                ],
            };
        }
        if (filters.sessionId) {
            if (!sessionIds.includes(filters.sessionId)) {
                throw new common_1.ForbiddenException('You do not have access to this session');
            }
            where.application.sessionId = filters.sessionId;
        }
        const documents = await this.prisma.document.findMany({
            where,
            include: {
                application: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                matricNo: true,
                                program: true,
                            },
                        },
                        session: {
                            select: {
                                id: true,
                                name: true,
                                year: true,
                                semester: true,
                                coordinatorId: true,
                            },
                        },
                        company: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (filters.program) {
            return documents.filter((doc) => doc.application.user.program === filters.program);
        }
        return documents;
    }
    async getDocumentById(documentId, coordinatorId) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
            include: {
                application: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                matricNo: true,
                                program: true,
                            },
                        },
                        session: {
                            select: {
                                id: true,
                                name: true,
                                year: true,
                                semester: true,
                                coordinatorId: true,
                            },
                        },
                        company: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        reviews: {
                            include: {
                                reviewer: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                            orderBy: {
                                decidedAt: 'desc',
                            },
                        },
                    },
                },
            },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (coordinatorId) {
            if (document.application.session.coordinatorId !== coordinatorId) {
                throw new common_1.ForbiddenException('You do not have access to this document');
            }
        }
        return document;
    }
    async reviewDocument(documentId, reviewerId, reviewDto) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
            include: {
                application: {
                    include: {
                        session: {
                            select: {
                                id: true,
                                coordinatorId: true,
                            },
                        },
                    },
                },
            },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (document.application.session.coordinatorId !== reviewerId) {
            throw new common_1.ForbiddenException('You do not have permission to review this document');
        }
        const review = await this.prisma.review.create({
            data: {
                applicationId: document.applicationId,
                reviewerId: reviewerId,
                decision: reviewDto.decision,
                comments: reviewDto.comments,
            },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        let newDocumentStatus;
        let newApplicationStatus;
        switch (reviewDto.decision) {
            case client_1.Decision.APPROVE:
                newDocumentStatus = client_1.DocumentStatus.SIGNED;
                newApplicationStatus = client_1.ApplicationStatus.APPROVED;
                break;
            case client_1.Decision.REQUEST_CHANGES:
                newDocumentStatus = client_1.DocumentStatus.DRAFT;
                newApplicationStatus = client_1.ApplicationStatus.UNDER_REVIEW;
                break;
            case client_1.Decision.REJECT:
                newDocumentStatus = client_1.DocumentStatus.REJECTED;
                newApplicationStatus = client_1.ApplicationStatus.REJECTED;
                break;
        }
        await this.prisma.document.update({
            where: { id: documentId },
            data: { status: newDocumentStatus },
        });
        await this.prisma.application.update({
            where: { id: document.applicationId },
            data: { status: newApplicationStatus },
        });
        return review;
    }
    async updateBli03Data(applicationId, userId, dto) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                user: true,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this application');
        }
        await this.prisma.review.deleteMany({
            where: {
                applicationId: applicationId,
                decision: client_1.Decision.REQUEST_CHANGES,
            },
        });
        let company = await this.prisma.company.findFirst({
            where: {
                name: dto.organizationName,
                address: dto.organizationAddress,
            },
        });
        if (!company) {
            company = await this.prisma.company.create({
                data: {
                    name: dto.organizationName,
                    address: dto.organizationAddress,
                    contactName: dto.contactPersonName,
                    contactEmail: dto.organizationEmail,
                    contactPhone: dto.organizationPhone,
                    fax: dto.organizationFax,
                },
            });
        }
        else {
            company = await this.prisma.company.update({
                where: { id: company.id },
                data: {
                    contactName: dto.contactPersonName,
                    contactEmail: dto.organizationEmail,
                    contactPhone: dto.organizationPhone,
                    fax: dto.organizationFax,
                },
            });
        }
        const updatedApplication = await this.prisma.application.update({
            where: { id: applicationId },
            data: {
                companyId: company.id,
                studentPhone: dto.studentPhone,
                studentEmail: dto.studentEmail,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                organizationName: dto.organizationName,
                organizationAddress: dto.organizationAddress,
                organizationPhone: dto.organizationPhone,
                organizationFax: dto.organizationFax,
                organizationEmail: dto.organizationEmail,
                contactPersonName: dto.contactPersonName,
                contactPersonPhone: dto.contactPersonPhone,
                organizationDeclarationAccepted: dto.organizationDeclaration,
                reportingPeriod: dto.reportingPeriod,
                roleTasksSummary: dto.roleTasksSummary,
                emergencyContactName: dto.emergencyContactName,
                emergencyContactPhone: dto.emergencyContactPhone,
                emergencyContactEmail: dto.emergencyContactEmail,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        matricNo: true,
                        program: true,
                    },
                },
                session: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                        semester: true,
                    },
                },
                company: true,
            },
        });
        await this.prisma.formResponse.create({
            data: {
                applicationId: applicationId,
                formTypeEnum: 'BLI_03',
                payloadJSON: {
                    studentPhone: dto.studentPhone,
                    studentEmail: dto.studentEmail,
                    startDate: dto.startDate,
                    endDate: dto.endDate,
                    organizationName: dto.organizationName,
                    organizationAddress: dto.organizationAddress,
                    organizationPhone: dto.organizationPhone,
                    organizationFax: dto.organizationFax,
                    organizationEmail: dto.organizationEmail,
                    contactPersonName: dto.contactPersonName,
                    contactPersonPhone: dto.contactPersonPhone,
                    organizationDeclaration: dto.organizationDeclaration,
                    reportingPeriod: dto.reportingPeriod,
                    roleTasksSummary: dto.roleTasksSummary,
                    emergencyContactName: dto.emergencyContactName,
                    emergencyContactPhone: dto.emergencyContactPhone,
                    emergencyContactEmail: dto.emergencyContactEmail,
                    submittedAt: new Date().toISOString(),
                },
            },
        });
        const existingBli03Document = await this.prisma.document.findFirst({
            where: {
                applicationId: applicationId,
                type: 'BLI_03',
            },
        });
        if (existingBli03Document) {
            await this.prisma.document.update({
                where: { id: existingBli03Document.id },
                data: {
                    status: 'PENDING_SIGNATURE',
                    version: existingBli03Document.version + 1,
                    updatedAt: new Date(),
                },
            });
        }
        else {
            await this.prisma.document.create({
                data: {
                    applicationId: applicationId,
                    type: 'BLI_03',
                    fileUrl: 'ONLINE_SUBMISSION',
                    status: 'PENDING_SIGNATURE',
                    version: 1,
                },
            });
        }
        return updatedApplication;
    }
    async submitBli04(applicationId, userId, bli04Data) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                user: true,
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to submit this form');
        }
        await this.prisma.review.deleteMany({
            where: {
                applicationId: applicationId,
                decision: client_1.Decision.REQUEST_CHANGES,
            },
        });
        const formResponse = await this.prisma.formResponse.create({
            data: {
                applicationId: applicationId,
                formTypeEnum: 'BLI_04',
                payloadJSON: Object.assign(Object.assign({}, bli04Data), { submittedAt: new Date().toISOString() }),
            },
        });
        const existingBli04Document = await this.prisma.document.findFirst({
            where: {
                applicationId: applicationId,
                type: 'BLI_04',
            },
        });
        let document;
        if (existingBli04Document) {
            document = await this.prisma.document.update({
                where: { id: existingBli04Document.id },
                data: {
                    status: client_1.DocumentStatus.PENDING_SIGNATURE,
                    version: existingBli04Document.version + 1,
                    updatedAt: new Date(),
                },
            });
        }
        else {
            document = await this.prisma.document.create({
                data: {
                    applicationId: applicationId,
                    type: client_1.DocumentType.BLI_04,
                    fileUrl: 'ONLINE_SUBMISSION',
                    status: client_1.DocumentStatus.PENDING_SIGNATURE,
                    version: 1,
                },
            });
        }
        return {
            formResponse,
            document,
        };
    }
    async getBli03Submissions(coordinatorId, filters) {
        const coordinatedSessions = await this.prisma.session.findMany({
            where: {
                coordinatorId: coordinatorId,
            },
            select: {
                id: true,
            },
        });
        const sessionIds = coordinatedSessions.map((session) => session.id);
        if (sessionIds.length === 0) {
            return [];
        }
        const where = {
            sessionId: {
                in: sessionIds,
            },
            formResponses: {
                some: {
                    formTypeEnum: 'BLI_03',
                },
            },
        };
        if (filters === null || filters === void 0 ? void 0 : filters.sessionId) {
            if (!sessionIds.includes(filters.sessionId)) {
                throw new common_1.ForbiddenException('You do not have access to this session');
            }
            where.sessionId = filters.sessionId;
        }
        const applications = await this.prisma.application.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        matricNo: true,
                        program: true,
                    },
                },
                session: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                        semester: true,
                    },
                },
                formResponses: {
                    where: {
                        formTypeEnum: 'BLI_03',
                    },
                    orderBy: {
                        submittedAt: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        if (filters === null || filters === void 0 ? void 0 : filters.program) {
            return applications.filter((app) => app.user.program === filters.program);
        }
        return applications;
    }
    async getBli03SubmissionById(applicationId, coordinatorId) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        matricNo: true,
                        program: true,
                    },
                },
                session: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                        semester: true,
                        coordinatorId: true,
                    },
                },
                formResponses: {
                    orderBy: {
                        submittedAt: 'desc',
                    },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.session.coordinatorId !== coordinatorId) {
            throw new common_1.ForbiddenException('You do not have access to this submission');
        }
        return application;
    }
    async generateBLI03PDF(applicationId, userId) {
        var _a, _b, _c;
        const application = await this.prisma.application.findFirst({
            where: {
                id: applicationId,
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        matricNo: true,
                        program: true,
                        phone: true,
                    },
                },
                session: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                        semester: true,
                    },
                },
                formResponses: {
                    where: {
                        formTypeEnum: 'BLI_03',
                    },
                    orderBy: {
                        submittedAt: 'desc',
                    },
                    take: 1,
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const bli03FormData = (_a = application.formResponses[0]) === null || _a === void 0 ? void 0 : _a.payloadJSON;
        if (!bli03FormData) {
            throw new common_1.NotFoundException('BLI-03 form data not found for this application');
        }
        const pdfData = {
            student: {
                name: application.user.name,
                matricNo: application.user.matricNo || 'N/A',
                program: application.user.program || 'N/A',
                phone: bli03FormData.studentPhone || application.user.phone || 'N/A',
                email: bli03FormData.studentEmail || application.user.email || 'N/A',
                startDate: bli03FormData.startDate || ((_b = application.startDate) === null || _b === void 0 ? void 0 : _b.toISOString().split('T')[0]) || 'N/A',
                endDate: bli03FormData.endDate || ((_c = application.endDate) === null || _c === void 0 ? void 0 : _c.toISOString().split('T')[0]) || 'N/A',
            },
            organization: {
                name: bli03FormData.organizationName || application.organizationName || 'N/A',
                address: bli03FormData.organizationAddress || application.organizationAddress || 'N/A',
                phone: bli03FormData.organizationPhone || application.organizationPhone || 'N/A',
                fax: bli03FormData.organizationFax || application.organizationFax || '',
                email: bli03FormData.organizationEmail || application.organizationEmail || 'N/A',
                contactPersonName: bli03FormData.contactPersonName || application.contactPersonName || 'N/A',
                contactPersonPhone: bli03FormData.contactPersonPhone || application.contactPersonPhone || 'N/A',
            },
            application: {
                id: application.id,
                createdAt: application.createdAt,
            },
        };
        (0, bli03_generator_1.validateBLI03Data)(pdfData);
        const pdfBuffer = await (0, bli03_generator_1.generateBLI03)(pdfData);
        return pdfBuffer;
    }
    async generateSLI03PDF(applicationId, userId) {
        var _a, _b, _c, _d, _e;
        const application = await this.prisma.application.findFirst({
            where: {
                id: applicationId,
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        matricNo: true,
                        program: true,
                        phone: true,
                    },
                },
                session: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                        semester: true,
                        coordinator: {
                            select: {
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                formResponses: {
                    where: {
                        OR: [
                            { formTypeEnum: 'BLI_01' },
                            { formTypeEnum: 'BLI_03' },
                        ],
                    },
                    orderBy: {
                        submittedAt: 'desc',
                    },
                },
                documents: {
                    where: {
                        OR: [
                            { type: client_1.DocumentType.BLI_03 },
                            { type: client_1.DocumentType.BLI_03_HARDCOPY },
                        ],
                    },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const bli03Online = application.documents.find(d => d.type === client_1.DocumentType.BLI_03);
        const bli03Hardcopy = application.documents.find(d => d.type === client_1.DocumentType.BLI_03_HARDCOPY);
        if (!bli03Online || !bli03Hardcopy) {
            throw new common_1.BadRequestException('BLI-03 documents not found');
        }
        if (bli03Online.status !== client_1.DocumentStatus.SIGNED || bli03Hardcopy.status !== client_1.DocumentStatus.SIGNED) {
            throw new common_1.BadRequestException('BLI-03 must be fully approved before generating SLI-03');
        }
        const bli01FormData = (_a = application.formResponses.find(f => f.formTypeEnum === 'BLI_01')) === null || _a === void 0 ? void 0 : _a.payloadJSON;
        const bli03FormData = (_b = application.formResponses.find(f => f.formTypeEnum === 'BLI_03')) === null || _b === void 0 ? void 0 : _b.payloadJSON;
        if (!bli03FormData) {
            throw new common_1.NotFoundException('BLI-03 form data not found');
        }
        const startDate = new Date(bli03FormData.startDate || application.startDate);
        const endDate = new Date(bli03FormData.endDate || application.endDate);
        const durationWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        const pdfData = {
            student: {
                fullName: application.user.name,
                matricNumber: application.user.matricNo || 'N/A',
                icNumber: (bli01FormData === null || bli01FormData === void 0 ? void 0 : bli01FormData.icNumber) || 'N/A',
                program: application.user.program || 'N/A',
                faculty: 'Fakulti Sains Komputer dan Matematik',
                email: application.user.email || 'N/A',
            },
            company: {
                name: bli03FormData.organizationName || application.organizationName || 'N/A',
                address: bli03FormData.organizationAddress || application.organizationAddress || 'N/A',
                city: bli03FormData.organizationCity || 'N/A',
                state: bli03FormData.organizationState || 'N/A',
                postcode: bli03FormData.organizationPostcode || 'N/A',
                attentionTo: bli03FormData.contactPerson || bli03FormData.contactName || '',
            },
            training: {
                startDate: startDate,
                endDate: endDate,
                duration: durationWeeks,
            },
            session: {
                name: application.session.name,
                year: application.session.year,
                semester: application.session.semester,
            },
            application: {
                id: application.id,
                approvedAt: bli03Hardcopy.updatedAt,
            },
            coordinator: {
                name: ((_c = application.session.coordinator) === null || _c === void 0 ? void 0 : _c.name) || 'Albin Lemuel Kushan',
                position: 'Penyelaras Latihan Industri CDCS251/CS251',
                email: ((_d = application.session.coordinator) === null || _d === void 0 ? void 0 : _d.email) || 'albin1841@uitm.edu.my',
                phone: ((_e = application.session.coordinator) === null || _e === void 0 ? void 0 : _e.phone) || '013-8218885',
            },
        };
        (0, sli03_generator_1.validateSLI03Data)(pdfData);
        const pdfBuffer = await (0, sli03_generator_1.generateSLI03)(pdfData);
        return pdfBuffer;
    }
    async generateDLI01PDF(applicationId, userId) {
        var _a, _b;
        const application = await this.prisma.application.findFirst({
            where: {
                id: applicationId,
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        matricNo: true,
                        program: true,
                        phone: true,
                    },
                },
                session: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                        semester: true,
                    },
                },
                formResponses: {
                    where: {
                        OR: [
                            { formTypeEnum: 'BLI_01' },
                            { formTypeEnum: 'BLI_03' },
                        ],
                    },
                    orderBy: {
                        submittedAt: 'desc',
                    },
                },
                documents: {
                    where: {
                        OR: [
                            { type: client_1.DocumentType.BLI_03 },
                            { type: client_1.DocumentType.BLI_03_HARDCOPY },
                        ],
                    },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const bli03Online = application.documents.find(d => d.type === client_1.DocumentType.BLI_03);
        const bli03Hardcopy = application.documents.find(d => d.type === client_1.DocumentType.BLI_03_HARDCOPY);
        if (!bli03Online || !bli03Hardcopy) {
            throw new common_1.BadRequestException('BLI-03 documents not found');
        }
        if (bli03Online.status !== client_1.DocumentStatus.SIGNED || bli03Hardcopy.status !== client_1.DocumentStatus.SIGNED) {
            throw new common_1.BadRequestException('BLI-03 must be fully approved before generating DLI-01');
        }
        const bli01FormData = (_a = application.formResponses.find(f => f.formTypeEnum === 'BLI_01')) === null || _a === void 0 ? void 0 : _a.payloadJSON;
        const bli03FormData = (_b = application.formResponses.find(f => f.formTypeEnum === 'BLI_03')) === null || _b === void 0 ? void 0 : _b.payloadJSON;
        if (!bli01FormData || !bli03FormData) {
            throw new common_1.NotFoundException('Required form data not found');
        }
        const startDate = new Date(bli03FormData.startDate || application.startDate);
        const endDate = new Date(bli03FormData.endDate || application.endDate);
        const durationWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        const pdfData = {
            student: {
                fullName: application.user.name,
                icNumber: bli01FormData.icNo || 'N/A',
                matricNumber: application.user.matricNo || 'N/A',
                program: application.user.program || 'N/A',
                faculty: 'Fakulti Sains Komputer dan Matematik',
                phone: bli03FormData.studentPhone || application.user.phone || 'N/A',
                email: bli03FormData.studentEmail || application.user.email || 'N/A',
                address: bli01FormData.address || 'N/A',
            },
            company: {
                name: bli03FormData.organizationName || application.organizationName || 'N/A',
                address: bli03FormData.organizationAddress || application.organizationAddress || 'N/A',
                city: bli03FormData.organizationCity || 'N/A',
                state: bli03FormData.organizationState || 'N/A',
                postcode: bli03FormData.organizationPostcode || 'N/A',
            },
            training: {
                startDate: startDate,
                endDate: endDate,
                duration: durationWeeks,
            },
            coordinator: {
                name: 'Koordinator Latihan Industri',
                email: 'li.fskm@uitm.edu.my',
                phone: '06-2645000',
            },
            session: {
                name: application.session.name,
                year: application.session.year,
                semester: application.session.semester,
            },
            application: {
                id: application.id,
            },
        };
        (0, dli01_generator_1.validateDLI01Data)(pdfData);
        const pdfBuffer = await (0, dli01_generator_1.generateDLI01)(pdfData);
        return pdfBuffer;
    }
    async generateBLI04PDF(applicationId, userId) {
        var _a, _b;
        const application = await this.prisma.application.findFirst({
            where: Object.assign({ id: applicationId }, (userId && { userId: userId })),
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        matricNo: true,
                        program: true,
                        phone: true,
                    },
                },
                formResponses: {
                    where: {
                        OR: [
                            { formTypeEnum: 'BLI_03' },
                            { formTypeEnum: 'BLI_04' },
                        ],
                    },
                    orderBy: {
                        submittedAt: 'desc',
                    },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const bli03FormData = (_a = application.formResponses.find(f => f.formTypeEnum === 'BLI_03')) === null || _a === void 0 ? void 0 : _a.payloadJSON;
        const bli04FormData = (_b = application.formResponses.find(f => f.formTypeEnum === 'BLI_04')) === null || _b === void 0 ? void 0 : _b.payloadJSON;
        if (!bli03FormData) {
            throw new common_1.NotFoundException('BLI-03 form data not found. Please complete BLI-03 first.');
        }
        const pdfData = {
            student: {
                fullName: application.user.name,
                matricNumber: application.user.matricNo || 'N/A',
                program: application.user.program || 'N/A',
            },
            company: {
                name: bli03FormData.organizationName || application.organizationName || '',
                address: bli03FormData.organizationAddress || application.organizationAddress || '',
                department: (bli04FormData === null || bli04FormData === void 0 ? void 0 : bli04FormData.department) || '',
                supervisorName: (bli04FormData === null || bli04FormData === void 0 ? void 0 : bli04FormData.supervisorName) || bli03FormData.supervisorName || '',
                supervisorPhone: (bli04FormData === null || bli04FormData === void 0 ? void 0 : bli04FormData.supervisorPhone) || bli03FormData.supervisorPhone || '',
                supervisorFax: (bli04FormData === null || bli04FormData === void 0 ? void 0 : bli04FormData.supervisorFax) || '',
                supervisorEmail: (bli04FormData === null || bli04FormData === void 0 ? void 0 : bli04FormData.supervisorEmail) || bli03FormData.supervisorEmail || '',
            },
            training: {
                startDate: bli03FormData.startDate ? new Date(bli03FormData.startDate) : new Date(),
                organizationSector: (bli04FormData === null || bli04FormData === void 0 ? void 0 : bli04FormData.organizationSector) || [],
                industryCode: (bli04FormData === null || bli04FormData === void 0 ? void 0 : bli04FormData.industryCode) || [],
            },
        };
        (0, bli04_generator_1.validateBLI04Data)(pdfData);
        const pdfBuffer = await (0, bli04_generator_1.generateBLI04)(pdfData);
        return pdfBuffer;
    }
    async generateSLI04PDF(applicationId, userId, sli04Data) {
        var _a, _b, _c;
        const application = await this.prisma.application.findFirst({
            where: {
                id: applicationId,
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        matricNo: true,
                        program: true,
                        phone: true,
                    },
                },
                company: {
                    select: {
                        name: true,
                        address: true,
                    },
                },
                formResponses: {
                    where: {
                        formTypeEnum: 'BLI_01',
                    },
                    orderBy: {
                        submittedAt: 'desc',
                    },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const bli01FormData = (_a = application.formResponses[0]) === null || _a === void 0 ? void 0 : _a.payloadJSON;
        const pdfData = {
            student: {
                fullName: application.user.name,
                matricNumber: application.user.matricNo || 'N/A',
                program: application.user.program || 'N/A',
                phone: application.user.phone || (bli01FormData === null || bli01FormData === void 0 ? void 0 : bli01FormData.phone) || 'N/A',
                email: application.user.email || 'N/A',
            },
            company: {
                name: sli04Data.companyName || ((_b = application.company) === null || _b === void 0 ? void 0 : _b.name) || 'N/A',
                position: sli04Data.position || 'N/A',
                address: ((_c = application.company) === null || _c === void 0 ? void 0 : _c.address) || 'N/A',
            },
            rejection: {
                referenceNumber: sli04Data.referenceNumber || 'N/A',
                letterDate: new Date(),
                offerDate: sli04Data.offerDate ? new Date(sli04Data.offerDate) : new Date(),
            },
            application: {
                id: application.id,
            },
        };
        (0, sli04_generator_1.validateSLI04Data)(pdfData);
        const pdfBuffer = await (0, sli04_generator_1.generateSLI04)(pdfData);
        return pdfBuffer;
    }
    async getStudentDocuments(applicationId, userId) {
        const application = await this.prisma.application.findFirst({
            where: {
                id: applicationId,
                userId: userId,
            },
            include: {
                documents: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        matricNo: true,
                        program: true,
                    },
                },
                session: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                        semester: true,
                    },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        return {
            application: {
                id: application.id,
                status: application.status,
                user: application.user,
                session: application.session,
            },
            documents: application.documents,
        };
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map