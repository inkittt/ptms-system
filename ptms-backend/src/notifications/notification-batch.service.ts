import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { NotificationTemplates, renderTemplate } from './templates/notification-templates';
import { ConfigService } from '@nestjs/config';
import { NotificationStatus, UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';

interface GroupedNotification {
  type: string;
  notifications: any[];
}

@Injectable()
export class NotificationBatchService {
  private readonly logger = new Logger(NotificationBatchService.name);
  private readonly baseUrl: string;

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendBatchedEmails() {
    this.logger.log('Processing batched email notifications...');

    const coordinators = await this.prisma.user.findMany({
      where: { role: UserRole.COORDINATOR, isActive: true },
    });

    for (const coordinator of coordinators) {
      await this.processBatchForUser(coordinator.id, coordinator.email, coordinator.name);
    }
  }

  private async processBatchForUser(userId: string, email: string, name: string) {
    const queuedNotifications = await this.prisma.notification.findMany({
      where: {
        userId,
        emailQueued: true,
        status: NotificationStatus.PENDING,
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
      } else {
        await this.sendBatchedNotification(type, notifications, email, name);
      }
    }
  }

  private groupNotifications(notifications: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {};

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

  private getGroupKey(type: string): string {
    if (type === 'NEW_SUBMISSION') {
      return 'SUBMISSIONS';
    }
    if (type === 'COORDINATOR_ESCALATION') {
      return 'ESCALATIONS';
    }
    return type;
  }

  private async sendSingleNotification(notification: any, email: string, name: string) {
    const template = NotificationTemplates[notification.type];
    if (!template) {
      this.logger.error(`Template not found for type: ${notification.type}`);
      return;
    }

    const payload = notification.payloadJSON as any;
    const variables = {
      name,
      ...payload,
      dashboardLink: `${this.baseUrl}/dashboard`,
      reviewLink: `${this.baseUrl}/coordinator/dashboard`,
    };

    const { subject, body } = renderTemplate(template, 'en', variables);
    const success = await this.emailService.sendEmail(email, subject, body);

    await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        sentAt: success ? new Date() : null,
        emailQueued: false,
      },
    });
  }

  private async sendBatchedNotification(
    groupType: string,
    notifications: any[],
    email: string,
    name: string,
  ) {
    let templateKey = '';
    let items = '';

    if (groupType === 'SUBMISSIONS') {
      templateKey = 'BATCH_SUBMISSIONS';
      items = notifications
        .map((n) => {
          const payload = n.payloadJSON as any;
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
    } else if (groupType === 'ESCALATIONS') {
      templateKey = 'BATCH_ESCALATIONS';
      items = notifications
        .map((n) => {
          const payload = n.payloadJSON as any;
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
    } else {
      this.logger.warn(`No batch template for group type: ${groupType}`);
      return;
    }

    const template = NotificationTemplates[templateKey];
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

    const { subject, body } = renderTemplate(template, 'en', variables);
    const success = await this.emailService.sendEmail(email, subject, body);

    const batchId = this.generateBatchId();
    const notificationIds = notifications.map((n) => n.id);

    await this.prisma.notification.updateMany({
      where: { id: { in: notificationIds } },
      data: {
        status: success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        sentAt: success ? new Date() : null,
        emailQueued: false,
        batchId,
      },
    });

    this.logger.log(
      `Sent batched ${groupType} email to ${email}: ${notifications.length} notifications`,
    );
  }

  private generateBatchId(): string {
    return randomUUID();
  }
}
