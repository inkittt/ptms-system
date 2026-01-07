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
exports.StudentsController = void 0;
const common_1 = require("@nestjs/common");
const students_service_1 = require("./students.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let StudentsController = class StudentsController {
    constructor(studentsService) {
        this.studentsService = studentsService;
    }
    async getPrograms() {
        const programs = await this.studentsService.getPrograms();
        return { programs };
    }
    async getDashboard(user) {
        return this.studentsService.getDashboardData(user.userId);
    }
    async exportCsv(program, res) {
        let students;
        if (program && program !== 'ALL') {
            students = await this.studentsService.exportStudentsByProgram(program);
        }
        else {
            students = await this.studentsService.exportAllStudents();
        }
        const csvHeader = 'matricNo,creditsEarned,status\n';
        const csvRows = students
            .map(s => `${s.matricNo},${s.creditsEarned},${s.status}`)
            .join('\n');
        const csvContent = csvHeader + csvRows;
        const filename = program && program !== 'ALL'
            ? `students_${program}_${new Date().toISOString().split('T')[0]}.csv`
            : `students_all_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvContent);
    }
    async getCoordinatorStudents(user, sessionId, program, eligibility) {
        const students = await this.studentsService.getCoordinatorStudents(user.userId, { sessionId, program, eligibility });
        return { students };
    }
    async getStudentDetails(user, studentId) {
        const studentDetails = await this.studentsService.getStudentDetails(user.userId, studentId);
        return studentDetails;
    }
};
exports.StudentsController = StudentsController;
__decorate([
    (0, common_1.Get)('programs'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getPrograms", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('export-csv'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('program')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('coordinator/students'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('sessionId')),
    __param(2, (0, common_1.Query)('program')),
    __param(3, (0, common_1.Query)('eligibility')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getCoordinatorStudents", null);
__decorate([
    (0, common_1.Get)('coordinator/students/:id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.COORDINATOR, client_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getStudentDetails", null);
exports.StudentsController = StudentsController = __decorate([
    (0, common_1.Controller)('students'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [students_service_1.StudentsService])
], StudentsController);
//# sourceMappingURL=students.controller.js.map