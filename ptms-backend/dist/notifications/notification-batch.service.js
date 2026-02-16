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
var NotificationBatchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationBatchService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("./email.service");
const notification_templates_1 = require("./templates/notification-templates");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
let NotificationBatchService = NotificationBatchService_1 = class NotificationBatchService {
    constructor(prisma, emailService, configService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationBatchService_1.name);
        this.baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3000';
    }
    async sendBatchedEmails() {
        this.logger.log('Processing batched email notifications...');
        const coordinators = await this.prisma.user.findMany({
            where: { role: client_1.UserRole.COORDINATOR, isActive: true },
        });
        for (const coordinator of coordinators) {
            await this.processBatchForUser(coordinator.id, coordinator.email, coordinator.name);
        }
    }
    async processBatchForUser(userId, email, name) {
        const queuedNotifications = await this.prisma.notification.findMany({
            where: {
                userId,
                emailQueued: true,
                status: client_1.NotificationStatus.PENDING,
            },
            orderBy: { createdAt: 'asc' },
        });
        if (queuedNotifications.length === 0) {
            return;
        }
        const grouped = this.groupNotifications(queuedNotifications);
        for (const [type, notifications] of Object.entries(grouped)) {
            if (notifications.length === 1) {
                await this.sendSingleNotification(notifications[0], email, name);
            }
            else {
                await this.sendBatchedNotification(type, notifications, email, name);
            }
        }
    }
    groupNotifications(notifications) {
        const groups = {};
        for (const notification of notifications) {
            const type = notification.type;
            const groupKey = this.getGroupKey(type);
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(notification);
        }
        return groups;
    }
    getGroupKey(type) {
        if (type === 'NEW_SUBMISSION') {
            return 'SUBMISSIONS';
        }
        if (type === 'COORDINATOR_ESCALATION') {
            return 'ESCALATIONS';
        }
        return type;
    }
    async sendSingleNotification(notification, email, name) {
        const template = notification_templates_1.NotificationTemplates[notification.type];
        if (!template) {
            this.logger.error(`Template not found for type: ${notification.type}`);
            return;
        }
        const payload = notification.payloadJSON;
        const variables = Object.assign(Object.assign({ name }, payload), { dashboardLink: `${this.baseUrl}/dashboard`, reviewLink: `${this.baseUrl}/coordinator/dashboard` });
        const { subject, body } = (0, notification_templates_1.renderTemplate)(template, 'en', variables);
        const success = await this.emailService.sendEmail(email, subject, body);
        await this.prisma.notification.update({
            where: { id: notification.id },
            data: {
                status: success ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.FAILED,
                sentAt: success ? new Date() : null,
                emailQueued: false,
            },
        });
    }
    async sendBatchedNotification(groupType, notifications, email, name) {
        let templateKey = '';
        let items = '';
        if (groupType === 'SUBMISSIONS') {
            templateKey = 'BATCH_SUBMISSIONS';
            items = notifications
                .map((n) => {
                const payload = n.payloadJSON;
                return `
            <div style="margin: 15px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #0066cc;">
              <p><strong>Student:</strong> ${payload.studentName} (${payload.matricNo})</p>
              <p><strong>Organization:</strong> ${payload.organizationName}</p>
              <p><strong>Training Period:</strong> ${payload.startDate} – ${payload.endDate}</p>
              <p><strong>Submitted:</strong> ${payload.submittedAt}</p>
              <p><a href="${this.baseUrl}/coordinator/applications/${payload.applicationId}">Review Application →</a></p>
            </div>
          `;
            })
                .join('');
        }
        else if (groupType === 'ESCALATIONS') {
            templateKey = 'BATCH_ESCALATIONS';
            items = notifications
                .map((n) => {
                const payload = n.payloadJSON;
                return `
            <div style="margin: 15px 0; padding: 15px; background: #fff3cd; border-left: 4px solid #ff9800;">
              <p><strong>Student:</strong> ${payload.studentName} (${payload.matricNo})</p>
              <p><strong>Status:</strong> ${payload.status}</p>
              <p><strong>Pending Since:</strong> ${payload.pendingSince} (${payload.daysPending} days)</p>
              <p><a href="${this.baseUrl}/coordinator/applications/${payload.applicationId}">Review Now →</a></p>
            </div>
          `;
            })
                .join('');
        }
        else {
            this.logger.warn(`No batch template for group type: ${groupType}`);
            return;
        }
        const template = notification_templates_1.NotificationTemplates[templateKey];
        if (!template) {
            this.logger.error(`Batch template not found: ${templateKey}`);
            return;
        }
        const variables = {
            name,
            count: notifications.length.toString(),
            items,
            reviewLink: `${this.baseUrl}/coordinator/dashboard`,
        };
        const { subject, body } = (0, notification_templates_1.renderTemplate)(template, 'en', variables);
        const success = await this.emailService.sendEmail(email, subject, body);
        const batchId = this.generateBatchId();
        const notificationIds = notifications.map((n) => n.id);
        await this.prisma.notification.updateMany({
            where: { id: { in: notificationIds } },
            data: {
                status: success ? client_1.NotificationStatus.SENT : client_1.NotificationStatus.FAILED,
                sentAt: success ? new Date() : null,
                emailQueued: false,
                batchId,
            },
        });
        this.logger.log(`Sent batched ${groupType} email to ${email}: ${notifications.length} notifications`);
    }
    generateBatchId() {
        return (0, crypto_1.randomUUID)();
    }
};
exports.NotificationBatchService = NotificationBatchService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationBatchService.prototype, "sendBatchedEmails", null);
exports.NotificationBatchService = NotificationBatchService = NotificationBatchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        config_1.ConfigService])
], NotificationBatchService);
//# sourceMappingURL=notification-batch.service.js.map