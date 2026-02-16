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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverviewStats(coordinatorId, sessionId, program) {
        const coordinatedSessions = await this.prisma.session.findMany({
            where: { coordinatorId },
            select: { id: true },
        });
        const sessionIds = coordinatedSessions.map(s => s.id);
        if (sessionIds.length === 0) {
            return {
                totalStudents: 0,
                eligibleStudents: 0,
                totalApplications: 0,
                approvedApplications: 0,
                approved: 0,
                pendingReview: 0,
                changesRequested: 0,
                rejectedApplications: 0,
                overdue: 0,
                sli03Issued: 0,
                ongoingInternships: 0,
                completedInternships: 0,
                avgReviewTime: 0,
                avgApprovalRate: 0,
            };
        }
        const targetSessionIds = sessionId ? [sessionId] : sessionIds;
        if (sessionId && !sessionIds.includes(sessionId)) {
            throw new common_1.ForbiddenException('You do not have access to this session');
        }
        const whereClause = {
            sessionId: { in: targetSessionIds },
        };
        if (program)
            whereClause.user = { program };
        let totalStudents = 0;
        let eligibleStudents = 0;
        if (sessionId) {
            const studentSessionWhere = { sessionId };
            if (program)
                studentSessionWhere.user = { program };
            totalStudents = await this.prisma.studentSession.count({
                where: studentSessionWhere,
            });
            eligibleStudents = await this.prisma.studentSession.count({
                where: Object.assign(Object.assign({}, studentSessionWhere), { isEligible: true }),
            });
        }
        else {
            totalStudents = await this.prisma.user.count({
                where: Object.assign({ role: 'STUDENT' }, (program && { program })),
            });
            eligibleStudents = await this.prisma.user.count({
                where: Object.assign({ role: 'STUDENT' }, (program && { program })),
            });
        }
        const totalApplications = await this.prisma.application.count({
            where: whereClause,
        });
        const approvedApplications = await this.prisma.application.count({
            where: Object.assign(Object.assign({}, whereClause), { status: client_1.ApplicationStatus.APPROVED }),
        });
        const pendingReview = await this.prisma.document.count({
            where: {
                status: client_1.DocumentStatus.PENDING_SIGNATURE,
                application: whereClause,
            },
        });
        const changesRequested = await this.prisma.review.count({
            where: {
                decision: 'REQUEST_CHANGES',
                application: whereClause,
            },
        });
        const rejectedApplications = await this.prisma.application.count({
            where: Object.assign(Object.assign({}, whereClause), { status: client_1.ApplicationStatus.REJECTED }),
        });
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const overdue = await this.prisma.application.count({
            where: Object.assign(Object.assign({}, whereClause), { status: {
                    in: [client_1.ApplicationStatus.SUBMITTED, client_1.ApplicationStatus.UNDER_REVIEW],
                }, createdAt: {
                    lt: sevenDaysAgo,
                } }),
        });
        const sli03Issued = await this.prisma.document.count({
            where: {
                type: 'SLI_03',
                status: client_1.DocumentStatus.SIGNED,
                application: whereClause,
            },
        });
        const ongoingInternships = await this.prisma.application.count({
            where: Object.assign(Object.assign({}, whereClause), { status: client_1.ApplicationStatus.APPROVED }),
        });
        const completedInternships = await this.prisma.application.count({
            where: Object.assign(Object.assign({}, whereClause), { status: client_1.ApplicationStatus.APPROVED, documents: {
                    some: {
                        type: 'BLI_04',
                        status: client_1.DocumentStatus.SIGNED,
                    },
                } }),
        });
        const applications = await this.prisma.application.findMany({
            where: Object.assign(Object.assign({}, whereClause), { status: client_1.ApplicationStatus.APPROVED }),
            select: {
                createdAt: true,
                updatedAt: true,
            },
        });
        let avgReviewTime = 0;
        if (applications.length > 0) {
            const totalDays = applications.reduce((sum, app) => {
                const days = Math.abs((app.updatedAt.getTime() - app.createdAt.getTime()) / (1000 * 60 * 60 * 24));
                return sum + days;
            }, 0);
            avgReviewTime = totalDays / applications.length;
        }
        const avgApprovalRate = totalApplications > 0
            ? Math.round((approvedApplications / totalApplications) * 100)
            : 0;
        return {
            totalStudents,
            eligibleStudents,
            totalApplications,
            approvedApplications: approvedApplications,
            approved: completedInternships,
            pendingReview,
            changesRequested,
            rejectedApplications,
            overdue,
            sli03Issued,
            ongoingInternships,
            completedInternships,
            avgReviewTime: parseFloat(avgReviewTime.toFixed(1)),
            avgApprovalRate,
        };
    }
    async getApplicationTrends(coordinatorId, sessionId, months = 6) {
        const coordinatedSessions = await this.prisma.session.findMany({
            where: { coordinatorId },
            select: { id: true },
        });
        const sessionIds = coordinatedSessions.map(s => s.id);
        if (sessionIds.length === 0) {
            return [];
        }
        if (sessionId && !sessionIds.includes(sessionId)) {
            throw new common_1.ForbiddenException('You do not have access to this session');
        }
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        const targetSessionIds = sessionId ? [sessionId] : sessionIds;
        const whereClause = {
            createdAt: {
                gte: startDate,
            },
            sessionId: { in: targetSessionIds },
        };
        const applications = await this.prisma.application.findMany({
            where: whereClause,
            select: {
                createdAt: true,
                status: true,
            },
        });
        const monthlyData = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = monthNames[date.getMonth()];
            monthlyData[monthKey] = { submitted: 0, approved: 0, rejected: 0 };
        }
        applications.forEach((app) => {
            const monthKey = monthNames[app.createdAt.getMonth()];
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].submitted++;
                if (app.status === client_1.ApplicationStatus.APPROVED) {
                    monthlyData[monthKey].approved++;
                }
                else if (app.status === client_1.ApplicationStatus.REJECTED) {
                    monthlyData[monthKey].rejected++;
                }
            }
        });
        return Object.entries(monthlyData).map(([month, data]) => (Object.assign({ month }, data)));
    }
    async getStatusDistribution(coordinatorId, sessionId, program) {
        const coordinatedSessions = await this.prisma.session.findMany({
            where: { coordinatorId },
            select: { id: true },
        });
        const sessionIds = coordinatedSessions.map(s => s.id);
        if (sessionIds.length === 0) {
            return [];
        }
        if (sessionId && !sessionIds.includes(sessionId)) {
            throw new common_1.ForbiddenException('You do not have access to this session');
        }
        const targetSessionIds = sessionId ? [sessionId] : sessionIds;
        const whereClause = {
            sessionId: { in: targetSessionIds },
        };
        if (program)
            whereClause.user = { program };
        const statusCounts = await this.prisma.application.groupBy({
            by: ['status'],
            where: whereClause,
            _count: true,
        });
        const statusColors = {
            APPROVED: '#10B981',
            UNDER_REVIEW: '#F59E0B',
            SUBMITTED: '#3B82F6',
            REJECTED: '#6B7280',
            DRAFT: '#9CA3AF',
            CANCELLED: '#EF4444',
        };
        const statusNames = {
            APPROVED: 'Approved',
            UNDER_REVIEW: 'Pending Review',
            SUBMITTED: 'Submitted',
            REJECTED: 'Rejected',
            DRAFT: 'Draft',
            CANCELLED: 'Cancelled',
        };
        return statusCounts.map((item) => ({
            name: statusNames[item.status] || item.status,
            value: item._count,
            color: statusColors[item.status] || '#6B7280',
        }));
    }
    async getProgramDistribution(sessionId) {
        const whereClause = {};
        if (sessionId)
            whereClause.sessionId = sessionId;
        const applications = await this.prisma.application.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        program: true,
                    },
                },
            },
        });
        const programData = {};
        applications.forEach((app) => {
            const program = app.user.program || 'Unknown';
            if (!programData[program]) {
                programData[program] = { students: 0, approved: 0, pending: 0, rejected: 0 };
            }
            programData[program].students++;
            if (app.status === client_1.ApplicationStatus.APPROVED) {
                programData[program].approved++;
            }
            else if (app.status === client_1.ApplicationStatus.UNDER_REVIEW) {
                programData[program].pending++;
            }
            else if (app.status === client_1.ApplicationStatus.REJECTED) {
                programData[program].rejected++;
            }
        });
        return Object.entries(programData).map(([program, data]) => (Object.assign({ program }, data)));
    }
    async getTopCompanies(sessionId, limit = 5) {
        const whereClause = {};
        if (sessionId)
            whereClause.sessionId = sessionId;
        const applications = await this.prisma.application.findMany({
            where: Object.assign(Object.assign({}, whereClause), { organizationName: {
                    not: null,
                } }),
            select: {
                organizationName: true,
                organizationAddress: true,
                organizationPhone: true,
                organizationEmail: true,
                contactPersonName: true,
                contactPersonPhone: true,
                company: {
                    select: {
                        industry: true,
                        address: true,
                        contactName: true,
                        contactEmail: true,
                        contactPhone: true,
                    },
                },
            },
        });
        const companyData = {};
        applications.forEach((app) => {
            var _a, _b, _c, _d, _e;
            const company = app.organizationName || 'Unknown';
            if (!companyData[company]) {
                companyData[company] = {
                    students: 0,
                    industry: ((_a = app.company) === null || _a === void 0 ? void 0 : _a.industry) || 'Unknown',
                    address: app.organizationAddress || ((_b = app.company) === null || _b === void 0 ? void 0 : _b.address),
                    contactName: app.contactPersonName || ((_c = app.company) === null || _c === void 0 ? void 0 : _c.contactName),
                    contactEmail: app.organizationEmail || ((_d = app.company) === null || _d === void 0 ? void 0 : _d.contactEmail),
                    contactPhone: app.contactPersonPhone || app.organizationPhone || ((_e = app.company) === null || _e === void 0 ? void 0 : _e.contactPhone),
                };
            }
            companyData[company].students++;
        });
        return Object.entries(companyData)
            .map(([company, data]) => (Object.assign({ company }, data)))
            .sort((a, b) => b.students - a.students)
            .slice(0, limit);
    }
    async getIndustryDistribution(sessionId) {
        const whereClause = {};
        if (sessionId)
            whereClause.sessionId = sessionId;
        const applications = await this.prisma.application.findMany({
            where: Object.assign(Object.assign({}, whereClause), { company: {
                    isNot: null,
                } }),
            select: {
                company: {
                    select: {
                        industry: true,
                    },
                },
            },
        });
        const industryData = {};
        applications.forEach((app) => {
            var _a;
            const industry = ((_a = app.company) === null || _a === void 0 ? void 0 : _a.industry) || 'Others';
            industryData[industry] = (industryData[industry] || 0) + 1;
        });
        const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];
        let colorIndex = 0;
        return Object.entries(industryData)
            .map(([name, value]) => ({
            name,
            value,
            color: colors[colorIndex++ % colors.length],
        }))
            .sort((a, b) => b.value - a.value);
    }
    async getDocumentStats(sessionId) {
        const whereClause = {};
        if (sessionId) {
            whereClause.application = { sessionId };
        }
        const documentTypes = ['SLI_01', 'SLI_03', 'SLI_04', 'BLI_02', 'BLI_03', 'BLI_04', 'DLI_01', 'OFFER_LETTER'];
        const stats = [];
        for (const type of documentTypes) {
            const total = await this.prisma.document.count({
                where: Object.assign(Object.assign({}, whereClause), { type }),
            });
            const approved = await this.prisma.document.count({
                where: Object.assign(Object.assign({}, whereClause), { type, status: client_1.DocumentStatus.SIGNED }),
            });
            const documentsWithChangeRequests = await this.prisma.document.findMany({
                where: Object.assign(Object.assign({}, whereClause), { type }),
                include: {
                    application: {
                        include: {
                            reviews: {
                                where: {
                                    decision: 'REQUEST_CHANGES',
                                },
                                orderBy: {
                                    decidedAt: 'desc',
                                },
                                take: 1,
                            },
                        },
                    },
                },
            });
            const changeRequests = documentsWithChangeRequests.filter(doc => {
                if (doc.application.reviews.length === 0 || doc.status === client_1.DocumentStatus.SIGNED) {
                    return false;
                }
                const latestReview = doc.application.reviews[0];
                return doc.updatedAt <= latestReview.decidedAt;
            }).length;
            const pendingApproval = await this.prisma.document.count({
                where: Object.assign(Object.assign({}, whereClause), { type, status: client_1.DocumentStatus.PENDING_SIGNATURE }),
            });
            const rejected = await this.prisma.document.count({
                where: Object.assign(Object.assign({}, whereClause), { type, status: client_1.DocumentStatus.REJECTED }),
            });
            const documents = await this.prisma.document.findMany({
                where: Object.assign(Object.assign({}, whereClause), { type, status: client_1.DocumentStatus.SIGNED }),
                select: {
                    createdAt: true,
                    updatedAt: true,
                },
            });
            let avgReviewTime = 0;
            if (documents.length > 0) {
                const totalDays = documents.reduce((sum, doc) => {
                    const days = Math.abs((doc.updatedAt.getTime() - doc.createdAt.getTime()) / (1000 * 60 * 60 * 24));
                    return sum + days;
                }, 0);
                avgReviewTime = totalDays / documents.length;
            }
            const displayType = type.replace(/_/g, '-');
            stats.push({
                type: displayType,
                total,
                approved,
                pendingApproval,
                changeRequests,
                rejected,
                avgReviewTime: parseFloat(avgReviewTime.toFixed(1)),
            });
        }
        return stats;
    }
    async getReviewPerformance(sessionId, weeks = 4) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - weeks * 7);
        const whereClause = {
            updatedAt: {
                gte: startDate,
            },
        };
        if (sessionId) {
            whereClause.application = { sessionId };
        }
        const documents = await this.prisma.document.findMany({
            where: whereClause,
            select: {
                createdAt: true,
                updatedAt: true,
            },
        });
        const weeklyData = {};
        for (let i = weeks - 1; i >= 0; i--) {
            const weekKey = `Week ${weeks - i}`;
            weeklyData[weekKey] = { reviewed: 0, totalTime: 0 };
        }
        documents.forEach((doc) => {
            const weeksDiff = Math.floor((new Date().getTime() - doc.updatedAt.getTime()) / (1000 * 60 * 60 * 24 * 7));
            const weekIndex = weeks - weeksDiff - 1;
            if (weekIndex >= 0 && weekIndex < weeks) {
                const weekKey = `Week ${weekIndex + 1}`;
                if (weeklyData[weekKey]) {
                    weeklyData[weekKey].reviewed++;
                    const days = Math.abs((doc.updatedAt.getTime() - doc.createdAt.getTime()) / (1000 * 60 * 60 * 24));
                    weeklyData[weekKey].totalTime += days;
                }
            }
        });
        return Object.entries(weeklyData).map(([week, data]) => ({
            week,
            reviewed: data.reviewed,
            avgTime: data.reviewed > 0 ? parseFloat((data.totalTime / data.reviewed).toFixed(1)) : 0,
        }));
    }
    async getStudentProgress(sessionId) {
        const whereClause = {};
        if (sessionId) {
            whereClause.sessionId = sessionId;
        }
        const studentSessions = await this.prisma.studentSession.findMany({
            where: whereClause,
            include: {
                user: {
                    include: {
                        applications: {
                            where: sessionId ? { sessionId } : {},
                            include: {
                                documents: true,
                                formResponses: true,
                            },
                        },
                    },
                },
            },
        });
        const students = studentSessions.map((ss) => {
            const student = ss.user;
            const application = student.applications[0];
            let status = 'Not Started';
            let progress = 0;
            let completedSteps = 0;
            const totalSteps = 5;
            if (!application) {
                status = 'Not Started';
                progress = 0;
            }
            else if (application.status === 'DRAFT') {
                status = 'Not Started';
                progress = 0;
            }
            else if (application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW') {
                status = 'Application Submitted';
                const hasBLI01 = application.formResponses.some(form => form.formTypeEnum === 'BLI_01');
                const hasBLI02 = application.documents.some(doc => doc.type === 'BLI_02');
                const hasBLI03Online = application.formResponses.some(form => form.formTypeEnum === 'BLI_03');
                const hasBLI03Hardcopy = application.documents.some(doc => doc.type === 'BLI_03_HARDCOPY');
                const hasBLI04 = application.documents.some(doc => doc.type === 'BLI_04');
                completedSteps = [hasBLI01, hasBLI02, hasBLI03Online, hasBLI03Hardcopy, hasBLI04].filter(Boolean).length;
                progress = Math.round((completedSteps / totalSteps) * 100);
            }
            else if (application.status === 'APPROVED') {
                const hasBLI04 = application.documents.some(doc => doc.type === 'BLI_04' && doc.status === client_1.DocumentStatus.SIGNED);
                if (hasBLI04) {
                    status = 'Completed';
                }
                else {
                    status = 'Approved & Ongoing';
                }
                const hasBLI01 = application.formResponses.some(form => form.formTypeEnum === 'BLI_01');
                const hasBLI02 = application.documents.some(doc => doc.type === 'BLI_02');
                const hasBLI03Online = application.formResponses.some(form => form.formTypeEnum === 'BLI_03');
                const hasBLI03Hardcopy = application.documents.some(doc => doc.type === 'BLI_03_HARDCOPY');
                const hasBLI04Doc = application.documents.some(doc => doc.type === 'BLI_04');
                completedSteps = [hasBLI01, hasBLI02, hasBLI03Online, hasBLI03Hardcopy, hasBLI04Doc].filter(Boolean).length;
                progress = Math.round((completedSteps / totalSteps) * 100);
            }
            else if (application.status === 'REJECTED' || application.status === 'CANCELLED') {
                status = 'Not Started';
                progress = 0;
            }
            return {
                id: student.id,
                name: student.name,
                matricNo: student.matricNo,
                program: student.program,
                status,
                progress,
                completedSteps,
                totalSteps,
                applicationStatus: (application === null || application === void 0 ? void 0 : application.status) || null,
                documents: (application === null || application === void 0 ? void 0 : application.documents) || [],
                formResponses: (application === null || application === void 0 ? void 0 : application.formResponses) || [],
            };
        });
        const notStarted = students.filter(s => s.status === 'Not Started').length;
        const submitted = students.filter(s => s.status === 'Application Submitted').length;
        const ongoing = students.filter(s => s.status === 'Approved & Ongoing').length;
        const completed = students.filter(s => s.status === 'Completed').length;
        return {
            students,
            summary: {
                notStarted,
                submitted,
                ongoing,
                completed,
                total: students.length,
            },
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map