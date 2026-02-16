import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { NotificationScheduler } from './notification.scheduler';
import { NotificationBatchService } from './notification-batch.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, NotificationScheduler, NotificationBatchService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
