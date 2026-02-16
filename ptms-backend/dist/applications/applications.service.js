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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
const bli01_generator_1 = require("./utils/bli01-generator");
const bli03_generator_1 = require("./utils/bli03-generator");
const bli04_generator_1 = require("./utils/bli04-generator");
const sli03_generator_1 = require("./utils/sli03-generator");
const sli04_generator_1 = require("./utils/sli04-generator");
const dli01_generator_1 = require("./utils/dli01-generator");
const crypto_1 = require("crypto");
const archiver_1 = __importDefault(require("archiver"));
let ApplicationsService = class ApplicationsService {
    constructor(prisma, storageService, notificationsService) {
        this.prisma = prisma;
        this.storageService = storageService;
        this.notificationsService = notificationsService;
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
                        supervisorSignature: true,
                        supervisorSignatureType: true,
                        supervisorSignedAt: true,
                        supervisorName: true,
                        verifiedBy: true,
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const existingDocument = await this.prisma.document.findFirst({
            where: {
                applicationId: applicationId,
                type: client_1.DocumentType.BLI_01,
            },
        });
        if (existingDocument && existingDocument.fileUrl !== 'ONLINE_SUBMISSION') {
            try {
                console.log(`✅ [BLI-01] Found existing document, retrieving from storage: ${existingDocument.fileUrl}`);
                const pdfBuffer = await this.storageService.download(existingDocument.fileUrl);
                console.log(`✅ [BLI-01] Successfully retrieved PDF from storage (${pdfBuffer.length} bytes)`);
                return pdfBuffer;
            }
            catch (error) {
                console.error('❌ [BLI-01] Failed to retrieve stored PDF, regenerating:', error);
            }
        }
        else {
            console.log('📝 [BLI-01] No existing document found, will generate new PDF');
        }
        const whereClause = { id: applicationId };
        if (userId !== null) {
            whereClause.userId = userId;
        }
        const application = await this.prisma.application.findFirst({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        matricNo: true,
                        icNumber: true,
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
                        trainingStartDate: true,
                        trainingEndDate: true,
                        minWeeks: true,
                        maxWeeks: true,
                        deadlinesJSON: true,
                        referenceNumberFormat: true,
                        coordinator: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                program: true,
                                faculty: true,
                                campus: true,
                                campusAddress: true,
                                campusCity: true,
                                campusPhone: true,
                                universityBranch: true,
                            },
                        },
                        coordinatorSignature: true,
                        coordinatorSignatureType: true,
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
        const deadlines = application.session.deadlinesJSON || {};
        const pdfData = {
            student: {
                fullName: bli01FormData.studentName || application.user.name,
                icNumber: bli01FormData.icNo || application.user.icNumber || 'N/A',
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
                startDate: application.session.trainingStartDate || (deadlines.trainingStartDate ? new Date(deadlines.trainingStartDate) : undefined),
                endDate: application.session.trainingEndDate || (deadlines.trainingEndDate ? new Date(deadlines.trainingEndDate) : undefined),
                applicationDeadline: deadlines.applicationDeadline ? new Date(deadlines.applicationDeadline) : undefined,
                referenceNumber: application.session.referenceNumberFormat,
                minWeeks: application.session.minWeeks,
                maxWeeks: application.session.maxWeeks,
            },
            application: {
                id: application.id,
                createdAt: application.createdAt,
            },
            coordinator: {
                name: ((_b = application.session.coordinator) === null || _b === void 0 ? void 0 : _b.name) || 'Industrial Training Coordinator',
                email: ((_c = application.session.coordinator) === null || _c === void 0 ? void 0 : _c.email) || 'coordinator@uitm.edu.my',
                phone: (_d = application.session.coordinator) === null || _d === void 0 ? void 0 : _d.phone,
                program: (_e = application.session.coordinator) === null || _e === void 0 ? void 0 : _e.program,
                signature: application.session.coordinatorSignature,
                signatureType: application.session.coordinatorSignatureType,
            },
            campus: {
                faculty: ((_f = application.session.coordinator) === null || _f === void 0 ? void 0 : _f.faculty) || 'Fakulti Sains Komputer dan\nMatematik',
                universityBranch: ((_g = application.session.coordinator) === null || _g === void 0 ? void 0 : _g.universityBranch) || 'Universiti Teknologi MARA(Melaka)',
                campusName: ((_h = application.session.coordinator) === null || _h === void 0 ? void 0 : _h.campus) || 'Kampus Jasin',
                address: ((_j = application.session.coordinator) === null || _j === void 0 ? void 0 : _j.campusAddress) || '77300 Merlimau, Jasin',
                city: ((_k = application.session.coordinator) === null || _k === void 0 ? void 0 : _k.campusCity) || 'Melaka Bandaraya Bersejarah',
                phone: ((_l = application.session.coordinator) === null || _l === void 0 ? void 0 : _l.campusPhone) || '(+606) 2645000',
            },
        };
        (0, bli01_generator_1.validateBLI01Data)(pdfData);
        const pdfBuffer = await (0, bli01_generator_1.generateBLI01)(pdfData);
        const filename = `bli01-${applicationId}.pdf`;
        const directory = `generated/${applicationId}`;
        console.log(`💾 [BLI-01] Storing PDF in storage: ${directory}/${filename}`);
        try {
            const uploadResult = await this.storageService.upload(pdfBuffer, {
                filename,
                directory,
                contentType: 'application/pdf',
                metadata: {
                    applicationId,
                    userId,
                    documentType: client_1.DocumentType.BLI_01,
                    generated: true,
                },
            });
            console.log(`✅ [BLI-01] PDF uploaded to storage: ${uploadResult.path}`);
            if (existingDocument) {
                console.log(`🔄 [BLI-01] Updating existing Document record`);
                await this.prisma.document.update({
                    where: { id: existingDocument.id },
                    data: {
                        fileUrl: uploadResult.path,
                        storageType: uploadResult.provider,
                        status: client_1.DocumentStatus.SIGNED,
                        updatedAt: new Date(),
                    },
                });
                console.log(`✅ [BLI-01] Document record updated successfully`);
            }
            else {
                console.log(`➕ [BLI-01] Creating new Document record`);
                const doc = await this.prisma.document.create({
                    data: {
                        applicationId: applicationId,
                        type: client_1.DocumentType.BLI_01,
                        fileUrl: uploadResult.path,
                        storageType: uploadResult.provider,
                        status: client_1.DocumentStatus.SIGNED,
                        version: 1,
                    },
                });
                console.log(`✅ [BLI-01] Document record created: ${doc.id}`);
            }
        }
        catch (error) {
            console.error('❌ [BLI-01] Failed to store generated PDF:', error);
        }
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
        const timestamp = Date.now();
        const filename = `${documentType.toLowerCase()}-${applicationId}-${timestamp}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`;
        const uploadResult = await this.storageService.upload(file, {
            filename,
            directory: 'documents',
            contentType: file.mimetype,
            metadata: {
                applicationId,
                userId,
                documentType,
            },
        });
        const existingDocument = await this.prisma.document.findFirst({
            where: {
                applicationId: applicationId,
                type: documentType,
            },
        });
        let document;
        if (existingDocument) {
            try {
                await this.storageService.delete(existingDocument.fileUrl);
            }
            catch (error) {
                console.error('Error deleting old file:', error);
            }
            document = await this.prisma.document.update({
                where: { id: existingDocument.id },
                data: {
                    fileUrl: uploadResult.path,
                    storageType: uploadResult.provider,
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
                    fileUrl: uploadResult.path,
                    storageType: uploadResult.provider,
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
            await this.notificationsService.notifySubmissionReceived(applicationId);
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
    async downloadUploadedDocument(documentId, coordinatorId) {
        const document = await this.getDocumentById(documentId, coordinatorId);
        if (!document.fileUrl || document.fileUrl === 'ONLINE_SUBMISSION') {
            throw new common_1.BadRequestException('This document is not an uploaded file');
        }
        try {
            const fileBuffer = await this.storageService.download(document.fileUrl);
            return fileBuffer;
        }
        catch (error) {
            console.error('Error downloading document from storage:', error);
            throw new common_1.NotFoundException('Failed to retrieve document from storage');
        }
    }
    async downloadStudentDocument(applicationId, documentId, studentId) {
        const application = await this.prisma.application.findFirst({
            where: {
                id: applicationId,
                userId: studentId,
            },
            include: {
                documents: {
                    where: { id: documentId },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found or does not belong to you');
        }
        const document = application.documents[0];
        if (!document) {
            throw new common_1.NotFoundException('Document not found in your application');
        }
        if (!document.fileUrl || document.fileUrl === 'ONLINE_SUBMISSION') {
            throw new common_1.BadRequestException('This document is not an uploaded file');
        }
        try {
            const fileBuffer = await this.storageService.download(document.fileUrl);
            return fileBuffer;
        }
        catch (error) {
            console.error('Error downloading document from storage:', error);
            throw new common_1.NotFoundException('Failed to retrieve document from storage');
        }
    }
    async downloadAllStudentDocumentsAsZip(userId, coordinatorId) {
        var _a;
        const applications = await this.prisma.application.findMany({
            where: { userId },
            include: {
                documents: {
                    where: {
                        status: {
                            in: [client_1.DocumentStatus.SIGNED, client_1.DocumentStatus.PENDING_SIGNATURE],
                        },
                    },
                },
                session: true,
                user: true,
                company: true,
            },
        });
        if (!applications.length) {
            throw new common_1.NotFoundException('No applications found for this student');
        }
        const hasAccess = applications.some((app) => app.session.coordinatorId === coordinatorId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to this student\'s documents');
        }
        const studentName = applications[0].user.name;
        const matricNo = applications[0].user.matricNo;
        const archive = (0, archiver_1.default)('zip', {
            zlib: { level: 9 },
        });
        let fileCount = 0;
        for (const app of applications) {
            const sessionFolder = `${app.session.year}_Semester${app.session.semester}`;
            const companyName = ((_a = app.company) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown_Company';
            const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
            for (const doc of app.documents) {
                try {
                    if (!doc.fileUrl || doc.fileUrl === 'ONLINE_SUBMISSION') {
                        let pdfBuffer = null;
                        const fileName = `${doc.type}.pdf`;
                        switch (doc.type) {
                            case 'BLI_01':
                                pdfBuffer = await this.generateBLI01PDF(app.id, null);
                                break;
                            case 'BLI_03':
                                pdfBuffer = await this.generateBLI03PDF(app.id, null);
                                break;
                            case 'BLI_04':
                                pdfBuffer = await this.generateBLI04PDF(app.id, null);
                                break;
                            case 'SLI_03':
                                pdfBuffer = await this.generateSLI03PDF(app.id, null);
                                break;
                            case 'DLI_01':
                                pdfBuffer = await this.generateDLI01PDF(app.id, null);
                                break;
                        }
                        if (pdfBuffer) {
                            archive.append(pdfBuffer, {
                                name: `${sessionFolder}/${sanitizedCompanyName}/${fileName}`,
                            });
                            fileCount++;
                        }
                    }
                    else {
                        const fileExists = await this.storageService.exists(doc.fileUrl);
                        if (!fileExists) {
                            console.warn(`File not found in storage, skipping: ${doc.fileUrl}`);
                            continue;
                        }
                        const fileBuffer = await this.storageService.download(doc.fileUrl);
                        const fileName = `${doc.type}.pdf`;
                        archive.append(fileBuffer, {
                            name: `${sessionFolder}/${sanitizedCompanyName}/${fileName}`,
                        });
                        fileCount++;
                    }
                }
                catch (error) {
                    console.error(`Error adding document ${doc.id} (${doc.type}) to archive:`, error.message || error);
                }
            }
        }
        if (fileCount === 0) {
            throw new common_1.NotFoundException('No documents available to download');
        }
        archive.finalize();
        return {
            stream: archive,
            studentName,
            matricNo,
        };
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
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                matricNo: true,
                                program: true,
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
        switch (reviewDto.decision) {
            case client_1.Decision.APPROVE:
                newDocumentStatus = client_1.DocumentStatus.SIGNED;
                break;
            case client_1.Decision.REQUEST_CHANGES:
                newDocumentStatus = client_1.DocumentStatus.DRAFT;
                await this.notificationsService.notifyChangesRequested(document.applicationId, reviewDto.comments || 'Please review and make necessary changes');
                break;
            case client_1.Decision.REJECT:
                newDocumentStatus = client_1.DocumentStatus.REJECTED;
                break;
        }
        await this.prisma.document.update({
            where: { id: documentId },
            data: { status: newDocumentStatus },
        });
        if (reviewDto.decision === client_1.Decision.APPROVE && document.type === client_1.DocumentType.BLI_01) {
            await this.prisma.application.update({
                where: { id: document.applicationId },
                data: { status: client_1.ApplicationStatus.APPROVED },
            });
        }
        if (reviewDto.decision === client_1.Decision.APPROVE) {
            try {
                if (document.type === client_1.DocumentType.BLI_03) {
                    await this.generateBLI03PDF(document.applicationId, document.application.user.id);
                    const bli03Form = await this.prisma.formResponse.findFirst({
                        where: {
                            applicationId: document.applicationId,
                            formTypeEnum: 'BLI_03',
                        },
                    });
                    if (bli03Form) {
                        await this.prisma.formResponse.update({
                            where: { id: bli03Form.id },
                            data: {
                                coordinatorSignedAt: new Date(),
                                verifiedBy: reviewerId,
                            },
                        });
                        console.log('✅ Updated BLI-03 form with coordinatorSignedAt timestamp');
                        await this.prisma.application.update({
                            where: { id: document.applicationId },
                            data: {
                                status: client_1.ApplicationStatus.APPROVED,
                            },
                        });
                        console.log('✅ Updated application status to APPROVED');
                        await this.notificationsService.notifyApplicationApproved(document.applicationId);
                    }
                }
                else if (document.type === client_1.DocumentType.BLI_04) {
                    await this.generateBLI04PDF(document.applicationId, document.application.user.id);
                }
            }
            catch (error) {
                console.error(`Failed to generate ${document.type} PDF after approval:`, error);
            }
            try {
                console.log('🔓 Calling unlockDocumentsAfterApproval from reviewDocument...');
                await this.unlockDocumentsAfterApproval(document.applicationId, document.type);
                console.log('✅ Finished unlockDocumentsAfterApproval');
            }
            catch (error) {
                console.error('Failed to unlock documents after approval:', error);
            }
        }
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
        if (bli04Data.organisationName || bli04Data.organisationAddress ||
            bli04Data.department || bli04Data.supervisorName ||
            bli04Data.telephoneNo || bli04Data.faxNo || bli04Data.email) {
            await this.prisma.application.update({
                where: { id: applicationId },
                data: {
                    organizationName: bli04Data.organisationName || application.organizationName,
                    organizationAddress: bli04Data.organisationAddress || application.organizationAddress,
                    organizationPhone: bli04Data.telephoneNo || application.organizationPhone,
                    organizationFax: bli04Data.faxNo || application.organizationFax,
                    organizationEmail: bli04Data.email || application.organizationEmail,
                    contactPersonName: bli04Data.supervisorName || application.contactPersonName,
                },
            });
        }
        const existingFormResponse = await this.prisma.formResponse.findFirst({
            where: {
                applicationId: applicationId,
                formTypeEnum: 'BLI_04',
            },
        });
        let formResponse;
        if (existingFormResponse) {
            const existingData = existingFormResponse.payloadJSON;
            formResponse = await this.prisma.formResponse.update({
                where: { id: existingFormResponse.id },
                data: {
                    payloadJSON: Object.assign(Object.assign(Object.assign({}, existingData), bli04Data), { submittedAt: new Date().toISOString() }),
                },
            });
        }
        else {
            formResponse = await this.prisma.formResponse.create({
                data: {
                    applicationId: applicationId,
                    formTypeEnum: 'BLI_04',
                    payloadJSON: Object.assign(Object.assign({}, bli04Data), { submittedAt: new Date().toISOString() }),
                },
            });
        }
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
                    select: {
                        id: true,
                        formTypeEnum: true,
                        payloadJSON: true,
                        submittedAt: true,
                        supervisorSignature: true,
                        supervisorSignatureType: true,
                        supervisorSignedAt: true,
                        supervisorName: true,
                        verifiedBy: true,
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
        if (application.session.coordinatorId !== coordinatorId) {
            throw new common_1.ForbiddenException('You do not have access to this submission');
        }
        return application;
    }
    async generateBLI03PDF(applicationId, userId) {
        var _a, _b, _c;
        const existingDocument = await this.prisma.document.findFirst({
            where: {
                applicationId: applicationId,
                type: client_1.DocumentType.BLI_03,
            },
        });
        if (existingDocument && existingDocument.fileUrl !== 'ONLINE_SUBMISSION') {
            console.log(`[BLI03] Found existing document record:`, {
                documentId: existingDocument.id,
                fileUrl: existingDocument.fileUrl,
                applicationId: applicationId
            });
            try {
                const fileExists = await this.storageService.exists(existingDocument.fileUrl);
                if (!fileExists) {
                    console.warn(`[BLI03] File does not exist in storage: ${existingDocument.fileUrl}. Will regenerate PDF.`);
                    await this.prisma.document.delete({
                        where: { id: existingDocument.id }
                    });
                }
                else {
                    const pdfBuffer = await this.storageService.download(existingDocument.fileUrl);
                    console.log(`[BLI03] Successfully retrieved stored PDF for application ${applicationId}`);
                    return pdfBuffer;
                }
            }
            catch (error) {
                console.error(`[BLI03] Failed to retrieve stored PDF for application ${applicationId}:`, {
                    error: error.message || error,
                    fileUrl: existingDocument.fileUrl,
                    documentId: existingDocument.id
                });
            }
        }
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
                        coordinatorSignature: true,
                        coordinatorSignatureType: true,
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
        const bli03Form = application.formResponses[0];
        const coordinatorSigType = application.session.coordinatorSignatureType || (bli03Form === null || bli03Form === void 0 ? void 0 : bli03Form.coordinatorSignatureType);
        const validCoordinatorSigType = (coordinatorSigType === 'typed' || coordinatorSigType === 'drawn' || coordinatorSigType === 'image')
            ? coordinatorSigType
            : undefined;
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
            signatures: {
                studentSignature: bli03Form === null || bli03Form === void 0 ? void 0 : bli03Form.studentSignature,
                studentSignatureType: bli03Form === null || bli03Form === void 0 ? void 0 : bli03Form.studentSignatureType,
                studentSignedAt: bli03Form === null || bli03Form === void 0 ? void 0 : bli03Form.studentSignedAt,
                coordinatorSignature: application.session.coordinatorSignature || (bli03Form === null || bli03Form === void 0 ? void 0 : bli03Form.coordinatorSignature),
                coordinatorSignatureType: validCoordinatorSigType,
                coordinatorSignedAt: bli03Form === null || bli03Form === void 0 ? void 0 : bli03Form.coordinatorSignedAt,
            },
        };
        (0, bli03_generator_1.validateBLI03Data)(pdfData);
        const pdfBuffer = await (0, bli03_generator_1.generateBLI03)(pdfData);
        const filename = `bli03-${applicationId}.pdf`;
        const directory = `generated/${applicationId}`;
        try {
            const uploadResult = await this.storageService.upload(pdfBuffer, {
                filename,
                directory,
                contentType: 'application/pdf',
                metadata: {
                    applicationId,
                    userId,
                    documentType: client_1.DocumentType.BLI_03,
                    generated: true,
                },
            });
            const documentData = {
                fileUrl: uploadResult.path,
                storageType: uploadResult.provider,
                status: client_1.DocumentStatus.SIGNED,
                updatedAt: new Date(),
            };
            if (existingDocument) {
                try {
                    await this.prisma.document.update({
                        where: { id: existingDocument.id },
                        data: documentData,
                    });
                }
                catch (error) {
                    if (error.code === 'P2025') {
                        console.warn(`[BLI03] Document ${existingDocument.id} not found, creating new record`);
                        await this.prisma.document.create({
                            data: Object.assign({ applicationId: applicationId, type: client_1.DocumentType.BLI_03 }, documentData),
                        });
                    }
                    else {
                        throw error;
                    }
                }
            }
            else {
                await this.prisma.document.create({
                    data: Object.assign(Object.assign({ applicationId: applicationId, type: client_1.DocumentType.BLI_03 }, documentData), { version: 1 }),
                });
            }
        }
        catch (error) {
            console.error('Failed to store generated PDF:', error);
        }
        return pdfBuffer;
    }
    async generateSLI03PDF(applicationId, userId) {
        var _a, _b, _c, _d, _e;
        const existingDocument = await this.prisma.document.findFirst({
            where: {
                applicationId: applicationId,
                type: client_1.DocumentType.SLI_03,
            },
        });
        if (existingDocument && existingDocument.fileUrl !== 'ONLINE_SUBMISSION') {
            try {
                const pdfBuffer = await this.storageService.download(existingDocument.fileUrl);
                return pdfBuffer;
            }
            catch (error) {
                console.error('Failed to retrieve stored PDF, regenerating:', error);
            }
        }
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
        const filename = `sli03-${applicationId}.pdf`;
        const directory = `generated/${applicationId}`;
        try {
            const uploadResult = await this.storageService.upload(pdfBuffer, {
                filename,
                directory,
                contentType: 'application/pdf',
                metadata: {
                    applicationId,
                    userId,
                    documentType: client_1.DocumentType.SLI_03,
                    generated: true,
                },
            });
            if (existingDocument) {
                await this.prisma.document.update({
                    where: { id: existingDocument.id },
                    data: {
                        fileUrl: uploadResult.path,
                        storageType: uploadResult.provider,
                        status: client_1.DocumentStatus.SIGNED,
                        updatedAt: new Date(),
                    },
                });
            }
            else {
                await this.prisma.document.create({
                    data: {
                        applicationId: applicationId,
                        type: client_1.DocumentType.SLI_03,
                        fileUrl: uploadResult.path,
                        storageType: uploadResult.provider,
                        status: client_1.DocumentStatus.SIGNED,
                        version: 1,
                    },
                });
            }
        }
        catch (error) {
            console.error('Failed to store generated PDF:', error);
        }
        return pdfBuffer;
    }
    async generateDLI01PDF(applicationId, userId) {
        var _a, _b;
        const existingDocument = await this.prisma.document.findFirst({
            where: {
                applicationId: applicationId,
                type: client_1.DocumentType.DLI_01,
            },
        });
        if (existingDocument && existingDocument.fileUrl !== 'ONLINE_SUBMISSION') {
            try {
                const pdfBuffer = await this.storageService.download(existingDocument.fileUrl);
                return pdfBuffer;
            }
            catch (error) {
                console.error('Failed to retrieve stored PDF, regenerating:', error);
            }
        }
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
        const filename = `dli01-${applicationId}.pdf`;
        const directory = `generated/${applicationId}`;
        try {
            const uploadResult = await this.storageService.upload(pdfBuffer, {
                filename,
                directory,
                contentType: 'application/pdf',
                metadata: {
                    applicationId,
                    userId,
                    documentType: client_1.DocumentType.DLI_01,
                    generated: true,
                },
            });
            if (existingDocument) {
                await this.prisma.document.update({
                    where: { id: existingDocument.id },
                    data: {
                        fileUrl: uploadResult.path,
                        storageType: uploadResult.provider,
                        status: client_1.DocumentStatus.SIGNED,
                        updatedAt: new Date(),
                    },
                });
            }
            else {
                await this.prisma.document.create({
                    data: {
                        applicationId: applicationId,
                        type: client_1.DocumentType.DLI_01,
                        fileUrl: uploadResult.path,
                        storageType: uploadResult.provider,
                        status: client_1.DocumentStatus.SIGNED,
                        version: 1,
                    },
                });
            }
        }
        catch (error) {
            console.error('Failed to store generated PDF:', error);
        }
        return pdfBuffer;
    }
    async generateBLI04PDF(applicationId, userId) {
        var _a, _b;
        const existingDocument = await this.prisma.document.findFirst({
            where: {
                applicationId: applicationId,
                type: client_1.DocumentType.BLI_04,
            },
        });
        if (existingDocument && existingDocument.fileUrl !== 'ONLINE_SUBMISSION') {
            try {
                const pdfBuffer = await this.storageService.download(existingDocument.fileUrl);
                return pdfBuffer;
            }
            catch (error) {
                console.error('Failed to retrieve stored PDF, regenerating:', error);
            }
        }
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
        const filename = `bli04-${applicationId}.pdf`;
        const directory = `generated/${applicationId}`;
        try {
            const uploadResult = await this.storageService.upload(pdfBuffer, {
                filename,
                directory,
                contentType: 'application/pdf',
                metadata: {
                    applicationId,
                    userId,
                    documentType: client_1.DocumentType.BLI_04,
                    generated: true,
                },
            });
            if (existingDocument) {
                await this.prisma.document.update({
                    where: { id: existingDocument.id },
                    data: {
                        fileUrl: uploadResult.path,
                        storageType: uploadResult.provider,
                        status: client_1.DocumentStatus.SIGNED,
                        updatedAt: new Date(),
                    },
                });
            }
            else {
                await this.prisma.document.create({
                    data: {
                        applicationId: applicationId,
                        type: client_1.DocumentType.BLI_04,
                        fileUrl: uploadResult.path,
                        storageType: uploadResult.provider,
                        status: client_1.DocumentStatus.SIGNED,
                        version: 1,
                    },
                });
            }
        }
        catch (error) {
            console.error('Failed to store generated PDF:', error);
        }
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
    async saveBli04Draft(applicationId, userId, bli04Data) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to save this form');
        }
        if (bli04Data.organisationName || bli04Data.organisationAddress ||
            bli04Data.department || bli04Data.supervisorName ||
            bli04Data.telephoneNo || bli04Data.faxNo || bli04Data.email) {
            await this.prisma.application.update({
                where: { id: applicationId },
                data: {
                    organizationName: bli04Data.organisationName || application.organizationName,
                    organizationAddress: bli04Data.organisationAddress || application.organizationAddress,
                    organizationPhone: bli04Data.telephoneNo || application.organizationPhone,
                    organizationFax: bli04Data.faxNo || application.organizationFax,
                    organizationEmail: bli04Data.email || application.organizationEmail,
                    contactPersonName: bli04Data.supervisorName || application.contactPersonName,
                },
            });
        }
        const existingForm = await this.prisma.formResponse.findFirst({
            where: {
                applicationId: applicationId,
                formTypeEnum: 'BLI_04',
            },
        });
        let formResponse;
        if (existingForm) {
            formResponse = await this.prisma.formResponse.update({
                where: { id: existingForm.id },
                data: {
                    payloadJSON: Object.assign(Object.assign({}, bli04Data), { updatedAt: new Date().toISOString(), isDraft: true }),
                },
            });
        }
        else {
            formResponse = await this.prisma.formResponse.create({
                data: {
                    applicationId: applicationId,
                    formTypeEnum: 'BLI_04',
                    payloadJSON: Object.assign(Object.assign({}, bli04Data), { createdAt: new Date().toISOString(), isDraft: true }),
                },
            });
        }
        return formResponse;
    }
    async generateSupervisorLink(applicationId, userId) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                formResponses: {
                    where: { formTypeEnum: 'BLI_04' },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to generate a supervisor link');
        }
        const bli04Form = application.formResponses.find(f => f.formTypeEnum === 'BLI_04');
        if (!bli04Form) {
            throw new common_1.BadRequestException('BLI-04 form must be saved before generating supervisor link');
        }
        const bli04Data = bli04Form.payloadJSON;
        if (!bli04Data.supervisorName || !bli04Data.email) {
            throw new common_1.BadRequestException('Supervisor name and email are required');
        }
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 14);
        const existingToken = await this.prisma.supervisorToken.findFirst({
            where: {
                applicationId: applicationId,
                formType: 'BLI_04',
                isRevoked: false,
            },
        });
        if (existingToken) {
            await this.prisma.supervisorToken.update({
                where: { id: existingToken.id },
                data: { isRevoked: true },
            });
        }
        const supervisorToken = await this.prisma.supervisorToken.create({
            data: {
                applicationId: applicationId,
                token: token,
                supervisorEmail: bli04Data.email,
                supervisorName: bli04Data.supervisorName,
                expiresAt: expiresAt,
                formType: 'BLI_04',
            },
        });
        return {
            token: supervisorToken.token,
            expiresAt: supervisorToken.expiresAt,
            supervisorEmail: supervisorToken.supervisorEmail,
            supervisorName: supervisorToken.supervisorName,
        };
    }
    async verifySupervisorToken(token) {
        const supervisorToken = await this.prisma.supervisorToken.findUnique({
            where: { token },
        });
        if (!supervisorToken) {
            throw new common_1.NotFoundException('Invalid supervisor link');
        }
        if (supervisorToken.isRevoked) {
            throw new common_1.BadRequestException('This link has been revoked');
        }
        if (supervisorToken.usedAt) {
            throw new common_1.BadRequestException('This link has already been used');
        }
        if (new Date() > supervisorToken.expiresAt) {
            throw new common_1.BadRequestException('This link has expired');
        }
        const application = await this.prisma.application.findUnique({
            where: { id: supervisorToken.applicationId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        matricNo: true,
                        program: true,
                        email: true,
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
                    where: { formTypeEnum: 'BLI_04' },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const bli04Form = application.formResponses[0];
        if (!bli04Form) {
            throw new common_1.NotFoundException('BLI-04 form not found');
        }
        return {
            application: application,
            bli04Data: bli04Form.payloadJSON,
            supervisorName: supervisorToken.supervisorName,
            supervisorEmail: supervisorToken.supervisorEmail,
            tokenId: supervisorToken.id,
        };
    }
    async submitSupervisorSignature(token, signatureData) {
        const supervisorToken = await this.prisma.supervisorToken.findUnique({
            where: { token },
        });
        if (!supervisorToken) {
            throw new common_1.NotFoundException('Invalid supervisor link');
        }
        if (supervisorToken.isRevoked) {
            throw new common_1.BadRequestException('This link has been revoked');
        }
        if (supervisorToken.usedAt) {
            throw new common_1.BadRequestException('This link has already been used');
        }
        if (new Date() > supervisorToken.expiresAt) {
            throw new common_1.BadRequestException('This link has expired');
        }
        const bli04Form = await this.prisma.formResponse.findFirst({
            where: {
                applicationId: supervisorToken.applicationId,
                formTypeEnum: 'BLI_04',
            },
        });
        if (!bli04Form) {
            throw new common_1.NotFoundException('BLI-04 form not found');
        }
        let supervisorSignature = signatureData.signature;
        if (signatureData.signatureType === 'image') {
            if (!supervisorSignature) {
                const application = await this.prisma.application.findUnique({
                    where: { id: supervisorToken.applicationId },
                });
                if (application && application.supervisorSignature && application.supervisorSignatureType === 'image') {
                    supervisorSignature = application.supervisorSignature;
                }
                else {
                    throw new common_1.BadRequestException('Please upload your signature image before submitting the form');
                }
            }
        }
        else {
            if (!supervisorSignature) {
                throw new common_1.BadRequestException('Supervisor signature is required');
            }
        }
        const updatedForm = await this.prisma.formResponse.update({
            where: { id: bli04Form.id },
            data: {
                supervisorSignature: supervisorSignature,
                supervisorSignatureType: signatureData.signatureType,
                supervisorSignedAt: new Date(),
                supervisorName: supervisorToken.supervisorName,
                payloadJSON: Object.assign(Object.assign({}, bli04Form.payloadJSON), { reportingDate: signatureData.reportingDate, supervisorRemarks: signatureData.remarks, isDraft: false, supervisorConfirmedAt: new Date().toISOString() }),
            },
        });
        await this.prisma.supervisorToken.update({
            where: { id: supervisorToken.id },
            data: { usedAt: new Date() },
        });
        const existingDocument = await this.prisma.document.findFirst({
            where: {
                applicationId: supervisorToken.applicationId,
                type: 'BLI_04',
            },
        });
        if (existingDocument) {
            await this.prisma.document.update({
                where: { id: existingDocument.id },
                data: {
                    status: client_1.DocumentStatus.SIGNED,
                    signedBy: supervisorToken.supervisorName,
                    signedAt: new Date(),
                },
            });
        }
        else {
            await this.prisma.document.create({
                data: {
                    applicationId: supervisorToken.applicationId,
                    type: client_1.DocumentType.BLI_04,
                    fileUrl: 'ONLINE_SUBMISSION',
                    status: client_1.DocumentStatus.SIGNED,
                    signedBy: supervisorToken.supervisorName,
                    signedAt: new Date(),
                },
            });
        }
        return {
            success: true,
            formResponse: updatedForm,
        };
    }
    async getBli04Submissions(coordinatorId, filters) {
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
                    formTypeEnum: 'BLI_04',
                    supervisorSignedAt: {
                        not: null,
                    },
                },
            },
        };
        if (filters === null || filters === void 0 ? void 0 : filters.sessionId) {
            where.sessionId = filters.sessionId;
        }
        if (filters === null || filters === void 0 ? void 0 : filters.program) {
            where.user = {
                program: filters.program,
            };
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
                    where: { formTypeEnum: 'BLI_04' },
                },
                documents: {
                    where: { type: 'BLI_04' },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        return applications;
    }
    async verifyBli04Submission(applicationId, coordinatorId, decision, comments) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                session: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        matricNo: true,
                        program: true,
                    },
                },
                formResponses: {
                    where: {
                        OR: [
                            { formTypeEnum: 'BLI_03' },
                            { formTypeEnum: 'BLI_04' },
                        ],
                    },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.session.coordinatorId !== coordinatorId) {
            throw new common_1.ForbiddenException('You do not have permission to verify this submission');
        }
        const bli04Form = application.formResponses.find(f => f.formTypeEnum === 'BLI_04');
        if (!bli04Form || !bli04Form.supervisorSignedAt) {
            throw new common_1.BadRequestException('BLI-04 form has not been signed by supervisor');
        }
        if (decision === client_1.Decision.REQUEST_CHANGES) {
            await this.prisma.formResponse.update({
                where: { id: bli04Form.id },
                data: {
                    verifiedBy: null,
                    supervisorSignature: null,
                    supervisorSignatureType: null,
                    supervisorSignedAt: null,
                    supervisorName: null,
                },
            });
            const existingBli04Document = await this.prisma.document.findFirst({
                where: {
                    applicationId: applicationId,
                    type: client_1.DocumentType.BLI_04,
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            });
            if (existingBli04Document) {
                await this.prisma.document.update({
                    where: { id: existingBli04Document.id },
                    data: {
                        status: client_1.DocumentStatus.PENDING_SIGNATURE,
                        signedBy: null,
                        signedAt: null,
                        updatedAt: new Date(),
                    },
                });
            }
        }
        else {
            await this.prisma.formResponse.update({
                where: { id: bli04Form.id },
                data: {
                    verifiedBy: coordinatorId,
                },
            });
            const existingBli04Document = await this.prisma.document.findFirst({
                where: {
                    applicationId: applicationId,
                    type: client_1.DocumentType.BLI_04,
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            });
            if (existingBli04Document) {
                await this.prisma.document.update({
                    where: { id: existingBli04Document.id },
                    data: {
                        status: client_1.DocumentStatus.SIGNED,
                        updatedAt: new Date(),
                    },
                });
            }
        }
        const review = await this.prisma.review.create({
            data: {
                applicationId: applicationId,
                reviewerId: coordinatorId,
                decision: decision,
                comments: comments,
            },
        });
        if (decision === client_1.Decision.APPROVE) {
            await this.prisma.application.update({
                where: { id: applicationId },
                data: {
                    status: client_1.ApplicationStatus.APPROVED,
                },
            });
            try {
                await this.generateBLI04PDF(applicationId, application.userId);
            }
            catch (error) {
                console.error('Failed to generate BLI04 PDF after approval:', error);
            }
        }
        return review;
    }
    async submitBli03WithSignature(applicationId, userId, dto) {
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
        let studentSignature = dto.studentSignature;
        if (dto.studentSignatureType === 'image') {
            if (!studentSignature && application.studentSignature && application.studentSignatureType === 'image') {
                studentSignature = application.studentSignature;
            }
            else if (!studentSignature) {
                throw new common_1.BadRequestException('Please upload your signature image before submitting the form');
            }
        }
        else {
            if (!studentSignature) {
                throw new common_1.BadRequestException('Student signature is required');
            }
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
        await this.prisma.application.update({
            where: { id: applicationId },
            data: {
                companyId: company.id,
                studentPhone: dto.studentPhone,
                studentEmail: dto.studentEmail,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                organizationName: dto.organizationName,
                organizationAddress: dto.organizationAddress,
                organizationPhone: dto.organizationPhone,
                organizationFax: dto.organizationFax,
                organizationEmail: dto.organizationEmail,
                contactPersonName: dto.contactPersonName,
                contactPersonPhone: dto.contactPersonPhone,
                organizationDeclarationAccepted: dto.organizationDeclaration,
                reportingPeriod: dto.reportingPeriod,
                studentSignature: studentSignature,
                studentSignatureType: dto.studentSignatureType,
                studentSignedAt: new Date(),
            },
        });
        const existingBli03Form = await this.prisma.formResponse.findFirst({
            where: {
                applicationId: applicationId,
                formTypeEnum: 'BLI_03',
            },
        });
        if (existingBli03Form) {
            await this.prisma.formResponse.update({
                where: { id: existingBli03Form.id },
                data: {
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
                    },
                    studentSignature: studentSignature,
                    studentSignatureType: dto.studentSignatureType,
                    studentSignedAt: new Date(),
                    coordinatorSignature: null,
                    coordinatorSignatureType: null,
                    coordinatorSignedAt: null,
                    verifiedBy: null,
                },
            });
        }
        else {
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
                    },
                    studentSignature: studentSignature,
                    studentSignatureType: dto.studentSignatureType,
                    studentSignedAt: new Date(),
                },
            });
        }
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
                    status: client_1.DocumentStatus.PENDING_SIGNATURE,
                    version: existingBli03Document.version + 1,
                },
            });
        }
        else {
            await this.prisma.document.create({
                data: {
                    applicationId: applicationId,
                    type: client_1.DocumentType.BLI_03,
                    fileUrl: `/api/applications/${applicationId}/bli03/pdf`,
                    status: client_1.DocumentStatus.PENDING_SIGNATURE,
                    version: 1,
                },
            });
        }
        return { message: 'BLI-03 form submitted successfully with student signature' };
    }
    async approveBli03Submission(applicationId, coordinatorId, dto) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                formResponses: {
                    where: { formTypeEnum: 'BLI_03' },
                },
                session: {
                    select: {
                        coordinatorId: true,
                    },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.session.coordinatorId !== coordinatorId) {
            throw new common_1.ForbiddenException('You can only approve submissions from your own students');
        }
        const bli03Form = application.formResponses.find(f => f.formTypeEnum === 'BLI_03');
        if (!bli03Form) {
            throw new common_1.NotFoundException('BLI-03 form not found');
        }
        if (!bli03Form.studentSignedAt) {
            throw new common_1.BadRequestException('Student has not signed the form yet');
        }
        if (dto.decision === 'APPROVE') {
            console.log('🟢 START BLI-03 APPROVAL PROCESS');
            console.log('Application ID:', applicationId);
            console.log('Coordinator ID:', coordinatorId);
            await this.prisma.formResponse.update({
                where: { id: bli03Form.id },
                data: {
                    coordinatorSignature: dto.coordinatorSignature || null,
                    coordinatorSignatureType: dto.coordinatorSignatureType || null,
                    coordinatorSignedAt: new Date(),
                    verifiedBy: coordinatorId,
                },
            });
            console.log('✅ Updated form response with coordinatorSignedAt');
            await this.prisma.application.update({
                where: { id: applicationId },
                data: {
                    status: client_1.ApplicationStatus.APPROVED,
                },
            });
            console.log('✅ Updated application status to APPROVED');
            await this.prisma.review.create({
                data: {
                    applicationId: applicationId,
                    reviewerId: coordinatorId,
                    decision: client_1.Decision.APPROVE,
                    comments: dto.comments,
                },
            });
            console.log('✅ Created approval review');
            await this.prisma.document.updateMany({
                where: {
                    applicationId: applicationId,
                    type: client_1.DocumentType.BLI_03,
                },
                data: {
                    status: client_1.DocumentStatus.SIGNED,
                },
            });
            console.log('✅ Updated BLI-03 document status to SIGNED');
            try {
                await this.generateBLI03PDF(applicationId, application.userId);
                console.log('✅ Generated BLI-03 PDF');
            }
            catch (error) {
                console.error('❌ Failed to generate BLI03 PDF after approval:', error);
            }
            try {
                console.log('🔓 Calling unlockDocumentsAfterApproval...');
                await this.unlockDocumentsAfterApproval(applicationId, client_1.DocumentType.BLI_03);
                console.log('✅ Finished unlockDocumentsAfterApproval');
            }
            catch (error) {
                console.error('❌ Failed to unlock documents after BLI-03 approval:', error);
            }
            console.log('🟢 COMPLETED BLI-03 APPROVAL PROCESS');
            return { message: 'BLI-03 form approved and signed by coordinator' };
        }
        else {
            await this.prisma.formResponse.update({
                where: { id: bli03Form.id },
                data: {
                    coordinatorSignature: null,
                    coordinatorSignatureType: null,
                    coordinatorSignedAt: null,
                    verifiedBy: null,
                    studentSignature: null,
                    studentSignatureType: null,
                    studentSignedAt: null,
                },
            });
            await this.prisma.review.create({
                data: {
                    applicationId: applicationId,
                    reviewerId: coordinatorId,
                    decision: client_1.Decision.REQUEST_CHANGES,
                    comments: dto.comments,
                },
            });
            await this.prisma.document.updateMany({
                where: {
                    applicationId: applicationId,
                    type: client_1.DocumentType.BLI_03,
                },
                data: {
                    status: client_1.DocumentStatus.DRAFT,
                },
            });
            return { message: 'Changes requested for BLI-03 form' };
        }
    }
    async unlockDocumentsAfterApproval(applicationId, approvedDocumentType) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                documents: true,
                formResponses: {
                    where: { formTypeEnum: 'BLI_03' },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const documentsToCreate = [];
        const bli03Form = application.formResponses.find(f => f.formTypeEnum === 'BLI_03');
        const bli03Approved = (bli03Form === null || bli03Form === void 0 ? void 0 : bli03Form.coordinatorSignedAt) != null;
        if (bli03Approved) {
            const bli03Exists = application.documents.some(d => d.type === client_1.DocumentType.BLI_03);
            if (!bli03Exists) {
                documentsToCreate.push({
                    type: client_1.DocumentType.BLI_03,
                    fileUrl: `/applications/${applicationId}/bli03/pdf`,
                });
            }
            const sli03Exists = application.documents.some(d => d.type === client_1.DocumentType.SLI_03);
            if (!sli03Exists) {
                documentsToCreate.push({
                    type: client_1.DocumentType.SLI_03,
                    fileUrl: `/applications/${applicationId}/sli03/pdf`,
                });
            }
            const dli01Exists = application.documents.some(d => d.type === client_1.DocumentType.DLI_01);
            if (!dli01Exists) {
                documentsToCreate.push({
                    type: client_1.DocumentType.DLI_01,
                    fileUrl: `/applications/${applicationId}/dli01/pdf`,
                });
            }
        }
        if (documentsToCreate.length > 0) {
            await this.prisma.document.createMany({
                data: documentsToCreate.map(doc => ({
                    applicationId,
                    type: doc.type,
                    fileUrl: doc.fileUrl,
                    status: client_1.DocumentStatus.SIGNED,
                    version: 1,
                })),
            });
            console.log(`✅ Created ${documentsToCreate.length} unlocked document(s) for application ${applicationId}: ${documentsToCreate.map(d => d.type).join(', ')}`);
            const sli03Created = documentsToCreate.some(d => d.type === client_1.DocumentType.SLI_03);
            if (sli03Created) {
                const downloadLink = `${process.env.BASE_URL || 'http://localhost:3000'}/applications/${applicationId}/sli03/pdf`;
                await this.notificationsService.notifySLI03Ready(applicationId, downloadLink);
            }
        }
    }
    async getDocumentUnlockStatus(applicationId, userId) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                user: true,
                session: true,
                documents: true,
                formResponses: {
                    where: {
                        OR: [
                            { formTypeEnum: 'BLI_03' },
                            { formTypeEnum: 'BLI_04' },
                        ],
                    },
                },
            },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (userId && application.userId !== userId) {
            throw new common_1.ForbiddenException('You can only access your own applications');
        }
        const unlockStatus = {
            bli01: true,
            bli02: false,
            bli03: false,
            sli03: false,
            dli01: false,
            bli04: false,
        };
        const bli01Approved = application.status === client_1.ApplicationStatus.APPROVED;
        const bli02Doc = application.documents.find(d => d.type === client_1.DocumentType.BLI_02);
        if (bli02Doc && bli02Doc.status === client_1.DocumentStatus.SIGNED) {
            unlockStatus.bli02 = true;
        }
        if (bli01Approved) {
            unlockStatus.bli03 = true;
        }
        const bli03Form = application.formResponses.find(f => f.formTypeEnum === 'BLI_03');
        const bli03Approved = (bli03Form === null || bli03Form === void 0 ? void 0 : bli03Form.coordinatorSignedAt) != null;
        console.log('🔍 DEBUG - Unlock Status Check:');
        console.log('Application ID:', applicationId);
        console.log('Application Status:', application.status);
        console.log('BLI-01 Approved:', bli01Approved);
        console.log('BLI-03 Form:', bli03Form ? 'EXISTS' : 'NOT FOUND');
        console.log('Coordinator Signed At:', bli03Form === null || bli03Form === void 0 ? void 0 : bli03Form.coordinatorSignedAt);
        console.log('BLI-03 Approved:', bli03Approved);
        console.log('Documents in DB:', application.documents.map(d => ({ type: d.type, status: d.status })));
        if (bli03Approved) {
            unlockStatus.sli03 = true;
            unlockStatus.dli01 = true;
            console.log('✅ SLI-03 and DLI-01 UNLOCKED');
        }
        else {
            console.log('❌ SLI-03 and DLI-01 LOCKED - BLI-03 not approved yet');
        }
        const bli04Form = application.formResponses.find(f => f.formTypeEnum === 'BLI_04');
        const bli04Verified = (bli04Form === null || bli04Form === void 0 ? void 0 : bli04Form.verifiedBy) != null;
        const bli04DocSigned = application.documents.some((d) => d.type === client_1.DocumentType.BLI_04 && d.status === client_1.DocumentStatus.SIGNED);
        const bli04Unlocked = bli04Verified || bli04DocSigned;
        if (bli04Unlocked) {
            unlockStatus.bli04 = true;
            console.log('✅ BLI-04 UNLOCKED');
        }
        else {
            console.log('❌ BLI-04 LOCKED - Not verified by coordinator yet');
        }
        console.log('Final Unlock Status:', unlockStatus);
        return {
            unlockStatus,
            applicationStatus: application.status,
            bli03Approved,
            bli04Verified,
        };
    }
    async uploadStudentSignature(applicationId, userId, file) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.userId !== userId) {
            throw new common_1.ForbiddenException('You can only upload signatures for your own applications');
        }
        const fs = require('fs');
        const imageBuffer = fs.readFileSync(file.path);
        const base64Signature = imageBuffer.toString('base64');
        const updatedApplication = await this.prisma.application.update({
            where: { id: applicationId },
            data: {
                studentSignature: base64Signature,
                studentSignatureType: 'image',
                studentSignedAt: new Date(),
            },
        });
        fs.unlinkSync(file.path);
        return {
            signatureUploaded: true,
            signedAt: updatedApplication.studentSignedAt,
        };
    }
    async uploadSupervisorSignature(applicationId, file, token) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (token) {
            const supervisorToken = await this.prisma.supervisorToken.findUnique({
                where: { token },
            });
            if (!supervisorToken || supervisorToken.applicationId !== applicationId) {
                throw new common_1.ForbiddenException('Invalid supervisor token');
            }
            if (supervisorToken.isRevoked) {
                throw new common_1.BadRequestException('This token has been revoked');
            }
            if (new Date() > supervisorToken.expiresAt) {
                throw new common_1.BadRequestException('This token has expired');
            }
        }
        const fs = require('fs');
        const imageBuffer = fs.readFileSync(file.path);
        const base64Signature = imageBuffer.toString('base64');
        const updatedApplication = await this.prisma.application.update({
            where: { id: applicationId },
            data: {
                supervisorSignature: base64Signature,
                supervisorSignatureType: 'image',
                supervisorSignedAt: new Date(),
            },
        });
        fs.unlinkSync(file.path);
        return {
            signatureUploaded: true,
            signedAt: updatedApplication.supervisorSignedAt,
        };
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        notifications_service_1.NotificationsService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map