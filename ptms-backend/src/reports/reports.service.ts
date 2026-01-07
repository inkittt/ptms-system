import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus, DocumentStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getOverviewStats(sessionId?: string, program?: string) {
    const whereClause: any = {};
    if (sessionId) whereClause.sessionId = sessionId;
    if (program) whereClause.user = { program };

    // Count students enrolled in the session
    let totalStudents = 0;
    let eligibleStudents = 0;

    if (sessionId) {
      // Count students enrolled in this specific session
      const studentSessionWhere: any = { sessionId };
      if (program) studentSessionWhere.user = { program };

      totalStudents = await this.prisma.studentSession.count({
        where: studentSessionWhere,
      });

      eligibleStudents = await this.prisma.studentSession.count({
        where: {
          ...studentSessionWhere,
          isEligible: true,
        },
      });
    } else {
      // If no session specified, count all students
      totalStudents = await this.prisma.user.count({
        where: {
          role: 'STUDENT',
          ...(program && { program }),
        },
      });

      eligibleStudents = await this.prisma.user.count({
        where: {
          role: 'STUDENT',
          ...(program && { program }),
        },
      });
    }

    const totalApplications = await this.prisma.application.count({
      where: whereClause,
    });

    const approvedApplications = await this.prisma.application.count({
      where: {
        ...whereClause,
        status: ApplicationStatus.APPROVED,
      },
    });

    const pendingReview = await this.prisma.application.count({
      where: {
        ...whereClause,
        status: ApplicationStatus.UNDER_REVIEW,
      },
    });

    const changesRequested = await this.prisma.review.count({
      where: {
        decision: 'REQUEST_CHANGES',
        application: whereClause,
      },
    });

    const rejectedApplications = await this.prisma.application.count({
      where: {
        ...whereClause,
        status: ApplicationStatus.REJECTED,
      },
    });

    const sli03Issued = await this.prisma.document.count({
      where: {
        type: 'SLI_03',
        status: DocumentStatus.SIGNED,
        application: whereClause,
      },
    });

    const ongoingInternships = await this.prisma.application.count({
      where: {
        ...whereClause,
        status: ApplicationStatus.APPROVED,
      },
    });

    // Count students who have completed BLI-04 (considered as completed internships)
    const completedInternships = await this.prisma.application.count({
      where: {
        ...whereClause,
        status: ApplicationStatus.APPROVED,
        documents: {
          some: {
            type: 'BLI_04',
            status: DocumentStatus.SIGNED,
          },
        },
      },
    });

    const applications = await this.prisma.application.findMany({
      where: {
        ...whereClause,
        status: ApplicationStatus.APPROVED,
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    let avgReviewTime = 0;
    if (applications.length > 0) {
      const totalDays = applications.reduce((sum, app) => {
        const days = Math.abs(
          (app.updatedAt.getTime() - app.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );
        return sum + days;
      }, 0);
      avgReviewTime = totalDays / applications.length;
    }

    const avgApprovalRate =
      totalApplications > 0
        ? Math.round((approvedApplications / totalApplications) * 100)
        : 0;

    return {
      totalStudents,
      eligibleStudents,
      totalApplications,
      approvedApplications,
      pendingReview,
      changesRequested,
      rejectedApplications,
      sli03Issued,
      ongoingInternships,
      completedInternships,
      avgReviewTime: parseFloat(avgReviewTime.toFixed(1)),
      avgApprovalRate,
    };
  }

  async getApplicationTrends(sessionId?: string, months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const whereClause: any = {
      createdAt: {
        gte: startDate,
      },
    };
    if (sessionId) whereClause.sessionId = sessionId;

    const applications = await this.prisma.application.findMany({
      where: whereClause,
      select: {
        createdAt: true,
        status: true,
      },
    });

    const monthlyData: { [key: string]: { submitted: number; approved: number; rejected: number } } = {};

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
        if (app.status === ApplicationStatus.APPROVED) {
          monthlyData[monthKey].approved++;
        } else if (app.status === ApplicationStatus.REJECTED) {
          monthlyData[monthKey].rejected++;
        }
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    }));
  }

  async getStatusDistribution(sessionId?: string, program?: string) {
    const whereClause: any = {};
    if (sessionId) whereClause.sessionId = sessionId;
    if (program) whereClause.user = { program };

    const statusCounts = await this.prisma.application.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
    });

    const statusColors: { [key: string]: string } = {
      APPROVED: '#10B981',
      UNDER_REVIEW: '#F59E0B',
      SUBMITTED: '#3B82F6',
      REJECTED: '#6B7280',
      DRAFT: '#9CA3AF',
      CANCELLED: '#EF4444',
    };

    const statusNames: { [key: string]: string } = {
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

  async getProgramDistribution(sessionId?: string) {
    const whereClause: any = {};
    if (sessionId) whereClause.sessionId = sessionId;

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

    const programData: {
      [key: string]: { students: number; approved: number; pending: number; rejected: number };
    } = {};

    applications.forEach((app) => {
      const program = app.user.program || 'Unknown';
      if (!programData[program]) {
        programData[program] = { students: 0, approved: 0, pending: 0, rejected: 0 };
      }
      programData[program].students++;
      if (app.status === ApplicationStatus.APPROVED) {
        programData[program].approved++;
      } else if (app.status === ApplicationStatus.UNDER_REVIEW) {
        programData[program].pending++;
      } else if (app.status === ApplicationStatus.REJECTED) {
        programData[program].rejected++;
      }
    });

    return Object.entries(programData).map(([program, data]) => ({
      program,
      ...data,
    }));
  }

  async getTopCompanies(sessionId?: string, limit: number = 5) {
    const whereClause: any = {};
    if (sessionId) whereClause.sessionId = sessionId;

    const applications = await this.prisma.application.findMany({
      where: {
        ...whereClause,
        organizationName: {
          not: null,
        },
      },
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

    const companyData: {
      [key: string]: { 
        students: number; 
        industry: string;
        address?: string;
        contactName?: string;
        contactEmail?: string;
        contactPhone?: string;
      };
    } = {};

    applications.forEach((app) => {
      const company = app.organizationName || 'Unknown';
      if (!companyData[company]) {
        companyData[company] = {
          students: 0,
          industry: app.company?.industry || 'Unknown',
          address: app.organizationAddress || app.company?.address,
          contactName: app.contactPersonName || app.company?.contactName,
          contactEmail: app.organizationEmail || app.company?.contactEmail,
          contactPhone: app.contactPersonPhone || app.organizationPhone || app.company?.contactPhone,
        };
      }
      companyData[company].students++;
    });

    return Object.entries(companyData)
      .map(([company, data]) => ({
        company,
        ...data,
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, limit);
  }

  async getIndustryDistribution(sessionId?: string) {
    const whereClause: any = {};
    if (sessionId) whereClause.sessionId = sessionId;

    const applications = await this.prisma.application.findMany({
      where: {
        ...whereClause,
        company: {
          isNot: null,
        },
      },
      select: {
        company: {
          select: {
            industry: true,
          },
        },
      },
    });

    const industryData: { [key: string]: number } = {};

    applications.forEach((app) => {
      const industry = app.company?.industry || 'Others';
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

  async getDocumentStats(sessionId?: string) {
    const whereClause: any = {};
    if (sessionId) {
      whereClause.application = { sessionId };
    }

    const documentTypes = ['SLI_01', 'SLI_03', 'SLI_04', 'BLI_02', 'BLI_03', 'BLI_04', 'DLI_01', 'OFFER_LETTER'];
    const stats = [];

    for (const type of documentTypes) {
      const total = await this.prisma.document.count({
        where: {
          ...whereClause,
          type,
        },
      });

      const approved = await this.prisma.document.count({
        where: {
          ...whereClause,
          type,
          status: DocumentStatus.SIGNED,
        },
      });

      // Count documents with change requests (reviews with REQUEST_CHANGES decision)
      const documentsWithChangeRequests = await this.prisma.document.findMany({
        where: {
          ...whereClause,
          type,
        },
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

      // Count documents that have a REQUEST_CHANGES review and haven't been reuploaded yet
      // A document is still pending changes if:
      // 1. It has a REQUEST_CHANGES review
      // 2. It's not yet SIGNED
      // 3. The document hasn't been updated after the review (updatedAt <= review decidedAt)
      const changeRequests = documentsWithChangeRequests.filter(doc => {
        if (doc.application.reviews.length === 0 || doc.status === DocumentStatus.SIGNED) {
          return false;
        }
        const latestReview = doc.application.reviews[0];
        // If document was updated after the review, student has reuploaded
        return doc.updatedAt <= latestReview.decidedAt;
      }).length;

      // Count documents pending approval (PENDING_SIGNATURE status)
      const pendingApproval = await this.prisma.document.count({
        where: {
          ...whereClause,
          type,
          status: DocumentStatus.PENDING_SIGNATURE,
        },
      });

      const rejected = await this.prisma.document.count({
        where: {
          ...whereClause,
          type,
          status: DocumentStatus.REJECTED,
        },
      });

      const documents = await this.prisma.document.findMany({
        where: {
          ...whereClause,
          type,
          status: DocumentStatus.SIGNED,
        },
        select: {
          createdAt: true,
          updatedAt: true,
        },
      });

      let avgReviewTime = 0;
      if (documents.length > 0) {
        const totalDays = documents.reduce((sum, doc) => {
          const days = Math.abs(
            (doc.updatedAt.getTime() - doc.createdAt.getTime()) / (1000 * 60 * 60 * 24),
          );
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

  async getReviewPerformance(sessionId?: string, weeks: number = 4) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const whereClause: any = {
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

    const weeklyData: { [key: string]: { reviewed: number; totalTime: number } } = {};

    for (let i = weeks - 1; i >= 0; i--) {
      const weekKey = `Week ${weeks - i}`;
      weeklyData[weekKey] = { reviewed: 0, totalTime: 0 };
    }

    documents.forEach((doc) => {
      const weeksDiff = Math.floor(
        (new Date().getTime() - doc.updatedAt.getTime()) / (1000 * 60 * 60 * 24 * 7),
      );
      const weekIndex = weeks - weeksDiff - 1;
      if (weekIndex >= 0 && weekIndex < weeks) {
        const weekKey = `Week ${weekIndex + 1}`;
        if (weeklyData[weekKey]) {
          weeklyData[weekKey].reviewed++;
          const days = Math.abs(
            (doc.updatedAt.getTime() - doc.createdAt.getTime()) / (1000 * 60 * 60 * 24),
          );
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

  async getStudentProgress(sessionId?: string) {
    const whereClause: any = {};
    if (sessionId) {
      whereClause.sessionId = sessionId;
    }

    // Get all students in the session with their applications and documents
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
      const application = student.applications[0]; // Get first application for this session

      let status = 'Not Started';
      let progress = 0;
      let completedSteps = 0;
      const totalSteps = 5; // BLI-01, BLI-02, BLI-03 Online, BLI-03 Hardcopy, BLI-04

      if (!application) {
        status = 'Not Started';
        progress = 0;
      } else if (application.status === 'DRAFT') {
        status = 'Not Started';
        progress = 0;
      } else if (application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW') {
        status = 'Application Submitted';
        // Count submitted documents and forms
        // BLI-01: form response
        const hasBLI01 = application.formResponses.some(form => form.formTypeEnum === 'BLI_01');
        // BLI-02: document
        const hasBLI02 = application.documents.some(doc => doc.type === 'BLI_02');
        // BLI-03 Online: form response
        const hasBLI03Online = application.formResponses.some(form => form.formTypeEnum === 'BLI_03');
        // BLI-03 Hardcopy: document
        const hasBLI03Hardcopy = application.documents.some(doc => doc.type === 'BLI_03_HARDCOPY');
        // BLI-04: document
        const hasBLI04 = application.documents.some(doc => doc.type === 'BLI_04');
        
        completedSteps = [hasBLI01, hasBLI02, hasBLI03Online, hasBLI03Hardcopy, hasBLI04].filter(Boolean).length;
        progress = Math.round((completedSteps / totalSteps) * 100);
      } else if (application.status === 'APPROVED') {
        // Check if BLI-04 is completed
        const hasBLI04 = application.documents.some(
          doc => doc.type === 'BLI_04' && doc.status === DocumentStatus.SIGNED
        );
        
        if (hasBLI04) {
          status = 'Completed';
        } else {
          status = 'Approved & Ongoing';
        }
        
        // Count all submitted documents and forms
        const hasBLI01 = application.formResponses.some(form => form.formTypeEnum === 'BLI_01');
        const hasBLI02 = application.documents.some(doc => doc.type === 'BLI_02');
        const hasBLI03Online = application.formResponses.some(form => form.formTypeEnum === 'BLI_03');
        const hasBLI03Hardcopy = application.documents.some(doc => doc.type === 'BLI_03_HARDCOPY');
        const hasBLI04Doc = application.documents.some(doc => doc.type === 'BLI_04');
        
        completedSteps = [hasBLI01, hasBLI02, hasBLI03Online, hasBLI03Hardcopy, hasBLI04Doc].filter(Boolean).length;
        progress = Math.round((completedSteps / totalSteps) * 100);
      } else if (application.status === 'REJECTED' || application.status === 'CANCELLED') {
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
        applicationStatus: application?.status || null,
        documents: application?.documents || [],
        formResponses: application?.formResponses || [],
      };
    });

    // Calculate summary counts
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
}
