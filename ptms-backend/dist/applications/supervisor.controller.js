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
exports.SupervisorController = void 0;
const common_1 = require("@nestjs/common");
const applications_service_1 = require("./applications.service");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let SupervisorController = class SupervisorController {
    constructor(applicationsService) {
        this.applicationsService = applicationsService;
    }
    async verifySupervisorToken(token) {
        try {
            const data = await this.applicationsService.verifySupervisorToken(token);
            return Object.assign({ success: true }, data);
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async submitSupervisorSignature(token, signatureData) {
        try {
            const result = await this.applicationsService.submitSupervisorSignature(token, signatureData);
            return Object.assign({ success: true, message: 'BLI-04 form signed successfully' }, result);
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.SupervisorController = SupervisorController;
__decorate([
    (0, common_1.Get)('verify/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupervisorController.prototype, "verifySupervisorToken", null);
__decorate([
    (0, common_1.Post)('sign/:token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SupervisorController.prototype, "submitSupervisorSignature", null);
exports.SupervisorController = SupervisorController = __decorate([
    (0, common_1.Controller)('supervisor'),
    (0, public_decorator_1.Public)(),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService])
], SupervisorController);
//# sourceMappingURL=supervisor.controller.js.map