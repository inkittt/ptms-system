import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any): Promise<{
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
    markAsRead(id: string): Promise<{
        message: string;
    }>;
}
