import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { UpdateBli03Dto } from './dto/update-bli03.dto';
import { ApplicationStatus, DocumentType, DocumentStatus, Decision } from '@prisma/client';
import { generateBLI01, validateBLI01Data } from './utils/bli01-generator';
import { generateBLI03, validateBLI03Data } from './utils/bli03-generator';
import { generateBLI04, validateBLI04Data } from './utils/bli04-generator';
import { generateSLI03, validateSLI03Data } from './utils/sli03-generator';
import { generateSLI04, validateSLI04Data } from './utils/sli04-generator';
import { generateDLI01, validateDLI01Data } from './utils/dli01-generator';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async createApplication(userId: string, dto: CreateApplicationDto) {
    // Verify session exists and is active
    const session = await this.prisma.session.findUnique({
      where: { id: dto.trainingSession },
    });

    if (!session) {
      throw new NotFoundException('Training session not found');
    }

    if (!session.isActive) {
      throw new BadRequestException('Training session is not active');
    }

    // Check if user already has an application for this session
    const existingApplication = await this.prisma.application.findFirst({
      where: {
        userId: userId,
        sessionId: dto.trainingSession,
        status: {
          notIn: [ApplicationStatus.CANCELLED, ApplicationStatus.REJECTED],
        },
      },
      include: {
        formResponses: true,
        documents: true,
        reviews: true,
      },
    });

    // If existing application found, delete it to allow regeneration
    if (existingApplication) {
      // Delete related records first (due to foreign key constraints)
      await this.prisma.formResponse.deleteMany({
        where: { applicationId: existingApplication.id },
      });

      await this.prisma.document.deleteMany({
        where: { applicationId: existingApplication.id },
      });

      await this.prisma.review.deleteMany({
        where: { applicationId: existingApplication.id },
      });

      // Delete the application itself
      await this.prisma.application.delete({
        where: { id: existingApplication.id },
      });
    }

    // Update user profile with BLI-01 form data
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.studentName,
        matricNo: dto.matricNo,
        program: dto.program,
        faculty: dto.faculty,
        cgpa: parseFloat(dto.cgpa),
        phone: dto.icNo, // Store IC in phone field temporarily, or add icNo field to User model
      },
    });

    // Create the application
    const application = await this.prisma.application.create({
      data: {
        userId: userId,
        sessionId: dto.trainingSession,
        status: ApplicationStatus.DRAFT,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            matricNo: true,
            program: true,
            role: true,
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
    });

    // Store BLI-01 form data in FormResponse
    await this.prisma.formResponse.create({
      data: {
        applicationId: application.id,
        formTypeEnum: 'BLI_01',
        payloadJSON: {
          studentName: dto.studentName,
          icNo: dto.icNo,
          matricNo: dto.matricNo,
          cgpa: dto.cgpa,
          program: dto.program,
          faculty: dto.faculty,
          submittedAt: new Date().toISOString(),
        },
      },
    });

    return application;
  }

  async getApplicationsByUser(userId: string) {
    const applications = await this.prisma.application.findMany({
      where: { userId },
      include: {
        session: {
          select: {
            id: true,
            name: true,
            year: true,
            semester: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        documents: {
          select: {
            id: true,
            type: true,
            fileUrl: true,
            status: true,
            createdAt: true,
          },
        },
        formResponses: {
          select: {
            id: true,
            formTypeEnum: true,
            payloadJSON: true,
            submittedAt: true,
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
                id: true,
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
    });

    return applications;
  }

  async getApplicationById(applicationId: string, userId: string) {
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: userId,
      },
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
        session: {
          select: {
            id: true,
            name: true,
            year: true,
            semester: true,
          },
        },
        company: true,
        documents: true,
        formResponses: true,
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async getActiveSessions() {
    return this.prisma.session.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        year: true,
        semester: true,
        minCredits: true,
        minWeeks: true,
        maxWeeks: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        matricNo: true,
        program: true,
        phone: true,
        creditsEarned: true,
        studentSessions: {
          where: {
            status: 'active',
          },
          select: {
            sessionId: true,
            session: {
              select: {
                id: true,
                name: true,
                year: true,
                semester: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      assignedSession: user.studentSessions[0]?.session || null,
    };
  }

  async generateBLI01PDF(applicationId: string, userId: string): Promise<Buffer> {
    // Get application with all related data
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            matricNo: true,
            program: true,
            phone: true,
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
        formResponses: {
          where: {
            formTypeEnum: 'BLI_01',
          },
          orderBy: {
            submittedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Get BLI-01 form data from form responses
    const bli01FormData = application.formResponses[0]?.payloadJSON as any;

    if (!bli01FormData) {
      throw new NotFoundException('BLI-01 form data not found for this application');
    }

    // Prepare data for PDF generation
    const pdfData = {
      student: {
        fullName: bli01FormData.studentName || application.user.name,
        icNumber: bli01FormData.icNo || application.user.phone || 'N/A',
        matricNumber: bli01FormData.matricNo || application.user.matricNo,
        program: bli01FormData.program || application.user.program,
        faculty: bli01FormData.faculty || 'N/A',
        cgpa: bli01FormData.cgpa || 'N/A',
        phone: application.user.phone,
        email: application.user.email,
      },
      session: {
        id: application.session.id,
        name: application.session.name,
        year: application.session.year,
        semester: application.session.semester,
      },
      application: {
        id: application.id,
        createdAt: application.createdAt,
      },
    };

    // Validate data
    validateBLI01Data(pdfData);

    // Generate PDF
    const pdfBuffer = await generateBLI01(pdfData);

    return pdfBuffer;
  }

  async uploadDocument(
    applicationId: string,
    userId: string,
    file: Express.Multer.File,
    documentType: DocumentType,
  ) {
    // Verify application exists and belongs to user
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: userId,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Check if document already exists for this application and type
    const existingDocument = await this.prisma.document.findFirst({
      where: {
        applicationId: applicationId,
        type: documentType,
      },
    });

    let document;

    if (existingDocument) {
      // Re-upload scenario: Update existing document
      // Delete old file from filesystem
      const fs = require('fs');
      const path = require('path');
      
      if (existingDocument.fileUrl && fs.existsSync(existingDocument.fileUrl)) {
        try {
          fs.unlinkSync(existingDocument.fileUrl);
        } catch (error) {
          console.error('Error deleting old file:', error);
          // Continue even if deletion fails
        }
      }

      // Update document with new file and reset status
      document = await this.prisma.document.update({
        where: { id: existingDocument.id },
        data: {
          fileUrl: file.path,
          status: DocumentStatus.PENDING_SIGNATURE,
          version: existingDocument.version + 1,
          updatedAt: new Date(),
        },
        include: {
          application: {
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
              session: {
                select: {
                  id: true,
                  name: true,
                  year: true,
                  semester: true,
                },
              },
            },
          },
        },
      });
    } else {
      // First upload: Create new document record
      document = await this.prisma.document.create({
        data: {
          applicationId: applicationId,
          type: documentType,
          fileUrl: file.path,
          status: DocumentStatus.PENDING_SIGNATURE,
          version: 1,
        },
        include: {
          application: {
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
              session: {
                select: {
                  id: true,
                  name: true,
                  year: true,
                  semester: true,
                },
              },
            },
          },
        },
      });
    }

    // Update application status if needed
    if (application.status === ApplicationStatus.DRAFT) {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.SUBMITTED },
      });
    }

    return document;
  }

  async getPendingDocuments(
    coordinatorId: string,
    filters: {
      sessionId?: string;
      status?: string;
      program?: string;
    },
  ) {
    // First, get all sessions coordinated by this coordinator
    const coordinatedSessions = await this.prisma.session.findMany({
      where: {
        coordinatorId: coordinatorId,
      },
      select: {
        id: true,
      },
    });

    const sessionIds = coordinatedSessions.map((session) => session.id);

    // If coordinator has no sessions, return empty array
    if (sessionIds.length === 0) {
      return [];
    }

    const where: any = {
      application: {
        sessionId: {
          in: sessionIds, // Only documents from coordinator's sessions
        },
      },
    };

    // Apply status filter - if not specified, show all documents
    if (filters.status) {
      where.status = filters.status;
    }
    // If no status filter, default to showing documents that need attention or have been reviewed
    else {
      where.status = {
        in: [
          DocumentStatus.PENDING_SIGNATURE,
          DocumentStatus.DRAFT,
          DocumentStatus.SIGNED,
          DocumentStatus.REJECTED,
        ],
      };
    }

    // Apply additional filters
    if (filters.sessionId) {
      // Verify the sessionId is one of the coordinator's sessions
      if (!sessionIds.includes(filters.sessionId)) {
        throw new ForbiddenException(
          'You do not have access to this session',
        );
      }
      where.application.sessionId = filters.sessionId;
    }

    const documents = await this.prisma.document.findMany({
      where,
      include: {
        application: {
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
            session: {
              select: {
                id: true,
                name: true,
                year: true,
                semester: true,
                coordinatorId: true,
              },
            },
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Apply program filter if provided
    if (filters.program) {
      return documents.filter(
        (doc) => doc.application.user.program === filters.program,
      );
    }

    return documents;
  }

  async getDocumentById(documentId: string, coordinatorId?: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        application: {
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
            session: {
              select: {
                id: true,
                name: true,
                year: true,
                semester: true,
                coordinatorId: true,
              },
            },
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            reviews: {
              include: {
                reviewer: {
                  select: {
                    id: true,
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
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // If coordinator is accessing, verify they coordinate this session
    if (coordinatorId) {
      if (document.application.session.coordinatorId !== coordinatorId) {
        throw new ForbiddenException(
          'You do not have access to this document',
        );
      }
    }

    return document;
  }

  async reviewDocument(
    documentId: string,
    reviewerId: string,
    reviewDto: ReviewDocumentDto,
  ) {
    // Get document with application and session
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        application: {
          include: {
            session: {
              select: {
                id: true,
                coordinatorId: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Verify the reviewer is the coordinator of this session
    if (document.application.session.coordinatorId !== reviewerId) {
      throw new ForbiddenException(
        'You do not have permission to review this document',
      );
    }

    // Create review record
    const review = await this.prisma.review.create({
      data: {
        applicationId: document.applicationId,
        reviewerId: reviewerId,
        decision: reviewDto.decision,
        comments: reviewDto.comments,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update document status based on decision
    let newDocumentStatus: DocumentStatus;
    let newApplicationStatus: ApplicationStatus;

    switch (reviewDto.decision) {
      case Decision.APPROVE:
        newDocumentStatus = DocumentStatus.SIGNED;
        newApplicationStatus = ApplicationStatus.APPROVED;
        break;
      case Decision.REQUEST_CHANGES:
        newDocumentStatus = DocumentStatus.DRAFT;
        newApplicationStatus = ApplicationStatus.UNDER_REVIEW;
        break;
      case Decision.REJECT:
        newDocumentStatus = DocumentStatus.REJECTED;
        newApplicationStatus = ApplicationStatus.REJECTED;
        break;
    }

    // Update document status
    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: newDocumentStatus },
    });

    // Update application status
    await this.prisma.application.update({
      where: { id: document.applicationId },
      data: { status: newApplicationStatus },
    });

    return review;
  }

  async updateBli03Data(applicationId: string, userId: string, dto: UpdateBli03Dto) {
    // Verify application exists and belongs to user
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this application');
    }

    // Delete all existing REQUEST_CHANGES reviews when student resubmits
    await this.prisma.review.deleteMany({
      where: {
        applicationId: applicationId,
        decision: Decision.REQUEST_CHANGES,
      },
    });

    // Find or create company record
    let company = await this.prisma.company.findFirst({
      where: {
        name: dto.organizationName,
        address: dto.organizationAddress,
      },
    });

    if (!company) {
      // Create new company record
      company = await this.prisma.company.create({
        data: {
          name: dto.organizationName,
          address: dto.organizationAddress,
          contactName: dto.contactPersonName,
          contactEmail: dto.organizationEmail,
          contactPhone: dto.organizationPhone,
          fax: dto.organizationFax,
        },
      });
    } else {
      // Update existing company record with latest information
      company = await this.prisma.company.update({
        where: { id: company.id },
        data: {
          contactName: dto.contactPersonName,
          contactEmail: dto.organizationEmail,
          contactPhone: dto.organizationPhone,
          fax: dto.organizationFax,
        },
      });
    }

    // Update application with BLI03 data and link to company
    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        // Link to company
        companyId: company.id,
        
        // Student contact information
        studentPhone: dto.studentPhone,
        studentEmail: dto.studentEmail,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        
        // Organization information
        organizationName: dto.organizationName,
        organizationAddress: dto.organizationAddress,
        organizationPhone: dto.organizationPhone,
        organizationFax: dto.organizationFax,
        organizationEmail: dto.organizationEmail,
        contactPersonName: dto.contactPersonName,
        contactPersonPhone: dto.contactPersonPhone,
        organizationDeclarationAccepted: dto.organizationDeclaration,
        
        // Additional BLI03 information
        reportingPeriod: dto.reportingPeriod,
        roleTasksSummary: dto.roleTasksSummary,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        emergencyContactEmail: dto.emergencyContactEmail,
      },
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
        session: {
          select: {
            id: true,
            name: true,
            year: true,
            semester: true,
          },
        },
        company: true,
      },
    });

    // Store BLI03 form data in FormResponse for coordinator viewing
    await this.prisma.formResponse.create({
      data: {
        applicationId: applicationId,
        formTypeEnum: 'BLI_03',
        payloadJSON: {
          studentPhone: dto.studentPhone,
          studentEmail: dto.studentEmail,
          startDate: dto.startDate,
          endDate: dto.endDate,
          organizationName: dto.organizationName,
          organizationAddress: dto.organizationAddress,
          organizationPhone: dto.organizationPhone,
          organizationFax: dto.organizationFax,
          organizationEmail: dto.organizationEmail,
          contactPersonName: dto.contactPersonName,
          contactPersonPhone: dto.contactPersonPhone,
          organizationDeclaration: dto.organizationDeclaration,
          reportingPeriod: dto.reportingPeriod,
          roleTasksSummary: dto.roleTasksSummary,
          emergencyContactName: dto.emergencyContactName,
          emergencyContactPhone: dto.emergencyContactPhone,
          emergencyContactEmail: dto.emergencyContactEmail,
          submittedAt: new Date().toISOString(),
        },
      },
    });

    // Check if BLI03 document already exists
    const existingBli03Document = await this.prisma.document.findFirst({
      where: {
        applicationId: applicationId,
        type: 'BLI_03',
      },
    });

    if (existingBli03Document) {
      // Update existing document - reset status and increment version
      await this.prisma.document.update({
        where: { id: existingBli03Document.id },
        data: {
          status: 'PENDING_SIGNATURE',
          version: existingBli03Document.version + 1,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new Document record for BLI03 online submission
      await this.prisma.document.create({
        data: {
          applicationId: applicationId,
          type: 'BLI_03',
          fileUrl: 'ONLINE_SUBMISSION', // Mark as online submission (no file)
          status: 'PENDING_SIGNATURE',
          version: 1,
        },
      });
    }

    return updatedApplication;
  }

  async submitBli04(applicationId: string, userId: string, bli04Data: any) {
    // Verify application exists and belongs to user
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('You do not have permission to submit this form');
    }

    // Delete all existing REQUEST_CHANGES reviews when student resubmits
    await this.prisma.review.deleteMany({
      where: {
        applicationId: applicationId,
        decision: Decision.REQUEST_CHANGES,
      },
    });

    // Store BLI-04 form data in FormResponse
    const formResponse = await this.prisma.formResponse.create({
      data: {
        applicationId: applicationId,
        formTypeEnum: 'BLI_04',
        payloadJSON: {
          ...bli04Data,
          submittedAt: new Date().toISOString(),
        },
      },
    });

    // Check if BLI-04 document already exists
    const existingBli04Document = await this.prisma.document.findFirst({
      where: {
        applicationId: applicationId,
        type: 'BLI_04',
      },
    });

    let document;
    if (existingBli04Document) {
      // Update existing document - reset status and increment version
      document = await this.prisma.document.update({
        where: { id: existingBli04Document.id },
        data: {
          status: DocumentStatus.PENDING_SIGNATURE,
          version: existingBli04Document.version + 1,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new Document record for BLI-04 (requires coordinator review)
      document = await this.prisma.document.create({
        data: {
          applicationId: applicationId,
          type: DocumentType.BLI_04,
          fileUrl: 'ONLINE_SUBMISSION', // Mark as online submission
          status: DocumentStatus.PENDING_SIGNATURE, // Requires coordinator review
          version: 1,
        },
      });
    }

    return {
      formResponse,
      document,
    };
  }

  async getBli03Submissions(coordinatorId: string, filters?: { sessionId?: string; program?: string }) {
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
      return [];
    }

    const where: any = {
      sessionId: {
        in: sessionIds,
      },
      formResponses: {
        some: {
          formTypeEnum: 'BLI_03',
        },
      },
    };

    if (filters?.sessionId) {
      if (!sessionIds.includes(filters.sessionId)) {
        throw new ForbiddenException('You do not have access to this session');
      }
      where.sessionId = filters.sessionId;
    }

    const applications = await this.prisma.application.findMany({
      where,
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
        session: {
          select: {
            id: true,
            name: true,
            year: true,
            semester: true,
          },
        },
        formResponses: {
          where: {
            formTypeEnum: 'BLI_03',
          },
          orderBy: {
            submittedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Apply program filter if provided
    if (filters?.program) {
      return applications.filter(
        (app) => app.user.program === filters.program,
      );
    }

    return applications;
  }

  async getBli03SubmissionById(applicationId: string, coordinatorId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
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
        session: {
          select: {
            id: true,
            name: true,
            year: true,
            semester: true,
            coordinatorId: true,
          },
        },
        formResponses: {
          orderBy: {
            submittedAt: 'desc',
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify coordinator has access
    if (application.session.coordinatorId !== coordinatorId) {
      throw new ForbiddenException('You do not have access to this submission');
    }

    return application;
  }

  async generateBLI03PDF(applicationId: string, userId: string): Promise<Buffer> {
    // Get application with all related data
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            matricNo: true,
            program: true,
            phone: true,
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
        formResponses: {
          where: {
            formTypeEnum: 'BLI_03',
          },
          orderBy: {
            submittedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Get BLI-03 form data from form responses
    const bli03FormData = application.formResponses[0]?.payloadJSON as any;

    if (!bli03FormData) {
      throw new NotFoundException('BLI-03 form data not found for this application');
    }

    // Prepare data for PDF generation
    const pdfData = {
      student: {
        name: application.user.name,
        matricNo: application.user.matricNo || 'N/A',
        program: application.user.program || 'N/A',
        phone: bli03FormData.studentPhone || application.user.phone || 'N/A',
        email: bli03FormData.studentEmail || application.user.email || 'N/A',
        startDate: bli03FormData.startDate || application.startDate?.toISOString().split('T')[0] || 'N/A',
        endDate: bli03FormData.endDate || application.endDate?.toISOString().split('T')[0] || 'N/A',
      },
      organization: {
        name: bli03FormData.organizationName || application.organizationName || 'N/A',
        address: bli03FormData.organizationAddress || application.organizationAddress || 'N/A',
        phone: bli03FormData.organizationPhone || application.organizationPhone || 'N/A',
        fax: bli03FormData.organizationFax || application.organizationFax || '',
        email: bli03FormData.organizationEmail || application.organizationEmail || 'N/A',
        contactPersonName: bli03FormData.contactPersonName || application.contactPersonName || 'N/A',
        contactPersonPhone: bli03FormData.contactPersonPhone || application.contactPersonPhone || 'N/A',
      },
      application: {
        id: application.id,
        createdAt: application.createdAt,
      },
    };

    // Validate data
    validateBLI03Data(pdfData);

    // Generate PDF
    const pdfBuffer = await generateBLI03(pdfData);

    return pdfBuffer;
  }

  async generateSLI03PDF(applicationId: string, userId: string): Promise<Buffer> {
    // Get application with all related data
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            matricNo: true,
            program: true,
            phone: true,
          },
        },
        session: {
          select: {
            id: true,
            name: true,
            year: true,
            semester: true,
            coordinator: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        formResponses: {
          where: {
            OR: [
              { formTypeEnum: 'BLI_01' },
              { formTypeEnum: 'BLI_03' },
            ],
          },
          orderBy: {
            submittedAt: 'desc',
          },
        },
        documents: {
          where: {
            OR: [
              { type: DocumentType.BLI_03 },
              { type: DocumentType.BLI_03_HARDCOPY },
            ],
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Check if both BLI-03 documents are approved
    const bli03Online = application.documents.find(d => d.type === DocumentType.BLI_03);
    const bli03Hardcopy = application.documents.find(d => d.type === DocumentType.BLI_03_HARDCOPY);

    if (!bli03Online || !bli03Hardcopy) {
      throw new BadRequestException('BLI-03 documents not found');
    }

    if (bli03Online.status !== DocumentStatus.SIGNED || bli03Hardcopy.status !== DocumentStatus.SIGNED) {
      throw new BadRequestException('BLI-03 must be fully approved before generating SLI-03');
    }

    // Get BLI-01 and BLI-03 form data
    const bli01FormData = application.formResponses.find(f => f.formTypeEnum === 'BLI_01')?.payloadJSON as any;
    const bli03FormData = application.formResponses.find(f => f.formTypeEnum === 'BLI_03')?.payloadJSON as any;

    if (!bli03FormData) {
      throw new NotFoundException('BLI-03 form data not found');
    }

    // Calculate training duration in weeks
    const startDate = new Date(bli03FormData.startDate || application.startDate);
    const endDate = new Date(bli03FormData.endDate || application.endDate);
    const durationWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

    // Prepare data for PDF generation
    const pdfData = {
      student: {
        fullName: application.user.name,
        matricNumber: application.user.matricNo || 'N/A',
        icNumber: bli01FormData?.icNumber || 'N/A',
        program: application.user.program || 'N/A',
        faculty: 'Fakulti Sains Komputer dan Matematik',
        email: application.user.email || 'N/A',
      },
      company: {
        name: bli03FormData.organizationName || application.organizationName || 'N/A',
        address: bli03FormData.organizationAddress || application.organizationAddress || 'N/A',
        city: bli03FormData.organizationCity || 'N/A',
        state: bli03FormData.organizationState || 'N/A',
        postcode: bli03FormData.organizationPostcode || 'N/A',
        attentionTo: bli03FormData.contactPerson || bli03FormData.contactName || '',
      },
      training: {
        startDate: startDate,
        endDate: endDate,
        duration: durationWeeks,
      },
      session: {
        name: application.session.name,
        year: application.session.year,
        semester: application.session.semester,
      },
      application: {
        id: application.id,
        approvedAt: bli03Hardcopy.updatedAt,
      },
      coordinator: {
        name: application.session.coordinator?.name || 'Albin Lemuel Kushan',
        position: 'Penyelaras Latihan Industri CDCS251/CS251',
        email: application.session.coordinator?.email || 'albin1841@uitm.edu.my',
        phone: application.session.coordinator?.phone || '013-8218885',
      },
    };

    // Validate data
    validateSLI03Data(pdfData);

    // Generate PDF
    const pdfBuffer = await generateSLI03(pdfData);

    return pdfBuffer;
  }

  async generateDLI01PDF(applicationId: string, userId: string): Promise<Buffer> {
    // Get application with all related data
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            matricNo: true,
            program: true,
            phone: true,
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
        formResponses: {
          where: {
            OR: [
              { formTypeEnum: 'BLI_01' },
              { formTypeEnum: 'BLI_03' },
            ],
          },
          orderBy: {
            submittedAt: 'desc',
          },
        },
        documents: {
          where: {
            OR: [
              { type: DocumentType.BLI_03 },
              { type: DocumentType.BLI_03_HARDCOPY },
            ],
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Check if both BLI-03 documents are approved
    const bli03Online = application.documents.find(d => d.type === DocumentType.BLI_03);
    const bli03Hardcopy = application.documents.find(d => d.type === DocumentType.BLI_03_HARDCOPY);

    if (!bli03Online || !bli03Hardcopy) {
      throw new BadRequestException('BLI-03 documents not found');
    }

    if (bli03Online.status !== DocumentStatus.SIGNED || bli03Hardcopy.status !== DocumentStatus.SIGNED) {
      throw new BadRequestException('BLI-03 must be fully approved before generating DLI-01');
    }

    // Get form data
    const bli01FormData = application.formResponses.find(f => f.formTypeEnum === 'BLI_01')?.payloadJSON as any;
    const bli03FormData = application.formResponses.find(f => f.formTypeEnum === 'BLI_03')?.payloadJSON as any;

    if (!bli01FormData || !bli03FormData) {
      throw new NotFoundException('Required form data not found');
    }

    // Calculate training duration in weeks
    const startDate = new Date(bli03FormData.startDate || application.startDate);
    const endDate = new Date(bli03FormData.endDate || application.endDate);
    const durationWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

    // Prepare data for PDF generation
    const pdfData = {
      student: {
        fullName: application.user.name,
        icNumber: bli01FormData.icNo || 'N/A',
        matricNumber: application.user.matricNo || 'N/A',
        program: application.user.program || 'N/A',
        faculty: 'Fakulti Sains Komputer dan Matematik',
        phone: bli03FormData.studentPhone || application.user.phone || 'N/A',
        email: bli03FormData.studentEmail || application.user.email || 'N/A',
        address: bli01FormData.address || 'N/A',
      },
      company: {
        name: bli03FormData.organizationName || application.organizationName || 'N/A',
        address: bli03FormData.organizationAddress || application.organizationAddress || 'N/A',
        city: bli03FormData.organizationCity || 'N/A',
        state: bli03FormData.organizationState || 'N/A',
        postcode: bli03FormData.organizationPostcode || 'N/A',
      },
      training: {
        startDate: startDate,
        endDate: endDate,
        duration: durationWeeks,
      },
      coordinator: {
        name: 'Koordinator Latihan Industri',
        email: 'li.fskm@uitm.edu.my',
        phone: '06-2645000',
      },
      session: {
        name: application.session.name,
        year: application.session.year,
        semester: application.session.semester,
      },
      application: {
        id: application.id,
      },
    };

    // Validate data
    validateDLI01Data(pdfData);

    // Generate PDF
    const pdfBuffer = await generateDLI01(pdfData);

    return pdfBuffer;
  }

  async generateBLI04PDF(applicationId: string, userId?: string): Promise<Buffer> {
    // Get application with all related data
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        ...(userId && { userId: userId }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            matricNo: true,
            program: true,
            phone: true,
          },
        },
        formResponses: {
          where: {
            OR: [
              { formTypeEnum: 'BLI_03' },
              { formTypeEnum: 'BLI_04' },
            ],
          },
          orderBy: {
            submittedAt: 'desc',
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Get BLI-03 and BLI-04 form data
    const bli03FormData = application.formResponses.find(f => f.formTypeEnum === 'BLI_03')?.payloadJSON as any;
    const bli04FormData = application.formResponses.find(f => f.formTypeEnum === 'BLI_04')?.payloadJSON as any;

    if (!bli03FormData) {
      throw new NotFoundException('BLI-03 form data not found. Please complete BLI-03 first.');
    }

    // Prepare data for PDF generation
    const pdfData = {
      student: {
        fullName: application.user.name,
        matricNumber: application.user.matricNo || 'N/A',
        program: application.user.program || 'N/A',
      },
      company: {
        name: bli03FormData.organizationName || application.organizationName || '',
        address: bli03FormData.organizationAddress || application.organizationAddress || '',
        department: bli04FormData?.department || '',
        supervisorName: bli04FormData?.supervisorName || bli03FormData.supervisorName || '',
        supervisorPhone: bli04FormData?.supervisorPhone || bli03FormData.supervisorPhone || '',
        supervisorFax: bli04FormData?.supervisorFax || '',
        supervisorEmail: bli04FormData?.supervisorEmail || bli03FormData.supervisorEmail || '',
      },
      training: {
        startDate: bli03FormData.startDate ? new Date(bli03FormData.startDate) : new Date(),
        organizationSector: bli04FormData?.organizationSector || [],
        industryCode: bli04FormData?.industryCode || [],
      },
    };

    // Validate data
    validateBLI04Data(pdfData);

    // Generate PDF
    const pdfBuffer = await generateBLI04(pdfData);

    return pdfBuffer;
  }

  async generateSLI04PDF(applicationId: string, userId: string, sli04Data: any): Promise<Buffer> {
    // Get application with all related data
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            matricNo: true,
            program: true,
            phone: true,
          },
        },
        company: {
          select: {
            name: true,
            address: true,
          },
        },
        formResponses: {
          where: {
            formTypeEnum: 'BLI_01',
          },
          orderBy: {
            submittedAt: 'desc',
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Get BLI-01 form data for additional student info
    const bli01FormData = application.formResponses[0]?.payloadJSON as any;

    // Prepare data for PDF generation
    const pdfData = {
      student: {
        fullName: application.user.name,
        matricNumber: application.user.matricNo || 'N/A',
        program: application.user.program || 'N/A',
        phone: application.user.phone || bli01FormData?.phone || 'N/A',
        email: application.user.email || 'N/A',
      },
      company: {
        name: sli04Data.companyName || application.company?.name || 'N/A',
        position: sli04Data.position || 'N/A',
        address: application.company?.address || 'N/A',
      },
      rejection: {
        referenceNumber: sli04Data.referenceNumber || 'N/A',
        letterDate: new Date(),
        offerDate: sli04Data.offerDate ? new Date(sli04Data.offerDate) : new Date(),
      },
      application: {
        id: application.id,
      },
    };

    // Validate data
    validateSLI04Data(pdfData);

    // Generate PDF
    const pdfBuffer = await generateSLI04(pdfData);

    return pdfBuffer;
  }

  async getStudentDocuments(applicationId: string, userId: string) {
    // Verify the application belongs to the user
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: userId,
      },
      include: {
        documents: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            matricNo: true,
            program: true,
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
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Return documents grouped by type
    return {
      application: {
        id: application.id,
        status: application.status,
        user: application.user,
        session: application.session,
      },
      documents: application.documents,
    };
  }
}
