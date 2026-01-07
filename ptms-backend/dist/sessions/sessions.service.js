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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const csv_parser_1 = __importDefault(require("csv-parser"));
const stream_1 = require("stream");
let SessionsService = class SessionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSessionDto, coordinatorId) {
        const { name, year, semester, deadlinesJSON, minCredits, minWeeks, maxWeeks, isActive } = createSessionDto;
        if (minWeeks > maxWeeks) {
            throw new common_1.BadRequestException('Minimum weeks cannot be greater than maximum weeks');
        }
        return this.prisma.session.create({
            data: {
                name,
                year,
                semester,
                deadlinesJSON: deadlinesJSON || {},
                minCredits: minCredits || 113,
                minWeeks,
                maxWeeks,
                isActive: isActive !== null && isActive !== void 0 ? isActive : true,
                coordinatorId,
            },
            include: {
                coordinator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findAll() {
        const sessions = await this.prisma.session.findMany({
            orderBy: [
                { year: 'desc' },
                { semester: 'desc' },
            ],
            include: {
                coordinator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        applications: true,
                        studentSessions: true,
                    },
                },
            },
        });
        return sessions.map(session => (Object.assign(Object.assign({}, session), { totalApplications: session._count.applications, totalStudents: session._count.studentSessions })));
    }
    async findByCoordinator(coordinatorId) {
        const sessions = await this.prisma.session.findMany({
            where: {
                coordinatorId,
            },
            orderBy: [
                { year: 'desc' },
                { semester: 'desc' },
            ],
            include: {
                coordinator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        applications: true,
                        studentSessions: true,
                    },
                },
            },
        });
        return sessions.map(session => (Object.assign(Object.assign({}, session), { totalApplications: session._count.applications, totalStudents: session._count.studentSessions })));
    }
    async findOne(id) {
        const session = await this.prisma.session.findUnique({
            where: { id },
            include: {
                coordinator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        applications: true,
                        studentSessions: true,
                    },
                },
            },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Session with ID ${id} not found`);
        }
        return Object.assign(Object.assign({}, session), { totalApplications: session._count.applications, totalStudents: session._count.studentSessions });
    }
    async update(id, updateSessionDto) {
        await this.findOne(id);
        if (updateSessionDto.minWeeks && updateSessionDto.maxWeeks && updateSessionDto.minWeeks > updateSessionDto.maxWeeks) {
            throw new common_1.BadRequestException('Minimum weeks cannot be greater than maximum weeks');
        }
        return this.prisma.session.update({
            where: { id },
            data: updateSessionDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        const hasApplications = await this.prisma.application.count({
            where: { sessionId: id },
        });
        if (hasApplications > 0) {
            throw new common_1.BadRequestException('Cannot delete session with existing applications');
        }
        return this.prisma.session.delete({
            where: { id },
        });
    }
    async importStudentsFromCsv(sessionId, csvBuffer) {
        const session = await this.findOne(sessionId);
        const results = [];
        const stream = stream_1.Readable.from(csvBuffer.toString());
        return new Promise((resolve, reject) => {
            stream
                .pipe((0, csv_parser_1.default)())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                var _a, _b, _c, _d;
                try {
                    const importResults = {
                        total: results.length,
                        successful: 0,
                        failed: 0,
                        errors: [],
                    };
                    for (const row of results) {
                        try {
                            const matricNo = ((_a = row.matricNo) === null || _a === void 0 ? void 0 : _a.trim()) || ((_b = row.MatricNo) === null || _b === void 0 ? void 0 : _b.trim());
                            const creditsEarned = parseInt(row.creditsEarned || row.CreditsEarned);
                            let status = (((_c = row.status) === null || _c === void 0 ? void 0 : _c.trim()) || ((_d = row.Status) === null || _d === void 0 ? void 0 : _d.trim()) || 'active').toLowerCase();
                            if (status === 'not_enrolled' || status === 'no_enrolled') {
                                status = 'active';
                            }
                            if (!matricNo) {
                                importResults.failed++;
                                importResults.errors.push(`Row missing matricNo`);
                                continue;
                            }
                            if (isNaN(creditsEarned)) {
                                importResults.failed++;
                                importResults.errors.push(`Invalid creditsEarned for ${matricNo}`);
                                continue;
                            }
                            const user = await this.prisma.user.findUnique({
                                where: { matricNo },
                            });
                            if (!user) {
                                importResults.failed++;
                                importResults.errors.push(`User with matricNo ${matricNo} not found`);
                                continue;
                            }
                            const existingEnrollment = await this.prisma.studentSession.findFirst({
                                where: {
                                    userId: user.id,
                                    session: {
                                        isActive: true,
                                    },
                                    NOT: {
                                        sessionId: sessionId,
                                    },
                                },
                                include: {
                                    session: true,
                                },
                            });
                            if (existingEnrollment) {
                                importResults.failed++;
                                importResults.errors.push(`Student ${matricNo} is already enrolled in another active session: ${existingEnrollment.session.name}`);
                                continue;
                            }
                            const isEligible = creditsEarned >= session.minCredits;
                            if (!isEligible) {
                                importResults.failed++;
                                importResults.errors.push(`Student ${matricNo} does not meet minimum credit requirement (${creditsEarned}/${session.minCredits} credits)`);
                                continue;
                            }
                            await this.prisma.studentSession.upsert({
                                where: {
                                    sessionId_userId: {
                                        sessionId,
                                        userId: user.id,
                                    },
                                },
                                create: {
                                    sessionId,
                                    userId: user.id,
                                    creditsEarned,
                                    isEligible,
                                    status,
                                },
                                update: {
                                    creditsEarned,
                                    isEligible,
                                    status,
                                },
                            });
                            importResults.successful++;
                        }
                        catch (error) {
                            importResults.failed++;
                            importResults.errors.push(`Error processing row: ${error.message}`);
                        }
                    }
                    resolve(importResults);
                }
                catch (error) {
                    reject(error);
                }
            })
                .on('error', (error) => reject(error));
        });
    }
    async getStudentSession(userId, sessionId) {
        if (sessionId) {
            return this.prisma.studentSession.findUnique({
                where: {
                    sessionId_userId: {
                        sessionId,
                        userId,
                    },
                },
                include: {
                    session: true,
                },
            });
        }
        const activeSessions = await this.prisma.studentSession.findMany({
            where: {
                userId,
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
        });
        return activeSessions[0] || null;
    }
    async getStudentSessions(userId) {
        return this.prisma.studentSession.findMany({
            where: { userId },
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
        });
    }
    async getSessionStudents(sessionId) {
        await this.findOne(sessionId);
        return this.prisma.studentSession.findMany({
            where: { sessionId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        matricNo: true,
                        program: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async removeStudentFromSession(sessionId, userId) {
        const studentSession = await this.prisma.studentSession.findUnique({
            where: {
                sessionId_userId: {
                    sessionId,
                    userId,
                },
            },
        });
        if (!studentSession) {
            throw new common_1.NotFoundException('Student not found in this session');
        }
        const hasApplication = await this.prisma.application.findFirst({
            where: {
                sessionId,
                userId,
            },
        });
        if (hasApplication) {
            throw new common_1.BadRequestException('Cannot remove student with existing application');
        }
        return this.prisma.studentSession.delete({
            where: {
                sessionId_userId: {
                    sessionId,
                    userId,
                },
            },
        });
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map