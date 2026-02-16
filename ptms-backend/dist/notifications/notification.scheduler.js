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
var NotificationScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("./notifications.service");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
let NotificationScheduler = NotificationScheduler_1 = class NotificationScheduler {
    constructor(prisma, notificationsService, configService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationScheduler_1.name);
        const reminderDaysStr = this.configService.get('REMINDER_DAYS', '14,7,3,1');
        this.reminderDays = reminderDaysStr.split(',').map(d => parseInt(d.trim()));
        this.escalationThreshold = parseInt(this.configService.get('ESCALATION_THRESHOLD_DAYS', '7'));
    }
    async handleDailyReminders() {
        this.logger.log('Running daily reminder check...');
        await this.checkBLI04Deadlines();
        await this.checkOverdueSubmissions();
        await this.checkEscalations();
    }
    async checkBLI04Deadlines() {
        const applications = await this.prisma.application.findMany({
            where: {
                status: client_1.ApplicationStatus.APPROVED,
                endDate: {
                    not: null,
                },
            },
            include: {
                user: true,
                documents: {
                    where: {
                        type: 'BLI_04',
                    },
                },
            },
        });
        for (const app of applications) {
            if (!app.endDate)
                continue;
            const bli04Submitted = app.documents.some(doc => doc.type === 'BLI_04');
            if (bli04Submitted)
                continue;
            const dueDate = new Date(app.endDate);
            dueDate.setDate(dueDate.getDate() + 14);
            const today = new Date();
            const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (this.reminderDays.includes(daysUntilDue)) {
                this.logger.log(`Sending BLI-04 reminder for application ${app.id} (${daysUntilDue} days left)`);
                await this.notificationsService.notifyBLI04DueReminder(app.id, dueDate, daysUntilDue);
            }
        }
    }
    async checkOverdueSubmissions() {
        const applications = await this.prisma.application.findMany({
            where: {
                status: client_1.ApplicationStatus.APPROVED,
                endDate: {
                    not: null,
                },
            },
            include: {
                user: true,
                documents: {
                    where: {
                        type: 'BLI_04',
                    },
                },
            },
        });
        for (const app of applications) {
            if (!app.endDate)
                continue;
            const bli04Submitted = app.documents.some(doc => doc.type === 'BLI_04');
            if (bli04Submitted)
                continue;
            const dueDate = new Date(app.endDate);
            dueDate.setDate(dueDate.getDate() + 14);
            const today = new Date();
            const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysOverdue > 0) {
                this.logger.log(`Application ${app.id} is ${daysOverdue} days overdue`);
                await this.notificationsService.notifyOverdueSubmission(app.id, 'BLI-04', dueDate, daysOverdue);
            }
        }
    }
    async checkEscalations() {
        const applications = await this.prisma.application.findMany({
            where: {
                status: {
                    in: [client_1.ApplicationStatus.SUBMITTED, client_1.ApplicationStatus.UNDER_REVIEW],
                },
            },
            include: {
                user: true,
                session: {
                    include: {
                        coordinator: true,
                    },
                },
            },
        });
        for (const app of applications) {
            const daysPending = Math.floor((new Date().getTime() - app.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
            if (daysPending >= this.escalationThreshold) {
                this.logger.log(`Escalating application ${app.id} (pending for ${daysPending} days)`);
                await this.notificationsService.notifyCoordinatorEscalation(app.id, this.escalationThreshold);
            }
        }
    }
};
exports.NotificationScheduler = NotificationScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_9AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationScheduler.prototype, "handleDailyReminders", null);
exports.NotificationScheduler = NotificationScheduler = NotificationScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        config_1.ConfigService])
], NotificationScheduler);
//# sourceMappingURL=notification.scheduler.js.map