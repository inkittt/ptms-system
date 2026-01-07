import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionEnrollmentGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const activeSession = await this.prisma.studentSession.findFirst({
      where: {
        userId,
        session: {
          isActive: true,
        },
      },
      include: {
        session: true,
      },
    });

    if (!activeSession) {
      throw new ForbiddenException('You are not enrolled in any active session. Please contact your coordinator.');
    }

    if (!activeSession.isEligible) {
      throw new ForbiddenException('You are not eligible for this session due to insufficient credits.');
    }

    request.studentSession = activeSession;

    return true;
  }
}
