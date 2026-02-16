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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const applications_service_1 = require("./applications.service");
const create_application_dto_1 = require("./dto/create-application.dto");
const upload_document_dto_1 = require("./dto/upload-document.dto");
const review_document_dto_1 = require("./dto/review-document.dto");
const update_bli03_dto_1 = require("./dto/update-bli03.dto");
const submit_bli03_dto_1 = require("./dto/submit-bli03.dto");
const approve_bli03_dto_1 = require("./dto/approve-bli03.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const client_1 = require("@prisma/client");
let ApplicationsController = class ApplicationsController {
    constructor(applicationsService) {
        this.applicationsService = applicationsService;
    }
    async createApplication(user, createApplicationDto) {
        const application = await this.applicationsService.createApplication(user.userId, createApplicationDto);
        return {
            message: 'Application created successfully',
            application,
        };
    }
    async getMyApplications(user) {
        const applications = await this.applicationsService.getApplicationsByUser(user.userId);
        return { applications };
    }
    async getActiveSessions() {
        const sessions = await this.applicationsService.getActiveSessions();
        return { sessions };
    }
    async getProfile(user) {
        const profile = await this.applicationsService.getUserProfile(user.userId);
        return { profile };
    }
    async getApplicationById(user, id) {
        const application = await this.applicationsService.getApplicationById(id, user.userId);
        return { application };
    }
    async generateBLI01PDF(user, id, res) {
        const pdfBuffer = await this.applicationsService.generateBLI01PDF(id, user.userId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="BLI-01-${id}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        return new common_1.StreamableFile(pdfBuffer);
    }
    async generateBLI03PDF(user, id, res) {
        const pdfBuffer = await this.applicationsService.generateBLI03PDF(id, user.userId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="BLI-03-${id}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        return new common_1.StreamableFile(pdfBuffer);
    }
    async generateSLI03PDF(user, id, res) {
        const pdfBuffer = await this.applicationsService.generateSLI03PDF(id, user.userId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="SLI-03-${id}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        return new common_1.StreamableFile(pdfBuffer);
    }
    async generateDLI01PDF(user, id, res) {
        const pdfBuffer = await this.applicationsService.generateDLI01PDF(id, user.userId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="DLI-01-${id}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        return new common_1.StreamableFile(pdfBuffer);
    }
    async generateBLI04PDF(user, id, res) {
        const userId = user.role === 'STUDENT' ? user.userId : undefined;
        const pdfBuffer = await this.applicationsService.generateBLI04PDF(id, userId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="BLI-04-${id}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        return new common_1.StreamableFile(pdfBuffer);
    }
    async uploadDocument(user, applicationId, file, uploadDocumentDto) {
        const document = await this.applicationsService.uploadDocument(applicationId, user.userId, file, uploadDocumentDto.documentType);
        return {
            message: 'Document uploaded successfully',
            document,
        };
    }
    async getPendingDocuments(user, sessionId, status, program) {
        const documents = await this.applicationsService.getPendingDocuments(user.userId, {
            sessionId,
            status,
            program,
        });
        return { documents };
    }
    async getDocument(user, documentId) {
        const coordinatorId = user.role === client_1.UserRole.COORDINATOR ? user.userId : undefined;
        const document = await this.applicationsService.getDocumentById(documentId, coordinatorId);
        return { document };
    }
    async downloadUploadedDocument(user, documentId, res) {
        const fileBuffer = await this.applicationsService.downloadUploadedDocument(documentId, user.userId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="document-${documentId}.pdf"`,
            'Content-Length': fileBuffer.length,
        });
        return new common_1.StreamableFile(fileBuffer);
    }
    async downloadAllStudentDocuments(user, userId, res) {
        const { stream, studentName, matricNo } = await this.applicationsService.downloadAllStudentDocumentsAsZip(userId, user.userId);
        const sanitizedName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${sanitizedName}_${matricNo}_Documents.zip`;
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${filename}"`,
        });
        stream.pipe(res);
    }
    async reviewDocument(user, documentId, reviewDto) {
        const review = await this.applicationsService.reviewDocument(documentId, user.userId, reviewDto);
        return {
            message: 'Document reviewed successfully',
            review,
        };
    }
    async updateBli03Data(user, applicationId, updateBli03Dto) {
        const application = await this.applicationsService.updateBli03Data(applicationId, user.userId, updateBli03Dto);
        return {
            message: 'BLI-03 data updated successfully',
            application,
        };
    }
    async getBli03Submissions(user, sessionId, program) {
        const submissions = await this.applicationsService.getBli03Submissions(user.userId, { sessionId, program });
        return { submissions };
    }
    async getBli03SubmissionById(user, applicationId) {
        const submission = await this.applicationsService.getBli03SubmissionById(applicationId, user.userId);
        return { submission };
    }
    async submitBli04(user, applicationId, bli04Data) {
        const result = await this.applicationsService.submitBli04(applicationId, user.userId, bli04Data);
        return Object.assign({ message: 'BLI-04 form submitted successfully' }, result);
    }
    async generateSLI04PDF(user, id, sli04Data, res) {
        const pdfBuffer = await this.applicationsService.generateSLI04PDF(id, user.userId, sli04Data);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="SLI-04-${id}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        return new common_1.StreamableFile(pdfBuffer);
    }
    async getStudentDocuments(user, applicationId) {
        const documents = await this.applicationsService.getStudentDocuments(applicationId, user.userId);
        return { documents };
    }
    async downloadStudentDocument(user, applicationId, documentId, res) {
        const fileBuffer = await this.applicationsService.downloadStudentDocument(applicationId, documentId, user.userId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="document-${documentId}.pdf"`,
            'Content-Length': fileBuffer.length,
        });
        return new common_1.StreamableFile(fileBuffer);
    }
    async saveBli04Draft(user, applicationId, bli04Data) {
        const formResponse = await this.applicationsService.saveBli04Draft(applicationId, user.userId, bli04Data);
        return {
            message: 'BLI-04 draft saved successfully',
            formResponse,
        };
    }
    async generateSupervisorLink(user, applicationId) {
        const linkData = await this.applicationsService.generateSupervisorLink(applicationId, user.userId);
        return Object.assign({ message: 'Supervisor link generated successfully' }, linkData);
    }
    async getBli04Submissions(user, sessionId, program) {
        const submissions = await this.applicationsService.getBli04Submissions(user.userId, { sessionId, program });
        return { submissions };
    }
    async verifyBli04Submission(user, applicationId, verifyDto) {
        const review = await this.applicationsService.verifyBli04Submission(applicationId, user.userId, verifyDto.decision, verifyDto.comments);
        return {
            message: 'BLI-04 submission verified successfully',
            review,
        };
    }
    async submitBli03WithSignature(user, applicationId, submitBli03Dto) {
        const result = await this.applicationsService.submitBli03WithSignature(applicationId, user.userId, submitBli03Dto);
        return result;
    }
    async approveBli03Submission(user, applicationId, approveBli03Dto) {
        const result = await this.applicationsService.approveBli03Submission(applicationId, user.userId, approveBli03Dto);
        return result;
    }
    async getDocumentUnlockStatus(user, applicationId) {
        const unlockData = await this.applicationsService.getDocumentUnlockStatus(applicationId, user.userId);
        return unlockData;
    }
    async uploadStudentSignature(user, applicationId, file) {
        const result = await this.applicationsService.uploadStudentSignature(applicationId, user.userId, file);
        return Object.assign({ message: 'Signature uploaded successfully' }, result);
    }
    async uploadSupervisorSignature(applicationId, file, token) {
        const result = await this.applicationsService.uploadSupervisorSignature(applicationId, file, token);
        return Object.assign({ message: 'Supervisor signature uploaded successfully' }, result);
    }
};
exports.ApplicationsController = ApplicationsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_application_dto_1.CreateApplicationDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "createApplication", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getMyApplications", null);
__decorate([
    (0, common_1.Get)('sessions/active'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getActiveSessions", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getApplicationById", null);
__decorate([
    (0, common_1.Get)(':id/bli-01/pdf'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT, client_1.UserRole.COORDINATOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "generateBLI01PDF", null);
__decorate([
    (0, common_1.Get)(':id/bli-03/pdf'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT, client_1.UserRole.COORDINATOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "generateBLI03PDF", null);
__decorate([
    (0, common_1.Get)(':id/sli-03/pdf'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT, client_1.UserRole.COORDINATOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "generateSLI03PDF", null);
__decorate([
    (0, common_1.Get)(':id/dli-01/pdf'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT, client_1.UserRole.COORDINATOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "generateDLI01PDF", null);
__decorate([
    (0, common_1.Get)(':id/bli-04/pdf'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT, client_1.UserRole.COORDINATOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "generateBLI04PDF", null);
__decorate([
    (0, common_1.Post)(':id/documents/upload'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/documents',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(pdf|jpg|jpeg|png)$/i)) {
                return cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, upload_document_dto_1.UploadDocumentDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)('documents/pending-review'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('sessionId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('program')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getPendingDocuments", null);
__decorate([
    (0, common_1.Get)('documents/:documentId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('documentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getDocument", null);
__decorate([
    (0, common_1.Get)('documents/:documentId/download'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('documentId')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "downloadUploadedDocument", null);
__decorate([
    (0, common_1.Get)('students/:userId/documents/download-all'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "downloadAllStudentDocuments", null);
__decorate([
    (0, common_1.Patch)('documents/:documentId/review'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('documentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, review_document_dto_1.ReviewDocumentDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "reviewDocument", null);
__decorate([
    (0, common_1.Patch)(':id/bli03'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_bli03_dto_1.UpdateBli03Dto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "updateBli03Data", null);
__decorate([
    (0, common_1.Get)('bli03/submissions'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('sessionId')),
    __param(2, (0, common_1.Query)('program')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getBli03Submissions", null);
__decorate([
    (0, common_1.Get)('bli03/submissions/:id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getBli03SubmissionById", null);
__decorate([
    (0, common_1.Post)(':id/bli04'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "submitBli04", null);
__decorate([
    (0, common_1.Post)(':id/sli04/pdf'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "generateSLI04PDF", null);
__decorate([
    (0, common_1.Get)(':id/documents'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getStudentDocuments", null);
__decorate([
    (0, common_1.Get)(':id/documents/:documentId/download'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('documentId')),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "downloadStudentDocument", null);
__decorate([
    (0, common_1.Post)(':id/bli04/save'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "saveBli04Draft", null);
__decorate([
    (0, common_1.Post)(':id/bli04/generate-link'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "generateSupervisorLink", null);
__decorate([
    (0, common_1.Get)('bli04/submissions'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('sessionId')),
    __param(2, (0, common_1.Query)('program')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getBli04Submissions", null);
__decorate([
    (0, common_1.Post)('bli04/submissions/:id/verify'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "verifyBli04Submission", null);
__decorate([
    (0, common_1.Post)(':id/bli03/submit'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, submit_bli03_dto_1.SubmitBli03Dto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "submitBli03WithSignature", null);
__decorate([
    (0, common_1.Post)('bli03/submissions/:id/approve'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, approve_bli03_dto_1.ApproveBli03Dto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "approveBli03Submission", null);
__decorate([
    (0, common_1.Get)(':id/unlock-status'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getDocumentUnlockStatus", null);
__decorate([
    (0, common_1.Post)(':id/upload-signature'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('signature', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/signatures',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `signature-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(png|jpg|jpeg)$/i)) {
                return cb(new Error('Only PNG and JPG image files are allowed for signatures'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 2 * 1024 * 1024,
        },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "uploadStudentSignature", null);
__decorate([
    (0, common_1.Post)(':id/upload-supervisor-signature'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('signature', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/signatures',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `supervisor-signature-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(png|jpg|jpeg)$/i)) {
                return cb(new Error('Only PNG and JPG image files are allowed for signatures'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 2 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "uploadSupervisorSignature", null);
exports.ApplicationsController = ApplicationsController = __decorate([
    (0, common_1.Controller)('applications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService])
], ApplicationsController);
//# sourceMappingURL=applications.controller.js.map