"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentSession = void 0;
const common_1 = require("@nestjs/common");
exports.StudentSession = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.studentSession;
});
//# sourceMappingURL=student-session.decorator.js.map