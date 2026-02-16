import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
export declare class NotificationBatchService {
    private prisma;
    private emailService;
    private configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(prisma: PrismaService, emailService: EmailService, configService: ConfigService);
    sendBatchedEmails(): Promise<void>;
    private processBatchForUser;
    private groupNotifications;
    private getGroupKey;
    private sendSingleNotification;
    private sendBatchedNotification;
    private generateBatchId;
}
