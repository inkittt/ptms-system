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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getOverviewStats(sessionId, program) {
        const stats = await this.reportsService.getOverviewStats(sessionId, program);
        return { stats };
    }
    async getApplicationTrends(sessionId, months) {
        const monthsCount = months ? parseInt(months) : 6;
        const trends = await this.reportsService.getApplicationTrends(sessionId, monthsCount);
        return { trends };
    }
    async getStatusDistribution(sessionId, program) {
        const distribution = await this.reportsService.getStatusDistribution(sessionId, program);
        return { distribution };
    }
    async getProgramDistribution(sessionId) {
        const distribution = await this.reportsService.getProgramDistribution(sessionId);
        return { distribution };
    }
    async getTopCompanies(sessionId, limit) {
        const limitCount = limit ? parseInt(limit) : 5;
        const companies = await this.reportsService.getTopCompanies(sessionId, limitCount);
        return { companies };
    }
    async getIndustryDistribution(sessionId) {
        const distribution = await this.reportsService.getIndustryDistribution(sessionId);
        return { distribution };
    }
    async getDocumentStats(sessionId) {
        const stats = await this.reportsService.getDocumentStats(sessionId);
        return { stats };
    }
    async getReviewPerformance(sessionId, weeks) {
        const weeksCount = weeks ? parseInt(weeks) : 4;
        const performance = await this.reportsService.getReviewPerformance(sessionId, weeksCount);
        return { performance };
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.LECTURER),
    __param(0, (0, common_1.Query)('sessionId')),
    __param(1, (0, common_1.Query)('program')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getOverviewStats", null);
__decorate([
    (0, common_1.Get)('application-trends'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.LECTURER),
    __param(0, (0, common_1.Query)('sessionId')),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getApplicationTrends", null);
__decorate([
    (0, common_1.Get)('status-distribution'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.LECTURER),
    __param(0, (0, common_1.Query)('sessionId')),
    __param(1, (0, common_1.Query)('program')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getStatusDistribution", null);
__decorate([
    (0, common_1.Get)('program-distribution'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.LECTURER),
    __param(0, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getProgramDistribution", null);
__decorate([
    (0, common_1.Get)('top-companies'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.LECTURER),
    __param(0, (0, common_1.Query)('sessionId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getTopCompanies", null);
__decorate([
    (0, common_1.Get)('industry-distribution'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.LECTURER),
    __param(0, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getIndustryDistribution", null);
__decorate([
    (0, common_1.Get)('document-stats'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.LECTURER),
    __param(0, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getDocumentStats", null);
__decorate([
    (0, common_1.Get)('review-performance'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.LECTURER),
    __param(0, (0, common_1.Query)('sessionId')),
    __param(1, (0, common_1.Query)('weeks')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReviewPerformance", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map