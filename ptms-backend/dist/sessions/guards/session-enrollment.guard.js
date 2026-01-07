"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionEnrollmentGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SessionEnrollmentGuard = class SessionEnrollmentGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        var _a;
        const request = context.switchToHttp().getRequest();
        const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            throw new common_1.ForbiddenException('User not authenticated');
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
            throw new common_1.ForbiddenException('You are not enrolled in any active session. Please contact your coordinator.');
        }
        if (!activeSession.isEligible) {
            throw new common_1.ForbiddenException('You are not eligible for this session due to insufficient credits.');
        }
        request.studentSession = activeSession;
        return true;
    }
};
exports.SessionEnrollmentGuard = SessionEnrollmentGuard;
exports.SessionEnrollmentGuard = SessionEnrollmentGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionEnrollmentGuard);
//# sourceMappingURL=session-enrollment.guard.js.map