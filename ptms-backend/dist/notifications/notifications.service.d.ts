import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { Channel } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
export interface NotificationPayload {
    type: string;
    applicationId?: string;
    [key: string]: any;
}
export declare class NotificationsService {
    private prisma;
    private emailService;
    private configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(prisma: PrismaService, emailService: EmailService, configService: ConfigService);
    sendNotification(userId: string, type: string, payload: NotificationPayload, channel?: Channel, language?: 'en' | 'bm'): Promise<void>;
    private shouldBatchNotificationType;
    private sendEmailNotification;
    notifySubmissionReceived(applicationId: string, language?: 'en' | 'bm'): Promise<void>;
    notifyChangesRequested(applicationId: string, comments: string, language?: 'en' | 'bm'): Promise<void>;
    notifyApplicationApproved(applicationId: string, language?: 'en' | 'bm'): Promise<void>;
    notifySLI03Ready(applicationId: string, downloadLink: string, language?: 'en' | 'bm'): Promise<void>;
    notifyBLI04DueReminder(applicationId: string, dueDate: Date, daysLeft: number, language?: 'en' | 'bm'): Promise<void>;
    notifyOverdueSubmission(applicationId: string, documentType: string, dueDate: Date, daysOverdue: number, language?: 'en' | 'bm'): Promise<void>;
    notifyCoordinatorEscalation(applicationId: string, thresholdDays: number, language?: 'en' | 'bm'): Promise<void>;
    getNotifications(userId: string, limit?: number): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        createdAt: Date;
        userId: string;
        type: string;
        payloadJSON: import("@prisma/client/runtime/library").JsonValue;
        channel: import(".prisma/client").$Enums.Channel;
        sentAt: Date | null;
        batchId: string | null;
        emailQueued: boolean;
    }[]>;
    markAsRead(notificationId: string): Promise<void>;
}
