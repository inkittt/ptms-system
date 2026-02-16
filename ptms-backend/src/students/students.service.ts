import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService, private storageService: StorageService) {}

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

  async exportStudentsByProgram(program: string) {
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
      const status = latestSession?.status || 'not_enrolled';
      
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
      const status = latestSession?.status || 'not_enrolled';
      
      return {
        matricNo: student.matricNo || '',
        creditsEarned: student.creditsEarned || 0,
        status: status,
      };
    });

    return csvRows;
  }

  async getDashboardData(userId: string) {
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
      throw new NotFoundException('Student not found');
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
          organizationName: true,
          createdAt: true,
          updatedAt: true,
          documents: {
            select: {
              id: true,
              type: true,
              status: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
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
            companyName: application.organizationName,
            createdAt: application.createdAt.toISOString(),
            updatedAt: application.updatedAt.toISOString(),
            documents: application.documents.map(doc => ({
              id: doc.id,
              type: doc.type,
              status: doc.status,
              createdAt: doc.createdAt.toISOString(),
            })),
          }
        : null,
    };
  }

  async getCoordinatorStudents(
    coordinatorId: string,
    filters: {
      sessionId?: string;
      program?: string;
      eligibility?: string;
    }
  ) {
    // Get all sessions coordinated by this coordinator
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

    // Build where clause for filtering
    const where: any = {
      role: 'STUDENT',
      studentSessions: {
        some: {
          sessionId: {
            in: sessionIds,
          },
        },
      },
    };

    // Apply session filter if provided
    if (filters.sessionId) {
      if (!sessionIds.includes(filters.sessionId)) {
        throw new ForbiddenException('You do not have access to this session');
      }
      where.studentSessions = {
        some: {
          sessionId: filters.sessionId,
        },
      };
    }

    // Apply program filter if provided
    if (filters.program) {
      where.program = filters.program;
    }

    // Get all students matching the criteria
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
          take: 1, // Get only the latest application
        },
      },
      orderBy: [
        { program: 'asc' },
        { matricNo: 'asc' },
      ],
    });

    // Transform the data to match the frontend interface
    const transformedStudents = students.map((student) => {
      const latestSession = student.studentSessions[0];
      const latestApplication = student.applications[0];

      // Calculate eligibility based on latest session
      let isEligible = false;
      let sessionCredits = 0;
      let sessionStatus = 'not_enrolled';

      if (latestSession) {
        isEligible = latestSession.isEligible;
        sessionCredits = latestSession.creditsEarned;
        sessionStatus = latestSession.status;
      }

      // Apply eligibility filter if provided
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
        cgpa: student.cgpa || 0, // Use actual CGPA from database
        isEligible: isEligible,
        email: student.email,
        phone: student.phone || '',
        sessionId: latestSession?.sessionId || '',
        sessionYear: latestSession?.session?.year?.toString() || '',
        sessionSemester: latestSession?.session?.semester?.toString() || '',
        currentApplication: latestApplication
          ? {
              status: latestApplication.status,
              company: latestApplication.company?.name || 'Unknown Company',
            }
          : null,
        totalApplications: student.applications.length,
        completedInternships: 0, // This would need to be calculated based on completed applications
      };
    }).filter(Boolean); // Remove null entries from filtering

    return transformedStudents;
  }

  async getStudentDetails(coordinatorId: string, studentId: string) {
    // Get all sessions coordinated by this coordinator
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
      throw new ForbiddenException('No sessions found for this coordinator');
    }

    // Get student with all their information
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
      throw new NotFoundException('Student not found');
    }

    // Verify student is in one of the coordinator's sessions
    if (student.studentSessions.length === 0) {
      throw new ForbiddenException('You do not have access to this student');
    }

    // Transform applications data
    const applications = await Promise.all(student.applications.map(async (app) => ({
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
      documents: await Promise.all(app.documents.map(async (doc) => {
        let accessibleUrl = doc.fileUrl;
        
        // Convert storage paths to signed URLs (expires in 1 hour)
        if (doc.fileUrl && doc.fileUrl !== 'ONLINE_SUBMISSION') {
          try {
            // Check if file exists first
            const fileExists = await this.storageService.exists(doc.fileUrl);
            if (fileExists) {
              accessibleUrl = await this.storageService.getUrl(doc.fileUrl, 3600);
            } else {
              console.warn(`File not found in storage: ${doc.fileUrl}`);
              // Use a fallback to generate PDF URL instead
              accessibleUrl = `/applications/${app.id}/${doc.type.toLowerCase().replace(/_/g, '')}/pdf`;
            }
          } catch (error) {
            console.error(`Failed to generate URL for ${doc.fileUrl}:`, error);
            // Use fallback URL to generate PDF
            accessibleUrl = `/applications/${app.id}/${doc.type.toLowerCase().replace(/_/g, '')}/pdf`;
          }
        }
        
        return {
          id: doc.id,
          type: doc.type,
          status: doc.status,
          fileUrl: accessibleUrl,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };
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
    })));

    // Get latest session info
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
        isEligible: latestSession?.isEligible || false,
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
}
