import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { ConfigService } from '@nestjs/config';
export declare class NotificationScheduler {
    private prisma;
    private notificationsService;
    private configService;
    private readonly logger;
    private readonly reminderDays;
    private readonly escalationThreshold;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, configService: ConfigService);
    handleDailyReminders(): Promise<void>;
    private checkBLI04Deadlines;
    private checkOverdueSubmissions;
    private checkEscalations;
}
