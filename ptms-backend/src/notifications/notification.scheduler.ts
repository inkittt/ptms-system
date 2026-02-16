import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { ConfigService } from '@nestjs/config';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);
  private readonly reminderDays: number[];
  private readonly escalationThreshold: number;

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private configService: ConfigService,
  ) {
    const reminderDaysStr = this.configService.get<string>('REMINDER_DAYS', '14,7,3,1');
    this.reminderDays = reminderDaysStr.split(',').map(d => parseInt(d.trim()));
    this.escalationThreshold = parseInt(
      this.configService.get<string>('ESCALATION_THRESHOLD_DAYS', '7'),
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleDailyReminders() {
    this.logger.log('Running daily reminder check...');
    await this.checkBLI04Deadlines();
    await this.checkOverdueSubmissions();
    await this.checkEscalations();
  }

  private async checkBLI04Deadlines() {
    const applications = await this.prisma.application.findMany({
      where: {
        status: ApplicationStatus.APPROVED,
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
      if (!app.endDate) continue;

      const bli04Submitted = app.documents.some(doc => doc.type === 'BLI_04');
      if (bli04Submitted) continue;

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

  private async checkOverdueSubmissions() {
    const applications = await this.prisma.application.findMany({
      where: {
        status: ApplicationStatus.APPROVED,
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
      if (!app.endDate) continue;

      const bli04Submitted = app.documents.some(doc => doc.type === 'BLI_04');
      if (bli04Submitted) continue;

      const dueDate = new Date(app.endDate);
      dueDate.setDate(dueDate.getDate() + 14);

      const today = new Date();
      const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysOverdue > 0) {
        this.logger.log(`Application ${app.id} is ${daysOverdue} days overdue`);
        await this.notificationsService.notifyOverdueSubmission(
          app.id,
          'BLI-04',
          dueDate,
          daysOverdue,
        );
      }
    }
  }

  private async checkEscalations() {
    const applications = await this.prisma.application.findMany({
      where: {
        status: {
          in: [ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW],
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
      const daysPending = Math.floor(
        (new Date().getTime() - app.updatedAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysPending >= this.escalationThreshold) {
        this.logger.log(`Escalating application ${app.id} (pending for ${daysPending} days)`);
        await this.notificationsService.notifyCoordinatorEscalation(
          app.id,
          this.escalationThreshold,
        );
      }
    }
  }
}
