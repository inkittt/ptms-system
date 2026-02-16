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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("./email.service");
const client_1 = require("@prisma/client");
const notification_templates_1 = require("./templates/notification-templates");
const config_1 = require("@nestjs/config");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma, emailService, configService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
        this.baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3000';
    }
    async sendNotification(userId, type, payload, channel = client_1.Channel.EMAIL, language = 'en') {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, name: true, role: true },
            });
            if (!user) {
                this.logger.error(`User not found: ${userId}`);
                return;
            }
            const isCoordinator = user.role === 'COORDINATOR';
            const shouldBatch = isCoordinator && this.shouldBatchNotificationType(type);
            const notification = await this.prisma.notification.create({
                data: {
                    userId,
                    type,
                    channel,
                    payloadJSON: payload,
                    status: client_1.NotificationStatus.PENDING,
                    emailQueued: shouldBatch,
                },
            });
            if (channel === client_1.Channel.EMAIL && !shouldBatch) {
                const success = await this.sendEmailNotification(user.email, user.name, type, payload, language);
                await this.prisma.notification.update({
                    where: { id: notification.id },
                    data: {
                        status: success ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.FAILED,
                        sentAt: success ? new Date() : null,
                        emailQueued: false,
                    },
                });
                this.logger.log(`Notification sent immediately: ${type} to ${user.email}`);
            }
            else if (shouldBatch) {
                this.logger.log(`Notification queued for batching: ${type} to ${user.email}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to send notification: ${error.message}`, error.stack);
        }
    }
    shouldBatchNotificationType(type) {
        const batchableTypes = [
            'NEW_SUBMISSION',
            'COORDINATOR_ESCALATION',
        ];
        return batchableTypes.includes(type);
    }
    async sendEmailNotification(email, name, type, payload, language) {
        const template = notification_templates_1.NotificationTemplates[type];
        if (!template) {
            this.logger.error(`Template not found for type: ${type}`);
            return false;
        }
        const variables = Object.assign(Object.assign({ name }, payload), { dashboardLink: `${this.baseUrl}/dashboard`, applicationLink: payload.applicationId
                ? `${this.baseUrl}/applications/${payload.applicationId}`
                : `${this.baseUrl}/dashboard`, submissionLink: payload.applicationId
                ? `${this.baseUrl}/applications/${payload.applicationId}/submit`
                : `${this.baseUrl}/dashboard`, reviewLink: payload.applicationId
                ? `${this.baseUrl}/coordinator/applications/${payload.applicationId}`
                : `${this.baseUrl}/coordinator/dashboard` });
        const { subject, body } = (0, notification_templates_1.renderTemplate)(template, language, variables);
        return await this.emailService.sendEmail(email, subject, body);
    }
    async notifySubmissionReceived(applicationId, language = 'en') {
        var _a, _b, _c, _d, _e;
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                user: true,
                session: {
                    include: {
                        coordinator: true,
                    },
                },
            },
        });
        if (!application)
            return;
        await this.sendNotification(application.userId, 'SUBMISSION_RECEIVED', {
            type: 'SUBMISSION_RECEIVED',
            applicationId: application.id,
            organizationName: application.organizationName || 'N/A',
            startDate: ((_a = application.startDate) === null || _a === void 0 ? void 0 : _a.toLocaleDateString()) || 'TBD',
            endDate: ((_b = application.endDate) === null || _b === void 0 ? void 0 : _b.toLocaleDateString()) || 'TBD',
        }, client_1.Channel.EMAIL, language);
        if ((_c = application.session) === null || _c === void 0 ? void 0 : _c.coordinator) {
            await this.sendNotification(application.session.coordinator.id, 'NEW_SUBMISSION', {
                type: 'NEW_SUBMISSION',
                applicationId: application.id,
                studentName: application.user.name,
                matricNo: application.user.matricNo || 'N/A',
                organizationName: application.organizationName || 'N/A',
                startDate: ((_d = application.startDate) === null || _d === void 0 ? void 0 : _d.toLocaleDateString()) || 'TBD',
                endDate: ((_e = application.endDate) === null || _e === void 0 ? void 0 : _e.toLocaleDateString()) || 'TBD',
                submittedAt: new Date().toLocaleString(),
            }, client_1.Channel.EMAIL, language);
        }
    }
    async notifyChangesRequested(applicationId, comments, language = 'en') {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { user: true },
        });
        if (!application)
            return;
        await this.sendNotification(application.userId, 'CHANGES_REQUESTED', {
            type: 'CHANGES_REQUESTED',
            applicationId: application.id,
            comments,
        }, client_1.Channel.EMAIL, language);
    }
    async notifyApplicationApproved(applicationId, language = 'en') {
        var _a, _b;
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { user: true },
        });
        if (!application)
            return;
        await this.sendNotification(application.userId, 'APPLICATION_APPROVED', {
            type: 'APPLICATION_APPROVED',
            applicationId: application.id,
            organizationName: application.organizationName || 'N/A',
            startDate: ((_a = application.startDate) === null || _a === void 0 ? void 0 : _a.toLocaleDateString()) || 'TBD',
            endDate: ((_b = application.endDate) === null || _b === void 0 ? void 0 : _b.toLocaleDateString()) || 'TBD',
        }, client_1.Channel.EMAIL, language);
    }
    async notifySLI03Ready(applicationId, downloadLink, language = 'en') {
        var _a, _b;
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { user: true },
        });
        if (!application)
            return;
        await this.sendNotification(application.userId, 'SLI03_READY', {
            type: 'SLI03_READY',
            applicationId: application.id,
            link: downloadLink,
            startDate: ((_a = application.startDate) === null || _a === void 0 ? void 0 : _a.toLocaleDateString()) || 'TBD',
            endDate: ((_b = application.endDate) === null || _b === void 0 ? void 0 : _b.toLocaleDateString()) || 'TBD',
        }, client_1.Channel.EMAIL, language);
    }
    async notifyBLI04DueReminder(applicationId, dueDate, daysLeft, language = 'en') {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { user: true },
        });
        if (!application)
            return;
        await this.sendNotification(application.userId, 'BLI04_DUE_REMINDER', {
            type: 'BLI04_DUE_REMINDER',
            applicationId: application.id,
            dueDate: dueDate.toLocaleDateString(),
            daysLeft: daysLeft.toString(),
        }, client_1.Channel.EMAIL, language);
    }
    async notifyOverdueSubmission(applicationId, documentType, dueDate, daysOverdue, language = 'en') {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { user: true },
        });
        if (!application)
            return;
        await this.sendNotification(application.userId, 'OVERDUE_REMINDER', {
            type: 'OVERDUE_REMINDER',
            applicationId: application.id,
            documentType,
            dueDate: dueDate.toLocaleDateString(),
            daysOverdue: daysOverdue.toString(),
        }, client_1.Channel.EMAIL, language);
    }
    async notifyCoordinatorEscalation(applicationId, thresholdDays, language = 'en') {
        var _a;
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                user: true,
                session: {
                    include: {
                        coordinator: true,
                    },
                },
            },
        });
        if (!application || !((_a = application.session) === null || _a === void 0 ? void 0 : _a.coordinator))
            return;
        const daysPending = Math.floor((new Date().getTime() - application.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
        await this.sendNotification(application.session.coordinator.id, 'COORDINATOR_ESCALATION', {
            type: 'COORDINATOR_ESCALATION',
            applicationId: application.id,
            studentName: application.user.name,
            matricNo: application.user.matricNo || 'N/A',
            status: application.status,
            pendingSince: application.updatedAt.toLocaleDateString(),
            daysPending: daysPending.toString(),
            thresholdDays: thresholdDays.toString(),
        }, client_1.Channel.EMAIL, language);
    }
    async getNotifications(userId, limit = 50) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async markAsRead(notificationId) {
        await this.prisma.notification.update({
            where: { id: notificationId },
            data: { status: client_1.NotificationStatus.READ },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map