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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StudentsService = class StudentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPrograms() {
        const users = await this.prisma.user.findMany({
            where: {
                role: 'STUDENT',
                program: {
                    not: null,
                },
            },
            select: {
                program: true,
            },
            distinct: ['program'],
        });
        return users
            .map(u => u.program)
            .filter(p => p !== null)
            .sort();
    }
    async exportStudentsByProgram(program) {
        const students = await this.prisma.user.findMany({
            where: {
                role: 'STUDENT',
                program: program,
            },
            select: {
                matricNo: true,
                creditsEarned: true,
                studentSessions: {
                    select: {
                        status: true,
                        creditsEarned: true,
                        isEligible: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                matricNo: 'asc',
            },
        });
        const csvRows = students.map(student => {
            const latestSession = student.studentSessions[0];
            const status = (latestSession === null || latestSession === void 0 ? void 0 : latestSession.status) || 'not_enrolled';
            return {
                matricNo: student.matricNo || '',
                creditsEarned: student.creditsEarned || 0,
                status: status,
            };
        });
        return csvRows;
    }
    async exportAllStudents() {
        const students = await this.prisma.user.findMany({
            where: {
                role: 'STUDENT',
            },
            select: {
                matricNo: true,
                creditsEarned: true,
                program: true,
                studentSessions: {
                    select: {
                        status: true,
                        creditsEarned: true,
                        isEligible: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: [
                { program: 'asc' },
                { matricNo: 'asc' },
            ],
        });
        const csvRows = students.map(student => {
            const latestSession = student.studentSessions[0];
            const status = (latestSession === null || latestSession === void 0 ? void 0 : latestSession.status) || 'not_enrolled';
            return {
                matricNo: student.matricNo || '',
                creditsEarned: student.creditsEarned || 0,
                status: status,
            };
        });
        return csvRows;
    }
    async getDashboardData(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                matricNo: true,
                program: true,
                creditsEarned: true,
                studentSessions: {
                    where: {
                        session: {
                            isActive: true,
                        },
                    },
                    include: {
                        session: {
                            include: {
                                coordinator: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Student not found');
        }
        const activeSession = user.studentSessions[0] || null;
        let application = null;
        if (activeSession) {
            const latestApplication = await this.prisma.application.findFirst({
                where: {
                    userId: userId,
                    sessionId: activeSession.sessionId,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    id: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            application = latestApplication;
        }
        return {
            student: {
                name: user.name,
                matricNo: user.matricNo || '',
                program: user.program || '',
                creditsEarned: user.creditsEarned || 0,
                isEligible: activeSession ? activeSession.isEligible : false,
            },
            session: activeSession
                ? {
                    id: activeSession.session.id,
                    name: activeSession.session.name,
                    year: activeSession.session.year,
                    semester: activeSession.session.semester,
                    minCredits: activeSession.session.minCredits,
                    isActive: activeSession.session.isActive,
                    creditsEarned: activeSession.creditsEarned,
                    isEligible: activeSession.isEligible,
                    status: activeSession.status,
                }
                : null,
            application: application
                ? {
                    id: application.id,
                    status: application.status,
                    createdAt: application.createdAt.toISOString(),
                    updatedAt: application.updatedAt.toISOString(),
                }
                : null,
        };
    }
    async getCoordinatorStudents(coordinatorId, filters) {
        const coordinatedSessions = await this.prisma.session.findMany({
            where: {
                coordinatorId: coordinatorId,
            },
            select: {
                id: true,
                name: true,
                year: true,
                semester: true,
            },
        });
        const sessionIds = coordinatedSessions.map((session) => session.id);
        if (sessionIds.length === 0) {
            return [];
        }
        const where = {
            role: 'STUDENT',
            studentSessions: {
                some: {
                    sessionId: {
                        in: sessionIds,
                    },
                },
            },
        };
        if (filters.sessionId) {
            if (!sessionIds.includes(filters.sessionId)) {
                throw new common_1.ForbiddenException('You do not have access to this session');
            }
            where.studentSessions = {
                some: {
                    sessionId: filters.sessionId,
                },
            };
        }
        if (filters.program) {
            where.program = filters.program;
        }
        const students = await this.prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                matricNo: true,
                program: true,
                phone: true,
                creditsEarned: true,
                cgpa: true,
                studentSessions: {
                    where: {
                        sessionId: {
                            in: filters.sessionId ? [filters.sessionId] : sessionIds,
                        },
                    },
                    include: {
                        session: {
                            select: {
                                id: true,
                                name: true,
                                year: true,
                                semester: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                applications: {
                    where: {
                        sessionId: {
                            in: filters.sessionId ? [filters.sessionId] : sessionIds,
                        },
                    },
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        session: {
                            select: {
                                id: true,
                                name: true,
                                year: true,
                                semester: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: [
                { program: 'asc' },
                { matricNo: 'asc' },
            ],
        });
        const transformedStudents = students.map((student) => {
            var _a, _b, _c, _d, _e;
            const latestSession = student.studentSessions[0];
            const latestApplication = student.applications[0];
            let isEligible = false;
            let sessionCredits = 0;
            let sessionStatus = 'not_enrolled';
            if (latestSession) {
                isEligible = latestSession.isEligible;
                sessionCredits = latestSession.creditsEarned;
                sessionStatus = latestSession.status;
            }
            if (filters.eligibility) {
                if (filters.eligibility === 'eligible' && !isEligible) {
                    return null;
                }
                if (filters.eligibility === 'ineligible' && isEligible) {
                    return null;
                }
            }
            return {
                id: student.id,
                name: student.name,
                matricNo: student.matricNo || '',
                program: student.program || '',
                creditsEarned: student.creditsEarned || 0,
                cgpa: student.cgpa || 0,
                isEligible: isEligible,
                email: student.email,
                phone: student.phone || '',
                sessionId: (latestSession === null || latestSession === void 0 ? void 0 : latestSession.sessionId) || '',
                sessionYear: ((_b = (_a = latestSession === null || latestSession === void 0 ? void 0 : latestSession.session) === null || _a === void 0 ? void 0 : _a.year) === null || _b === void 0 ? void 0 : _b.toString()) || '',
                sessionSemester: ((_d = (_c = latestSession === null || latestSession === void 0 ? void 0 : latestSession.session) === null || _c === void 0 ? void 0 : _c.semester) === null || _d === void 0 ? void 0 : _d.toString()) || '',
                currentApplication: latestApplication
                    ? {
                        status: latestApplication.status,
                        company: ((_e = latestApplication.company) === null || _e === void 0 ? void 0 : _e.name) || 'Unknown Company',
                    }
                    : null,
                totalApplications: student.applications.length,
                completedInternships: 0,
            };
        }).filter(Boolean);
        return transformedStudents;
    }
    async getStudentDetails(coordinatorId, studentId) {
        const coordinatedSessions = await this.prisma.session.findMany({
            where: {
                coordinatorId: coordinatorId,
            },
            select: {
                id: true,
            },
        });
        const sessionIds = coordinatedSessions.map((session) => session.id);
        if (sessionIds.length === 0) {
            throw new common_1.ForbiddenException('No sessions found for this coordinator');
        }
        const student = await this.prisma.user.findUnique({
            where: { id: studentId },
            select: {
                id: true,
                name: true,
                email: true,
                matricNo: true,
                program: true,
                phone: true,
                creditsEarned: true,
                cgpa: true,
                studentSessions: {
                    where: {
                        sessionId: {
                            in: sessionIds,
                        },
                    },
                    include: {
                        session: {
                            select: {
                                id: true,
                                name: true,
                                year: true,
                                semester: true,
                                minCredits: true,
                                isActive: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                applications: {
                    where: {
                        sessionId: {
                            in: sessionIds,
                        },
                    },
                    select: {
                        id: true,
                        status: true,
                        organizationName: true,
                        organizationAddress: true,
                        organizationEmail: true,
                        organizationPhone: true,
                        contactPersonName: true,
                        contactPersonPhone: true,
                        startDate: true,
                        endDate: true,
                        roleTasksSummary: true,
                        createdAt: true,
                        updatedAt: true,
                        company: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                                industry: true,
                                contactName: true,
                                contactEmail: true,
                                contactPhone: true,
                            },
                        },
                        session: {
                            select: {
                                id: true,
                                name: true,
                                year: true,
                                semester: true,
                            },
                        },
                        documents: {
                            select: {
                                id: true,
                                type: true,
                                status: true,
                                fileUrl: true,
                                createdAt: true,
                                updatedAt: true,
                            },
                            orderBy: {
                                createdAt: 'desc',
                            },
                        },
                        formResponses: {
                            select: {
                                id: true,
                                formTypeEnum: true,
                                payloadJSON: true,
                                submittedAt: true,
                                verifiedBy: true,
                            },
                            orderBy: {
                                submittedAt: 'desc',
                            },
                        },
                        reviews: {
                            select: {
                                id: true,
                                decision: true,
                                comments: true,
                                decidedAt: true,
                                reviewer: {
                                    select: {
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                            orderBy: {
                                decidedAt: 'desc',
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
        if (!student) {
            throw new common_1.NotFoundException('Student not found');
        }
        if (student.studentSessions.length === 0) {
            throw new common_1.ForbiddenException('You do not have access to this student');
        }
        const applications = student.applications.map((app) => ({
            id: app.id,
            status: app.status,
            organizationName: app.organizationName,
            organizationAddress: app.organizationAddress,
            organizationEmail: app.organizationEmail,
            organizationPhone: app.organizationPhone,
            contactPersonName: app.contactPersonName,
            contactPersonPhone: app.contactPersonPhone,
            startDate: app.startDate,
            endDate: app.endDate,
            roleTasksSummary: app.roleTasksSummary,
            company: app.company ? {
                id: app.company.id,
                name: app.company.name,
                address: app.company.address,
                industry: app.company.industry,
                contactName: app.company.contactName,
                contactEmail: app.company.contactEmail,
                contactPhone: app.company.contactPhone,
            } : null,
            session: {
                id: app.session.id,
                name: app.session.name,
                year: app.session.year,
                semester: app.session.semester,
            },
            documents: app.documents.map((doc) => ({
                id: doc.id,
                type: doc.type,
                status: doc.status,
                fileUrl: doc.fileUrl,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            })),
            formResponses: app.formResponses.map((form) => ({
                id: form.id,
                formTypeEnum: form.formTypeEnum,
                payloadJSON: form.payloadJSON,
                submittedAt: form.submittedAt,
                verifiedBy: form.verifiedBy,
            })),
            reviews: app.reviews.map((review) => ({
                id: review.id,
                decision: review.decision,
                comments: review.comments,
                decidedAt: review.decidedAt,
                reviewer: review.reviewer ? {
                    name: review.reviewer.name,
                    email: review.reviewer.email,
                } : null,
            })),
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
        }));
        const latestSession = student.studentSessions[0];
        return {
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                matricNo: student.matricNo || '',
                program: student.program || '',
                phone: student.phone || '',
                creditsEarned: student.creditsEarned || 0,
                cgpa: student.cgpa || 0,
                isEligible: (latestSession === null || latestSession === void 0 ? void 0 : latestSession.isEligible) || false,
                sessionInfo: latestSession ? {
                    id: latestSession.session.id,
                    name: latestSession.session.name,
                    year: latestSession.session.year,
                    semester: latestSession.session.semester,
                    minCredits: latestSession.session.minCredits,
                    isActive: latestSession.session.isActive,
                    creditsEarned: latestSession.creditsEarned,
                    status: latestSession.status,
                } : null,
            },
            applications,
            totalApplications: applications.length,
            completedInternships: applications.filter(app => app.status === 'APPROVED').length,
        };
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentsService);
//# sourceMappingURL=students.service.js.map