import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { Channel, NotificationStatus } from '@prisma/client';
import { NotificationTemplates, renderTemplate } from './templates/notification-templates';
import { ConfigService } from '@nestjs/config';

export interface NotificationPayload {
  type: string;
  applicationId?: string;
  [key: string]: any;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly baseUrl: string;

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
  }

  async sendNotification(
    userId: string,
    type: string,
    payload: NotificationPayload,
    channel: Channel = Channel.EMAIL,
    language: 'en' | 'bm' = 'en',
  ): Promise<void> {
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
          status: NotificationStatus.PENDING,
          emailQueued: shouldBatch,
        },
      });

      if (channel === Channel.EMAIL && !shouldBatch) {
        const success = await this.sendEmailNotification(user.email, user.name, type, payload, language);
        
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: success ? NotificationStatus.SENT : NotificationStatus.FAILED,
            sentAt: success ? new Date() : null,
            emailQueued: false,
          },
        });
        
        this.logger.log(`Notification sent immediately: ${type} to ${user.email}`);
      } else if (shouldBatch) {
        this.logger.log(`Notification queued for batching: ${type} to ${user.email}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`, error.stack);
    }
  }

  private shouldBatchNotificationType(type: string): boolean {
    const batchableTypes = [
      'NEW_SUBMISSION',
      'COORDINATOR_ESCALATION',
    ];
    return batchableTypes.includes(type);
  }

  private async sendEmailNotification(
    email: string,
    name: string,
    type: string,
    payload: NotificationPayload,
    language: 'en' | 'bm',
  ): Promise<boolean> {
    const template = NotificationTemplates[type];
    if (!template) {
      this.logger.error(`Template not found for type: ${type}`);
      return false;
    }

    const variables = {
      name,
      ...payload,
      dashboardLink: `${this.baseUrl}/dashboard`,
      applicationLink: payload.applicationId 
        ? `${this.baseUrl}/applications/${payload.applicationId}` 
        : `${this.baseUrl}/dashboard`,
      submissionLink: payload.applicationId
        ? `${this.baseUrl}/applications/${payload.applicationId}/submit`
        : `${this.baseUrl}/dashboard`,
      reviewLink: payload.applicationId
        ? `${this.baseUrl}/coordinator/applications/${payload.applicationId}`
        : `${this.baseUrl}/coordinator/dashboard`,
    };

    const { subject, body } = renderTemplate(template, language, variables);
    return await this.emailService.sendEmail(email, subject, body);
  }

  async notifySubmissionReceived(applicationId: string, language: 'en' | 'bm' = 'en'): Promise<void> {
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

    if (!application) return;

    await this.sendNotification(
      application.userId,
      'SUBMISSION_RECEIVED',
      {
        type: 'SUBMISSION_RECEIVED',
        applicationId: application.id,
        organizationName: application.organizationName || 'N/A',
        startDate: application.startDate?.toLocaleDateString() || 'TBD',
        endDate: application.endDate?.toLocaleDateString() || 'TBD',
      },
      Channel.EMAIL,
      language,
    );

    if (application.session?.coordinator) {
      await this.sendNotification(
        application.session.coordinator.id,
        'NEW_SUBMISSION',
        {
          type: 'NEW_SUBMISSION',
          applicationId: application.id,
          studentName: application.user.name,
          matricNo: application.user.matricNo || 'N/A',
          organizationName: application.organizationName || 'N/A',
          startDate: application.startDate?.toLocaleDateString() || 'TBD',
          endDate: application.endDate?.toLocaleDateString() || 'TBD',
          submittedAt: new Date().toLocaleString(),
        },
        Channel.EMAIL,
        language,
      );
    }
  }

  async notifyChangesRequested(applicationId: string, comments: string, language: 'en' | 'bm' = 'en'): Promise<void> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) return;

    await this.sendNotification(
      application.userId,
      'CHANGES_REQUESTED',
      {
        type: 'CHANGES_REQUESTED',
        applicationId: application.id,
        comments,
      },
      Channel.EMAIL,
      language,
    );
  }

  async notifyApplicationApproved(applicationId: string, language: 'en' | 'bm' = 'en'): Promise<void> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) return;

    await this.sendNotification(
      application.userId,
      'APPLICATION_APPROVED',
      {
        type: 'APPLICATION_APPROVED',
        applicationId: application.id,
        organizationName: application.organizationName || 'N/A',
        startDate: application.startDate?.toLocaleDateString() || 'TBD',
        endDate: application.endDate?.toLocaleDateString() || 'TBD',
      },
      Channel.EMAIL,
      language,
    );
  }

  async notifySLI03Ready(applicationId: string, downloadLink: string, language: 'en' | 'bm' = 'en'): Promise<void> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) return;

    await this.sendNotification(
      application.userId,
      'SLI03_READY',
      {
        type: 'SLI03_READY',
        applicationId: application.id,
        link: downloadLink,
        startDate: application.startDate?.toLocaleDateString() || 'TBD',
        endDate: application.endDate?.toLocaleDateString() || 'TBD',
      },
      Channel.EMAIL,
      language,
    );
  }

  async notifyBLI04DueReminder(
    applicationId: string,
    dueDate: Date,
    daysLeft: number,
    language: 'en' | 'bm' = 'en',
  ): Promise<void> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) return;

    await this.sendNotification(
      application.userId,
      'BLI04_DUE_REMINDER',
      {
        type: 'BLI04_DUE_REMINDER',
        applicationId: application.id,
        dueDate: dueDate.toLocaleDateString(),
        daysLeft: daysLeft.toString(),
      },
      Channel.EMAIL,
      language,
    );
  }

  async notifyOverdueSubmission(
    applicationId: string,
    documentType: string,
    dueDate: Date,
    daysOverdue: number,
    language: 'en' | 'bm' = 'en',
  ): Promise<void> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) return;

    await this.sendNotification(
      application.userId,
      'OVERDUE_REMINDER',
      {
        type: 'OVERDUE_REMINDER',
        applicationId: application.id,
        documentType,
        dueDate: dueDate.toLocaleDateString(),
        daysOverdue: daysOverdue.toString(),
      },
      Channel.EMAIL,
      language,
    );
  }

  async notifyCoordinatorEscalation(
    applicationId: string,
    thresholdDays: number,
    language: 'en' | 'bm' = 'en',
  ): Promise<void> {
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

    if (!application || !application.session?.coordinator) return;

    const daysPending = Math.floor(
      (new Date().getTime() - application.updatedAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    await this.sendNotification(
      application.session.coordinator.id,
      'COORDINATOR_ESCALATION',
      {
        type: 'COORDINATOR_ESCALATION',
        applicationId: application.id,
        studentName: application.user.name,
        matricNo: application.user.matricNo || 'N/A',
        status: application.status,
        pendingSince: application.updatedAt.toLocaleDateString(),
        daysPending: daysPending.toString(),
        thresholdDays: thresholdDays.toString(),
      },
      Channel.EMAIL,
      language,
    );
  }

  async getNotifications(userId: string, limit: number = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: NotificationStatus.READ },
    });
  }
}
