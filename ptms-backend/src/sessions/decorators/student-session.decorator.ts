import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const StudentSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.studentSession;
  },
);
