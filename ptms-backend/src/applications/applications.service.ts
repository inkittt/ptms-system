import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { UpdateBli03Dto } from './dto/update-bli03.dto';
import { SubmitBli03Dto } from './dto/submit-bli03.dto';
import { ApproveBli03Dto } from './dto/approve-bli03.dto';
import { ApplicationStatus, DocumentType, DocumentStatus, Decision } from '@prisma/client';
import { generateBLI01, validateBLI01Data } from './utils/bli01-generator';
import { generateBLI03, validateBLI03Data } from './utils/bli03-generator';
import { generateBLI04, validateBLI04Data } from './utils/bli04-generator';
import { generateSLI03, validateSLI03Data } from './utils/sli03-generator';
import { generateSLI04, validateSLI04Data } from './utils/sli04-generator';
import { generateDLI01, validateDLI01Data } from './utils/dli01-generator';
import { randomBytes } from 'crypto';
import archiver from 'archiver';
import { Readable } from 'stream';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private notificationsService: NotificationsService,
  ) {}


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
            supervisorSignature: true,
            supervisorSignatureType: true,
            supervisorSignedAt: true,
            supervisorName: true,
            verifiedBy: true,
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

  async generateBLI01PDF(applicationId: string, userId: string | null): Promise<Buffer> {
    // Check if PDF already exists in Document records
    const existingDocument = await this.prisma.document.findFirst({
      where: {
        applicationId: applicationId,
        type: DocumentType.BLI_01,
      },
    });

    // If document exists and has a stored file, retrieve it
    if (existingDocument && existingDocument.fileUrl !== 'ONLINE_SUBMISSION') {
      try {
        console.log(`✅ [BLI-01] Found existing document, retrieving from storage: ${existingDocument.fileUrl}`);
        const pdfBuffer = await this.storageService.download(existingDocument.fileUrl);
        console.log(`✅ [BLI-01] Successfully retrieved PDF from storage (${pdfBuffer.length} bytes)`);
        return pdfBuffer;
      } catch (error) {
        console.error('❌ [BLI-01] Failed to retrieve stored PDF, regenerating:', error);
        // Continue to regenerate if retrieval fails
      }
    } else {
      console.log('📝 [BLI-01] No existing document found, will generate new PDF');
    }

    // Get application with all related data
    const whereClause: any = { id: applicationId };
    if (userId !== null) {
      whereClause.userId = userId;
    }

    const application = await this.prisma.application.findFirst({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            matricNo: true,
            icNumber: true,
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
            trainingStartDate: true,
            trainingEndDate: true,
            minWeeks: true,
            maxWeeks: true,
            deadlinesJSON: true,
            referenceNumberFormat: true,
            coordinator: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                program: true,
                faculty: true,
                campus: true,
                campusAddress: true,
                campusCity: true,
                campusPhone: true,
                universityBranch: true,
              },
            },
            coordinatorSignature: true,
            coordinatorSignatureType: true,
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

    // Parse deadlines from deadlinesJSON (fallback if proper fields not set)
    const deadlines = application.session.deadlinesJSON as any || {};
    
    // Prepare data for PDF generation
    const pdfData = {
      student: {
        fullName: bli01FormData.studentName || application.user.name,
        icNumber: bli01FormData.icNo || application.user.icNumber || 'N/A',
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
        startDate: application.session.trainingStartDate || (deadlines.trainingStartDate ? new Date(deadlines.trainingStartDate) : undefined),
        endDate: application.session.trainingEndDate || (deadlines.trainingEndDate ? new Date(deadlines.trainingEndDate) : undefined),
        applicationDeadline: deadlines.applicationDeadline ? new Date(deadlines.applicationDeadline) : undefined,
        referenceNumber: application.session.referenceNumberFormat,
        minWeeks: application.session.minWeeks,
        maxWeeks: application.session.maxWeeks,
      },
      application: {
        id: application.id,
        createdAt: application.createdAt,
      },
      coordinator: {
        name: application.session.coordinator?.name || 'Industrial Training Coordinator',
        email: application.session.coordinator?.email || 'coordinator@uitm.edu.my',
        phone: application.session.coordinator?.phone,
        program: application.session.coordinator?.program,
        signature: application.session.coordinatorSignature,
        signatureType: application.session.coordinatorSignatureType,
      },
      campus: {
        faculty: application.session.coordinator?.faculty || 'Fakulti Sains Komputer dan\nMatematik',
        universityBranch: application.session.coordinator?.universityBranch || 'Universiti Teknologi MARA(Melaka)',
        campusName: application.session.coordinator?.campus || 'Kampus Jasin',
        address: application.session.coordinator?.campusAddress || '77300 Merlimau, Jasin',
        city: application.session.coordinator?.campusCity || 'Melaka Bandaraya Bersejarah',
        phone: application.session.coordinator?.campusPhone || '(+606) 2645000',
      },
    };

    // Validate data
    validateBLI01Data(pdfData);

    // Generate PDF
    const pdfBuffer = await generateBLI01(pdfData);

    // Store PDF in storage system
    const filename = `bli01-${applicationId}.pdf`;
    const directory = `generated/${applicationId}`;
    
    console.log(`💾 [BLI-01] Storing PDF in storage: ${directory}/${filename}`);
    try {
      const uploadResult = await this.storageService.upload(pdfBuffer, {
        filename,
        directory,
        contentType: 'application/pdf',
        metadata: {
          applicationId,
          userId,
          documentType: DocumentType.BLI_01,
          generated: true,
        },
      });

      console.log(`✅ [BLI-01] PDF uploaded to storage: ${uploadResult.path}`);

      // Create or update Document record
      if (existingDocument) {
        console.log(`🔄 [BLI-01] Updating existing Document record`);
        await this.prisma.document.update({
          where: { id: existingDocument.id },
          data: {
            fileUrl: uploadResult.path,
            storageType: uploadResult.provider,
            status: DocumentStatus.SIGNED,
            updatedAt: new Date(),
          },
        });
        console.log(`✅ [BLI-01] Document record updated successfully`);
      } else {
        console.log(`➕ [BLI-01] Creating new Document record`);
        const doc = await this.prisma.document.create({
          data: {
            applicationId: applicationId,
            type: DocumentType.BLI_01,
            fileUrl: uploadResult.path,
            storageType: uploadResult.provider,
            status: DocumentStatus.SIGNED,
            version: 1,
          },
        });
        console.log(`✅ [BLI-01] Document record created: ${doc.id}`);
      }
    } catch (error) {
      console.error('❌ [BLI-01] Failed to store generated PDF:', error);
      // Continue even if storage fails - return the generated PDF
    }

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

    // Upload file to storage (local or Supabase based on config)
    const timestamp = Date.now();
    const filename = `${documentType.toLowerCase()}-${applicationId}-${timestamp}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`;
    
    const uploadResult = await this.storageService.upload(file, {
      filename,
      directory: 'documents',
      contentType: file.mimetype,
      metadata: {
        applicationId,
        userId,
        documentType,
      },
    });

    // Check if document already exists for this application and type
    const existingDocument = await this.prisma.document.findFirst({
      where: {
        applicationId: applicationId,
        type: documentType,
      },
    });

    let document;

    if (existingDocument) {
      // Re-upload scenario: Delete old file and update document
      try {
        await this.storageService.delete(existingDocument.fileUrl);
      } catch (error) {
        console.error('Error deleting old file:', error);
        // Continue even if deletion fails
      }

      // Update document with new file and reset status
      document = await this.prisma.document.update({
        where: { id: existingDocument.id },
        data: {
          fileUrl: uploadResult.path,
          storageType: uploadResult.provider,
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
          fileUrl: uploadResult.path,
          storageType: uploadResult.provider,
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

      await this.notificationsService.notifySubmissionReceived(applicationId);
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

  async downloadUploadedDocument(documentId: string, coordinatorId: string): Promise<Buffer> {
    // Get document with verification
    const document = await this.getDocumentById(documentId, coordinatorId);

    // Check if this is an uploaded document (has a fileUrl that's not 'ONLINE_SUBMISSION')
    if (!document.fileUrl || document.fileUrl === 'ONLINE_SUBMISSION') {
      throw new BadRequestException('This document is not an uploaded file');
    }

    try {
      // Download from storage
      const fileBuffer = await this.storageService.download(document.fileUrl);
      return fileBuffer;
    } catch (error) {
      console.error('Error downloading document from storage:', error);
      throw new NotFoundException('Failed to retrieve document from storage');
    }
  }

  async downloadStudentDocument(applicationId: string, documentId: string, studentId: string): Promise<Buffer> {
    // Verify the application belongs to the student
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: studentId,
      },
      include: {
        documents: {
          where: { id: documentId },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found or does not belong to you');
    }

    const document = application.documents[0];
    if (!document) {
      throw new NotFoundException('Document not found in your application');
    }

    // Check if this is an uploaded document (has a fileUrl that's not 'ONLINE_SUBMISSION')
    if (!document.fileUrl || document.fileUrl === 'ONLINE_SUBMISSION') {
      throw new BadRequestException('This document is not an uploaded file');
    }

    try {
      // Download from storage
      const fileBuffer = await this.storageService.download(document.fileUrl);
      return fileBuffer;
    } catch (error) {
      console.error('Error downloading document from storage:', error);
      throw new NotFoundException('Failed to retrieve document from storage');
    }
  }

  async downloadAllStudentDocumentsAsZip(
    userId: string,
    coordinatorId: string,
  ): Promise<{ stream: Readable; studentName: string; matricNo: string }> {
    // Get all applications for the student
    const applications = await this.prisma.application.findMany({
      where: { userId },
      include: {
        documents: {
          where: {
            status: {
              in: [DocumentStatus.SIGNED, DocumentStatus.PENDING_SIGNATURE],
            },
          },
        },
        session: true,
        user: true,
        company: true,
      },
    });

    if (!applications.length) {
      throw new NotFoundException('No applications found for this student');
    }

    // Verify coordinator has access to at least one of the student's sessions
    const hasAccess = applications.some(
      (app) => app.session.coordinatorId === coordinatorId,
    );
    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to this student\'s documents',
      );
    }

    const studentName = applications[0].user.name;
    const matricNo = applications[0].user.matricNo;

    // Create archive
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    // Track if we added any files
    let fileCount = 0;

    // Download and add all documents to archive
    for (const app of applications) {
      const sessionFolder = `${app.session.year}_Semester${app.session.semester}`;
      const companyName = app.company?.name || 'Unknown_Company';
      const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_');

      for (const doc of app.documents) {
        try {
          // Generate PDF for online submissions
          if (!doc.fileUrl || doc.fileUrl === 'ONLINE_SUBMISSION') {
            let pdfBuffer: Buffer | null = null;
            const fileName = `${doc.type}.pdf`;

            // Generate appropriate PDF based on document type
            switch (doc.type) {
              case 'BLI_01':
                pdfBuffer = await this.generateBLI01PDF(app.id, null);
                break;
              case 'BLI_03':
                pdfBuffer = await this.generateBLI03PDF(app.id, null);
                break;
              case 'BLI_04':
                pdfBuffer = await this.generateBLI04PDF(app.id, null);
                break;
              case 'SLI_03':
                pdfBuffer = await this.generateSLI03PDF(app.id, null);
                break;
              case 'DLI_01':
                pdfBuffer = await this.generateDLI01PDF(app.id, null);
                break;
            }

            if (pdfBuffer) {
              archive.append(pdfBuffer, {
                name: `${sessionFolder}/${sanitizedCompanyName}/${fileName}`,
              });
              fileCount++;
            }
          } else {
            // Check if file exists before downloading
            const fileExists = await this.storageService.exists(doc.fileUrl);
            if (!fileExists) {
              console.warn(`File not found in storage, skipping: ${doc.fileUrl}`);
              continue;
            }

            // Download uploaded file
            const fileBuffer = await this.storageService.download(doc.fileUrl);
            const fileName = `${doc.type}.pdf`;
            archive.append(fileBuffer, {
              name: `${sessionFolder}/${sanitizedCompanyName}/${fileName}`,
            });
            fileCount++;
          }
        } catch (error) {
          console.error(`Error adding document ${doc.id} (${doc.type}) to archive:`, error.message || error);
          // Continue processing other documents
        }
      }
    }

    if (fileCount === 0) {
      throw new NotFoundException('No documents available to download');
    }

    // Finalize archive
    archive.finalize();

    return {
      stream: archive,
      studentName,
      matricNo,
    };
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

    switch (reviewDto.decision) {
      case Decision.APPROVE:
        newDocumentStatus = DocumentStatus.SIGNED;
        break;
      case Decision.REQUEST_CHANGES:
        newDocumentStatus = DocumentStatus.DRAFT;
        await this.notificationsService.notifyChangesRequested(
          document.applicationId,
          reviewDto.comments || 'Please review and make necessary changes',
        );
        break;
      case Decision.REJECT:
        newDocumentStatus = DocumentStatus.REJECTED;
        break;
    }

    // Update document status
    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: newDocumentStatus },
    });

    // Update application status when BLI-01 is approved
    if (reviewDto.decision === Decision.APPROVE && document.type === DocumentType.BLI_01) {
      await this.prisma.application.update({
        where: { id: document.applicationId },
        data: { status: ApplicationStatus.APPROVED },
      });
    }

    // NOTE: Other document approvals (BLI-02, etc.) only update document status
    // Application status for those is managed by form submissions (BLI-03, etc.)

    // Generate and upload PDF to storage if approved
    if (reviewDto.decision === Decision.APPROVE) {
      try {
        if (document.type === DocumentType.BLI_03) {
          await this.generateBLI03PDF(document.applicationId, document.application.user.id);
          
          // IMPORTANT: Also update the BLI-03 form response with coordinator approval timestamp
          // This is needed to unlock SLI-03 and DLI-01 documents
          const bli03Form = await this.prisma.formResponse.findFirst({
            where: {
              applicationId: document.applicationId,
              formTypeEnum: 'BLI_03',
            },
          });
          
          if (bli03Form) {
            await this.prisma.formResponse.update({
              where: { id: bli03Form.id },
              data: {
                coordinatorSignedAt: new Date(),
                verifiedBy: reviewerId,
              },
            });
            console.log('✅ Updated BLI-03 form with coordinatorSignedAt timestamp');
            
            // Update application status to APPROVED
            await this.prisma.application.update({
              where: { id: document.applicationId },
              data: {
                status: ApplicationStatus.APPROVED,
              },
            });
            console.log('✅ Updated application status to APPROVED');

            await this.notificationsService.notifyApplicationApproved(document.applicationId);
          }
        } else if (document.type === DocumentType.BLI_04) {
          await this.generateBLI04PDF(document.applicationId, document.application.user.id);
        }
      } catch (error) {
        console.error(`Failed to generate ${document.type} PDF after approval:`, error);
        // Don't fail the approval process if PDF generation fails
      }

      // Unlock BLI-03, SLI-03, and DLI-01 documents when coordinator approves any document
      // This creates the document records so students can download them
      try {
        console.log('🔓 Calling unlockDocumentsAfterApproval from reviewDocument...');
        await this.unlockDocumentsAfterApproval(document.applicationId, document.type);
        console.log('✅ Finished unlockDocumentsAfterApproval');
      } catch (error) {
        console.error('Failed to unlock documents after approval:', error);
        // Don't fail the approval process if document unlocking fails
      }
    }

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

    // Update application organization fields if provided in bli04Data
    if (bli04Data.organisationName || bli04Data.organisationAddress || 
        bli04Data.department || bli04Data.supervisorName || 
        bli04Data.telephoneNo || bli04Data.faxNo || bli04Data.email) {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: {
          organizationName: bli04Data.organisationName || application.organizationName,
          organizationAddress: bli04Data.organisationAddress || application.organizationAddress,
          organizationPhone: bli04Data.telephoneNo || application.organizationPhone,
          organizationFax: bli04Data.faxNo || application.organizationFax,
          organizationEmail: bli04Data.email || application.organizationEmail,
          contactPersonName: bli04Data.supervisorName || application.contactPersonName,
        },
      });
    }

    // Check if BLI-04 form already exists
    const existingFormResponse = await this.prisma.formResponse.findFirst({
      where: {
        applicationId: applicationId,
        formTypeEnum: 'BLI_04',
      },
    });

    let formResponse;
    if (existingFormResponse) {
      // Update existing FormResponse, preserving existing data
      const existingData = existingFormResponse.payloadJSON as any;
      formResponse = await this.prisma.formResponse.update({
        where: { id: existingFormResponse.id },
        data: {
          payloadJSON: {
            ...existingData,
            ...bli04Data,
            submittedAt: new Date().toISOString(),
          },
        },
      });
    } else {
      // Create new FormResponse
      formResponse = await this.prisma.formResponse.create({
        data: {
          applicationId: applicationId,
          formTypeEnum: 'BLI_04',
          payloadJSON: {
            ...bli04Data,
            submittedAt: new Date().toISOString(),
          },
        },
      });
    }

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
      select: {
        id: true,
        userId: true,
        sessionId: true,
        studentSignature: true,
        studentSignatureType: true,
        studentSignedAt: true,
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
          select: {
            id: true,
            formTypeEnum: true,
            payloadJSON: true,
            submittedAt: true,
            supervisorSignature: true,
            supervisorSignatureType: true,
            supervisorSignedAt: true,
            supervisorName: true,
            verifiedBy: true,
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

    // Verify coordinator has access
    if (application.session.coordinatorId !== coordinatorId) {
      throw new ForbiddenException('You do not have access to this submission');
    }

    return application;
  }

  async generateBLI03PDF(applicationId: string, userId: string): Promise<Buffer> {
    // Check if PDF already exists in Document records
    const existingDocument = await this.prisma.document.findFirst({
      where: {
        applicationId: applicationId,
        type: DocumentType.BLI_03,
      },
    });

    // If document exists and has a stored file, retrieve it
    if (existingDocument && existingDocument.fileUrl !== 'ONLINE_SUBMISSION') {
      console.log(`[BLI03] Found existing document record:`, {
        documentId: existingDocument.id,
        fileUrl: existingDocument.fileUrl,
        applicationId: applicationId
      });
      
      try {
        // Check if file exists before attempting download
        const fileExists = await this.storageService.exists(existingDocument.fileUrl);
        
        if (!fileExists) {
          console.warn(`[BLI03] File does not exist in storage: ${existingDocument.fileUrl}. Will regenerate PDF.`);
          // Delete the stale document record
          await this.prisma.document.delete({
            where: { id: existingDocument.id }
          });
        } else {
          const pdfBuffer = await this.storageService.download(existingDocument.fileUrl);
          console.log(`[BLI03] Successfully retrieved stored PDF for application ${applicationId}`);
          return pdfBuffer;
        }
      } catch (error) {
        console.error(`[BLI03] Failed to retrieve stored PDF for application ${applicationId}:`, {
          error: error.message || error,
          fileUrl: existingDocument.fileUrl,
          documentId: existingDocument.id
        });
        // Continue to regenerate if retrieval fails
      }
    }

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
            coordinatorSignature: true,
            coordinatorSignatureType: true,
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

    // Get signatures from form response
    const bli03Form = application.formResponses[0];
    
    // Get coordinator signature from session (primary source, like BLI01)
    const coordinatorSigType = application.session.coordinatorSignatureType || bli03Form?.coordinatorSignatureType;
    const validCoordinatorSigType: 'typed' | 'drawn' | 'image' | undefined = (coordinatorSigType === 'typed' || coordinatorSigType === 'drawn' || coordinatorSigType === 'image') 
      ? (coordinatorSigType as 'typed' | 'drawn' | 'image')
      : undefined;
    
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
      signatures: {
        studentSignature: bli03Form?.studentSignature,
        studentSignatureType: bli03Form?.studentSignatureType as 'typed' | 'drawn' | 'image' | undefined,
        studentSignedAt: bli03Form?.studentSignedAt,
        // Use session coordinator signature (primary) or form response coordinator signature (fallback)
        coordinatorSignature: application.session.coordinatorSignature || bli03Form?.coordinatorSignature,
        coordinatorSignatureType: validCoordinatorSigType,
        coordinatorSignedAt: bli03Form?.coordinatorSignedAt,
      },
    };

    // Validate data
    validateBLI03Data(pdfData);

    // Generate PDF
    const pdfBuffer = await generateBLI03(pdfData);

    // Store PDF in storage system
    const filename = `bli03-${applicationId}.pdf`;
    const directory = `generated/${applicationId}`;
    
    try {
      const uploadResult = await this.storageService.upload(pdfBuffer, {
        filename,
        directory,
        contentType: 'application/pdf',
        metadata: {
          applicationId,
          userId,
          documentType: DocumentType.BLI_03,
          generated: true,
        },
      });

      // Create or update Document record using upsert to handle race conditions
      const documentData = {
        fileUrl: uploadResult.path,
        storageType: uploadResult.provider,
        status: DocumentStatus.SIGNED,
        updatedAt: new Date(),
      };

      if (existingDocument) {
        // Try to update, if it fails (document was deleted), create a new one
        try {
          await this.prisma.document.update({
            where: { id: existingDocument.id },
            data: documentData,
          });
        } catch (error) {
          // If update fails (P2025 - record not found), create a new document
          if (error.code === 'P2025') {
            console.warn(`[BLI03] Document ${existingDocument.id} not found, creating new record`);
            await this.prisma.document.create({
              data: {
                applicationId: applicationId,
                type: DocumentType.BLI_03,
                ...documentData,
              },
            });
          } else {
            throw error;
          }
        }
      } else {
        await this.prisma.document.create({
          data: {
            applicationId: applicationId,
            type: DocumentType.BLI_03,
            ...documentData,
            version: 1,
          },
        });
      }
    } catch (error) {
      console.error('Failed to store generated PDF:', error);
      // Continue even if storage fails - return the generated PDF
    }

    return pdfBuffer;
  }

  async generateSLI03PDF(applicationId: string, userId: string): Promise<Buffer> {
    // Check if PDF already exists in Document records
    const existingDocument = await this.prisma.document.findFirst({
      where: {
        applicationId: applicationId,
        type: DocumentType.SLI_03,
      },
    });

    // If document exists and has a stored file, retrieve it
    if (existingDocument && existingDocument.fileUrl !== 'ONLINE_SUBMISSION') {
      try {
        const pdfBuffer = await this.storageService.download(existingDocument.fileUrl);
        return pdfBuffer;
      } catch (error) {
        console.error('Failed to retrieve stored PDF, regenerating:', error);
        // Continue to regenerate if retrieval fails
      }
    }

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

    // Store PDF in storage system
    const filename = `sli03-${applicationId}.pdf`;
    const directory = `generated/${applicationId}`;
    
    try {
      const uploadResult = await this.storageService.upload(pdfBuffer, {
        filename,
        directory,
        contentType: 'application/pdf',
        metadata: {
          applicationId,
          userId,
          documentType: DocumentType.SLI_03,
          generated: true,
        },
      });

      // Create or update Document record
      if (existingDocument) {
        await this.prisma.document.update({
          where: { id: existingDocument.id },
          data: {
            fileUrl: uploadResult.path,
            storageType: uploadResult.provider,
            status: DocumentStatus.SIGNED,
            updatedAt: new Date(),
          },
        });
      } else {
        await this.prisma.document.create({
          data: {
            applicationId: applicationId,
            type: DocumentType.SLI_03,
            fileUrl: uploadResult.path,
            storageType: uploadResult.provider,
            status: DocumentStatus.SIGNED,
            version: 1,
          },
        });
      }
    } catch (error) {
      console.error('Failed to store generated PDF:', error);
      // Continue even if storage fails - return the generated PDF
    }

    return pdfBuffer;
  }

  async generateDLI01PDF(applicationId: string, userId: string): Promise<Buffer> {
    // Check if PDF already exists in Document records
    const existingDocument = await this.prisma.document.findFirst({
      where: {
        applicationId: applicationId,
        type: DocumentType.DLI_01,
      },
    });

    // If document exists and has a stored file, retrieve it
    if (existingDocument && existingDocument.fileUrl !== 'ONLINE_SUBMISSION') {
      try {
        const pdfBuffer = await this.storageService.download(existingDocument.fileUrl);
        return pdfBuffer;
      } catch (error) {
        console.error('Failed to retrieve stored PDF, regenerating:', error);
        // Continue to regenerate if retrieval fails
      }
    }

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

    // Store PDF in storage system
    const filename = `dli01-${applicationId}.pdf`;
    const directory = `generated/${applicationId}`;
    
    try {
      const uploadResult = await this.storageService.upload(pdfBuffer, {
        filename,
        directory,
        contentType: 'application/pdf',
        metadata: {
          applicationId,
          userId,
          documentType: DocumentType.DLI_01,
          generated: true,
        },
      });

      // Create or update Document record
      if (existingDocument) {
        await this.prisma.document.update({
          where: { id: existingDocument.id },
          data: {
            fileUrl: uploadResult.path,
            storageType: uploadResult.provider,
            status: DocumentStatus.SIGNED,
            updatedAt: new Date(),
          },
        });
      } else {
        await this.prisma.document.create({
          data: {
            applicationId: applicationId,
            type: DocumentType.DLI_01,
            fileUrl: uploadResult.path,
            storageType: uploadResult.provider,
            status: DocumentStatus.SIGNED,
            version: 1,
          },
        });
      }
    } catch (error) {
      console.error('Failed to store generated PDF:', error);
      // Continue even if storage fails - return the generated PDF
    }

    return pdfBuffer;
  }

  async generateBLI04PDF(applicationId: string, userId?: string): Promise<Buffer> {
    // Check if PDF already exists in Document records
    const existingDocument = await this.prisma.document.findFirst({
      where: {
        applicationId: applicationId,
        type: DocumentType.BLI_04,
      },
    });

    // If document exists and has a stored file, retrieve it
    if (existingDocument && existingDocument.fileUrl !== 'ONLINE_SUBMISSION') {
      try {
        const pdfBuffer = await this.storageService.download(existingDocument.fileUrl);
        return pdfBuffer;
      } catch (error) {
        console.error('Failed to retrieve stored PDF, regenerating:', error);
        // Continue to regenerate if retrieval fails
      }
    }

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

    // Store PDF in storage system
    const filename = `bli04-${applicationId}.pdf`;
    const directory = `generated/${applicationId}`;
    
    try {
      const uploadResult = await this.storageService.upload(pdfBuffer, {
        filename,
        directory,
        contentType: 'application/pdf',
        metadata: {
          applicationId,
          userId,
          documentType: DocumentType.BLI_04,
          generated: true,
        },
      });

      // Create or update Document record
      if (existingDocument) {
        await this.prisma.document.update({
          where: { id: existingDocument.id },
          data: {
            fileUrl: uploadResult.path,
            storageType: uploadResult.provider,
            status: DocumentStatus.SIGNED,
            updatedAt: new Date(),
          },
        });
      } else {
        await this.prisma.document.create({
          data: {
            applicationId: applicationId,
            type: DocumentType.BLI_04,
            fileUrl: uploadResult.path,
            storageType: uploadResult.provider,
            status: DocumentStatus.SIGNED,
            version: 1,
          },
        });
      }
    } catch (error) {
      console.error('Failed to store generated PDF:', error);
      // Continue even if storage fails - return the generated PDF
    }

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

    // Note: SLI-04 is generated on-demand and not stored as it's case-specific
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

  async saveBli04Draft(applicationId: string, userId: string, bli04Data: any) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('You do not have permission to save this form');
    }

    // Update application organization fields if provided in bli04Data
    if (bli04Data.organisationName || bli04Data.organisationAddress || 
        bli04Data.department || bli04Data.supervisorName || 
        bli04Data.telephoneNo || bli04Data.faxNo || bli04Data.email) {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: {
          organizationName: bli04Data.organisationName || application.organizationName,
          organizationAddress: bli04Data.organisationAddress || application.organizationAddress,
          organizationPhone: bli04Data.telephoneNo || application.organizationPhone,
          organizationFax: bli04Data.faxNo || application.organizationFax,
          organizationEmail: bli04Data.email || application.organizationEmail,
          contactPersonName: bli04Data.supervisorName || application.contactPersonName,
        },
      });
    }

    const existingForm = await this.prisma.formResponse.findFirst({
      where: {
        applicationId: applicationId,
        formTypeEnum: 'BLI_04',
      },
    });

    let formResponse;
    if (existingForm) {
      formResponse = await this.prisma.formResponse.update({
        where: { id: existingForm.id },
        data: {
          payloadJSON: {
            ...bli04Data,
            updatedAt: new Date().toISOString(),
            isDraft: true,
          },
        },
      });
    } else {
      formResponse = await this.prisma.formResponse.create({
        data: {
          applicationId: applicationId,
          formTypeEnum: 'BLI_04',
          payloadJSON: {
            ...bli04Data,
            createdAt: new Date().toISOString(),
            isDraft: true,
          },
        },
      });
    }

    return formResponse;
  }

  async generateSupervisorLink(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        formResponses: {
          where: { formTypeEnum: 'BLI_04' },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('You do not have permission to generate a supervisor link');
    }

    const bli04Form = application.formResponses.find(f => f.formTypeEnum === 'BLI_04');
    if (!bli04Form) {
      throw new BadRequestException('BLI-04 form must be saved before generating supervisor link');
    }

    const bli04Data = bli04Form.payloadJSON as any;
    if (!bli04Data.supervisorName || !bli04Data.email) {
      throw new BadRequestException('Supervisor name and email are required');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const existingToken = await this.prisma.supervisorToken.findFirst({
      where: {
        applicationId: applicationId,
        formType: 'BLI_04',
        isRevoked: false,
      },
    });

    if (existingToken) {
      await this.prisma.supervisorToken.update({
        where: { id: existingToken.id },
        data: { isRevoked: true },
      });
    }

    const supervisorToken = await this.prisma.supervisorToken.create({
      data: {
        applicationId: applicationId,
        token: token,
        supervisorEmail: bli04Data.email,
        supervisorName: bli04Data.supervisorName,
        expiresAt: expiresAt,
        formType: 'BLI_04',
      },
    });

    return {
      token: supervisorToken.token,
      expiresAt: supervisorToken.expiresAt,
      supervisorEmail: supervisorToken.supervisorEmail,
      supervisorName: supervisorToken.supervisorName,
    };
  }

  async verifySupervisorToken(token: string) {
    const supervisorToken = await this.prisma.supervisorToken.findUnique({
      where: { token },
    });

    if (!supervisorToken) {
      throw new NotFoundException('Invalid supervisor link');
    }

    if (supervisorToken.isRevoked) {
      throw new BadRequestException('This link has been revoked');
    }

    if (supervisorToken.usedAt) {
      throw new BadRequestException('This link has already been used');
    }

    if (new Date() > supervisorToken.expiresAt) {
      throw new BadRequestException('This link has expired');
    }

    const application = await this.prisma.application.findUnique({
      where: { id: supervisorToken.applicationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            matricNo: true,
            program: true,
            email: true,
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
          where: { formTypeEnum: 'BLI_04' },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const bli04Form = application.formResponses[0];
    if (!bli04Form) {
      throw new NotFoundException('BLI-04 form not found');
    }

    return {
      application: application,
      bli04Data: bli04Form.payloadJSON,
      supervisorName: supervisorToken.supervisorName,
      supervisorEmail: supervisorToken.supervisorEmail,
      tokenId: supervisorToken.id,
    };
  }

  async submitSupervisorSignature(token: string, signatureData: any) {
    const supervisorToken = await this.prisma.supervisorToken.findUnique({
      where: { token },
    });

    if (!supervisorToken) {
      throw new NotFoundException('Invalid supervisor link');
    }

    if (supervisorToken.isRevoked) {
      throw new BadRequestException('This link has been revoked');
    }

    if (supervisorToken.usedAt) {
      throw new BadRequestException('This link has already been used');
    }

    if (new Date() > supervisorToken.expiresAt) {
      throw new BadRequestException('This link has expired');
    }

    const bli04Form = await this.prisma.formResponse.findFirst({
      where: {
        applicationId: supervisorToken.applicationId,
        formTypeEnum: 'BLI_04',
      },
    });

    if (!bli04Form) {
      throw new NotFoundException('BLI-04 form not found');
    }

    // Handle image signature type - retrieve from Application if already uploaded
    let supervisorSignature = signatureData.signature;
    if (signatureData.signatureType === 'image') {
      if (!supervisorSignature) {
        // Retrieve from Application table
        const application = await this.prisma.application.findUnique({
          where: { id: supervisorToken.applicationId },
        });
        
        if (application && application.supervisorSignature && application.supervisorSignatureType === 'image') {
          supervisorSignature = application.supervisorSignature;
        } else {
          throw new BadRequestException('Please upload your signature image before submitting the form');
        }
      }
    } else {
      // For typed or drawn signatures, validate they are not empty
      if (!supervisorSignature) {
        throw new BadRequestException('Supervisor signature is required');
      }
    }

    const updatedForm = await this.prisma.formResponse.update({
      where: { id: bli04Form.id },
      data: {
        supervisorSignature: supervisorSignature,
        supervisorSignatureType: signatureData.signatureType,
        supervisorSignedAt: new Date(),
        supervisorName: supervisorToken.supervisorName,
        payloadJSON: {
          ...(bli04Form.payloadJSON as any),
          reportingDate: signatureData.reportingDate,
          supervisorRemarks: signatureData.remarks,
          isDraft: false,
          supervisorConfirmedAt: new Date().toISOString(),
        },
      },
    });

    await this.prisma.supervisorToken.update({
      where: { id: supervisorToken.id },
      data: { usedAt: new Date() },
    });

    const existingDocument = await this.prisma.document.findFirst({
      where: {
        applicationId: supervisorToken.applicationId,
        type: 'BLI_04',
      },
    });

    if (existingDocument) {
      await this.prisma.document.update({
        where: { id: existingDocument.id },
        data: {
          status: DocumentStatus.SIGNED,
          signedBy: supervisorToken.supervisorName,
          signedAt: new Date(),
        },
      });
    } else {
      await this.prisma.document.create({
        data: {
          applicationId: supervisorToken.applicationId,
          type: DocumentType.BLI_04,
          fileUrl: 'ONLINE_SUBMISSION',
          status: DocumentStatus.SIGNED,
          signedBy: supervisorToken.supervisorName,
          signedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      formResponse: updatedForm,
    };
  }

  async getBli04Submissions(coordinatorId: string, filters?: { sessionId?: string; program?: string }) {
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
          formTypeEnum: 'BLI_04',
          supervisorSignedAt: {
            not: null,
          },
        },
      },
    };

    if (filters?.sessionId) {
      where.sessionId = filters.sessionId;
    }

    if (filters?.program) {
      where.user = {
        program: filters.program,
      };
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
          where: { formTypeEnum: 'BLI_04' },
        },
        documents: {
          where: { type: 'BLI_04' },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return applications;
  }

  async verifyBli04Submission(applicationId: string, coordinatorId: string, decision: Decision, comments?: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        session: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            matricNo: true,
            program: true,
          },
        },
        formResponses: {
          where: {
            OR: [
              { formTypeEnum: 'BLI_03' },
              { formTypeEnum: 'BLI_04' },
            ],
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.session.coordinatorId !== coordinatorId) {
      throw new ForbiddenException('You do not have permission to verify this submission');
    }

    const bli04Form = application.formResponses.find(f => f.formTypeEnum === 'BLI_04');
    if (!bli04Form || !bli04Form.supervisorSignedAt) {
      throw new BadRequestException('BLI-04 form has not been signed by supervisor');
    }

    if (decision === Decision.REQUEST_CHANGES) {
      await this.prisma.formResponse.update({
        where: { id: bli04Form.id },
        data: {
          verifiedBy: null,
          supervisorSignature: null,
          supervisorSignatureType: null,
          supervisorSignedAt: null,
          supervisorName: null,
        },
      });

      const existingBli04Document = await this.prisma.document.findFirst({
        where: {
          applicationId: applicationId,
          type: DocumentType.BLI_04,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      if (existingBli04Document) {
        await this.prisma.document.update({
          where: { id: existingBli04Document.id },
          data: {
            status: DocumentStatus.PENDING_SIGNATURE,
            signedBy: null,
            signedAt: null,
            updatedAt: new Date(),
          },
        });
      }
    } else {
      await this.prisma.formResponse.update({
        where: { id: bli04Form.id },
        data: {
          verifiedBy: coordinatorId,
        },
      });

      const existingBli04Document = await this.prisma.document.findFirst({
        where: {
          applicationId: applicationId,
          type: DocumentType.BLI_04,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      if (existingBli04Document) {
        await this.prisma.document.update({
          where: { id: existingBli04Document.id },
          data: {
            status: DocumentStatus.SIGNED,
            updatedAt: new Date(),
          },
        });
      }
    }

    const review = await this.prisma.review.create({
      data: {
        applicationId: applicationId,
        reviewerId: coordinatorId,
        decision: decision,
        comments: comments,
      },
    });

    if (decision === Decision.APPROVE) {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.APPROVED,
        },
      });

      // Generate and upload BLI04 PDF to storage after approval
      try {
        await this.generateBLI04PDF(applicationId, application.userId);
      } catch (error) {
        console.error('Failed to generate BLI04 PDF after approval:', error);
        // Don't fail the approval process if PDF generation fails
      }
    }

    return review;
  }

  async submitBli03WithSignature(applicationId: string, userId: string, dto: SubmitBli03Dto) {
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

    // Handle image signature type - retrieve from Application if already uploaded
    let studentSignature = dto.studentSignature;
    if (dto.studentSignatureType === 'image') {
      if (!studentSignature && application.studentSignature && application.studentSignatureType === 'image') {
        // Use previously uploaded signature
        studentSignature = application.studentSignature;
      } else if (!studentSignature) {
        throw new BadRequestException('Please upload your signature image before submitting the form');
      }
    } else {
      // For typed or drawn signatures, validate they are not empty
      if (!studentSignature) {
        throw new BadRequestException('Student signature is required');
      }
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

    // Update application with BLI03 data and student signature
    await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        companyId: company.id,
        studentPhone: dto.studentPhone,
        studentEmail: dto.studentEmail,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        organizationName: dto.organizationName,
        organizationAddress: dto.organizationAddress,
        organizationPhone: dto.organizationPhone,
        organizationFax: dto.organizationFax,
        organizationEmail: dto.organizationEmail,
        contactPersonName: dto.contactPersonName,
        contactPersonPhone: dto.contactPersonPhone,
        organizationDeclarationAccepted: dto.organizationDeclaration,
        reportingPeriod: dto.reportingPeriod,
        studentSignature: studentSignature,
        studentSignatureType: dto.studentSignatureType,
        studentSignedAt: new Date(),
      },
    });

    // Check if BLI03 form response already exists
    const existingBli03Form = await this.prisma.formResponse.findFirst({
      where: {
        applicationId: applicationId,
        formTypeEnum: 'BLI_03',
      },
    });

    if (existingBli03Form) {
      // Update existing form response with new data and student signature
      await this.prisma.formResponse.update({
        where: { id: existingBli03Form.id },
        data: {
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
          },
          studentSignature: studentSignature,
          studentSignatureType: dto.studentSignatureType,
          studentSignedAt: new Date(),
          // Clear coordinator signature on resubmission
          coordinatorSignature: null,
          coordinatorSignatureType: null,
          coordinatorSignedAt: null,
          verifiedBy: null,
        },
      });
    } else {
      // Create new form response with student signature
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
          },
          studentSignature: studentSignature,
          studentSignatureType: dto.studentSignatureType,
          studentSignedAt: new Date(),
        },
      });
    }

    // Check if BLI03 document already exists
    const existingBli03Document = await this.prisma.document.findFirst({
      where: {
        applicationId: applicationId,
        type: 'BLI_03',
      },
    });

    if (existingBli03Document) {
      // Update existing document - reset status to PENDING_SIGNATURE for coordinator review
      await this.prisma.document.update({
        where: { id: existingBli03Document.id },
        data: {
          status: DocumentStatus.PENDING_SIGNATURE,
          version: existingBli03Document.version + 1,
        },
      });
    } else {
      // Create new BLI03 document for coordinator review
      await this.prisma.document.create({
        data: {
          applicationId: applicationId,
          type: DocumentType.BLI_03,
          fileUrl: `/api/applications/${applicationId}/bli03/pdf`,
          status: DocumentStatus.PENDING_SIGNATURE,
          version: 1,
        },
      });
    }

    return { message: 'BLI-03 form submitted successfully with student signature' };
  }

  async approveBli03Submission(applicationId: string, coordinatorId: string, dto: ApproveBli03Dto) {
    // Verify application exists and get session info
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        formResponses: {
          where: { formTypeEnum: 'BLI_03' },
        },
        session: {
          select: {
            coordinatorId: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Authorization: Verify coordinator owns this session
    if (application.session.coordinatorId !== coordinatorId) {
      throw new ForbiddenException('You can only approve submissions from your own students');
    }

    const bli03Form = application.formResponses.find(f => f.formTypeEnum === 'BLI_03');
    if (!bli03Form) {
      throw new NotFoundException('BLI-03 form not found');
    }

    if (!bli03Form.studentSignedAt) {
      throw new BadRequestException('Student has not signed the form yet');
    }

    if (dto.decision === 'APPROVE') {
      console.log('🟢 START BLI-03 APPROVAL PROCESS');
      console.log('Application ID:', applicationId);
      console.log('Coordinator ID:', coordinatorId);
      
      // Signature is optional - coordinator can approve with or without signature
      // Update form response with coordinator verification
      await this.prisma.formResponse.update({
        where: { id: bli03Form.id },
        data: {
          coordinatorSignature: dto.coordinatorSignature || null,
          coordinatorSignatureType: dto.coordinatorSignatureType || null,
          coordinatorSignedAt: new Date(), // This timestamp marks the approval and unlocks documents
          verifiedBy: coordinatorId,
        },
      });
      console.log('✅ Updated form response with coordinatorSignedAt');

      // Update application status
      await this.prisma.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.APPROVED,
        },
      });
      console.log('✅ Updated application status to APPROVED');

      // Create approval review
      await this.prisma.review.create({
        data: {
          applicationId: applicationId,
          reviewerId: coordinatorId,
          decision: Decision.APPROVE,
          comments: dto.comments,
        },
      });
      console.log('✅ Created approval review');

      // Update BLI03 document status to SIGNED
      await this.prisma.document.updateMany({
        where: {
          applicationId: applicationId,
          type: DocumentType.BLI_03,
        },
        data: {
          status: DocumentStatus.SIGNED,
        },
      });
      console.log('✅ Updated BLI-03 document status to SIGNED');

      // Generate and upload BLI03 PDF to storage after approval
      try {
        await this.generateBLI03PDF(applicationId, application.userId);
        console.log('✅ Generated BLI-03 PDF');
      } catch (error) {
        console.error('❌ Failed to generate BLI03 PDF after approval:', error);
        // Don't fail the approval process if PDF generation fails
      }

      // Unlock SLI-03 and DLI-01 documents after BLI-03 approval
      try {
        console.log('🔓 Calling unlockDocumentsAfterApproval...');
        await this.unlockDocumentsAfterApproval(applicationId, DocumentType.BLI_03);
        console.log('✅ Finished unlockDocumentsAfterApproval');
      } catch (error) {
        console.error('❌ Failed to unlock documents after BLI-03 approval:', error);
        // Don't fail the approval process if document unlocking fails
      }

      console.log('🟢 COMPLETED BLI-03 APPROVAL PROCESS');
      return { message: 'BLI-03 form approved and signed by coordinator' };
    } else {
      // REQUEST_CHANGES
      // Clear coordinator signature if exists
      await this.prisma.formResponse.update({
        where: { id: bli03Form.id },
        data: {
          coordinatorSignature: null,
          coordinatorSignatureType: null,
          coordinatorSignedAt: null,
          verifiedBy: null,
          // Also clear student signature so they need to re-sign
          studentSignature: null,
          studentSignatureType: null,
          studentSignedAt: null,
        },
      });

      // Create review with REQUEST_CHANGES
      await this.prisma.review.create({
        data: {
          applicationId: applicationId,
          reviewerId: coordinatorId,
          decision: Decision.REQUEST_CHANGES,
          comments: dto.comments,
        },
      });

      // Update BLI03 document status to DRAFT (changes requested)
      await this.prisma.document.updateMany({
        where: {
          applicationId: applicationId,
          type: DocumentType.BLI_03,
        },
        data: {
          status: DocumentStatus.DRAFT,
        },
      });

      return { message: 'Changes requested for BLI-03 form' };
    }
  }

  async unlockDocumentsAfterApproval(applicationId: string, approvedDocumentType: DocumentType) {
    // Fetch application to check current state (after approval updates)
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        documents: true,
        formResponses: {
          where: { formTypeEnum: 'BLI_03' },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const documentsToCreate: { type: DocumentType; fileUrl: string }[] = [];

    // When BLI-03 form is signed by coordinator, unlock BLI-03, SLI-03, and DLI-01
    const bli03Form = application.formResponses.find(f => f.formTypeEnum === 'BLI_03');
    const bli03Approved = bli03Form?.coordinatorSignedAt != null;

    if (bli03Approved) {
      // Create BLI-03 document if it doesn't exist
      const bli03Exists = application.documents.some(d => d.type === DocumentType.BLI_03);
      if (!bli03Exists) {
        documentsToCreate.push({
          type: DocumentType.BLI_03,
          fileUrl: `/applications/${applicationId}/bli03/pdf`,
        });
      }

      // Create SLI-03 document if it doesn't exist
      const sli03Exists = application.documents.some(d => d.type === DocumentType.SLI_03);
      if (!sli03Exists) {
        documentsToCreate.push({
          type: DocumentType.SLI_03,
          fileUrl: `/applications/${applicationId}/sli03/pdf`,
        });
      }

      // Create DLI-01 document if it doesn't exist
      const dli01Exists = application.documents.some(d => d.type === DocumentType.DLI_01);
      if (!dli01Exists) {
        documentsToCreate.push({
          type: DocumentType.DLI_01,
          fileUrl: `/applications/${applicationId}/dli01/pdf`,
        });
      }
    }

    // Create the document records
    if (documentsToCreate.length > 0) {
      await this.prisma.document.createMany({
        data: documentsToCreate.map(doc => ({
          applicationId,
          type: doc.type,
          fileUrl: doc.fileUrl,
          status: DocumentStatus.SIGNED,
          version: 1,
        })),
      });

      console.log(`✅ Created ${documentsToCreate.length} unlocked document(s) for application ${applicationId}: ${documentsToCreate.map(d => d.type).join(', ')}`);

      const sli03Created = documentsToCreate.some(d => d.type === DocumentType.SLI_03);
      if (sli03Created) {
        const downloadLink = `${process.env.BASE_URL || 'http://localhost:3000'}/applications/${applicationId}/sli03/pdf`;
        await this.notificationsService.notifySLI03Ready(applicationId, downloadLink);
      }
    }
  }

  async getDocumentUnlockStatus(applicationId: string, userId?: string) {
    // Fetch application with all necessary relations
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
        session: true,
        documents: true,
        formResponses: {
          where: { 
            OR: [
              { formTypeEnum: 'BLI_03' },
              { formTypeEnum: 'BLI_04' },
            ],
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify ownership if userId provided
    if (userId && application.userId !== userId) {
      throw new ForbiddenException('You can only access your own applications');
    }

    // Determine unlock status for each document
    const unlockStatus = {
      bli01: true, // Always unlocked once application is created
      bli02: false,
      bli03: false,
      sli03: false,
      dli01: false,
      bli04: false,
    };

    // Check if BLI-01 is approved (application status = APPROVED)
    const bli01Approved = application.status === ApplicationStatus.APPROVED;

    // BLI-02: Unlocked when the uploaded BLI-02 document is signed by coordinator
    const bli02Doc = application.documents.find(d => d.type === DocumentType.BLI_02);
    if (bli02Doc && bli02Doc.status === DocumentStatus.SIGNED) {
      unlockStatus.bli02 = true;
    }

    // BLI-03: Unlocked when BLI-01 is approved by coordinator
    if (bli01Approved) {
      unlockStatus.bli03 = true;
    }

    // Check if BLI-03 is approved by coordinator (signed)
    const bli03Form = application.formResponses.find(f => f.formTypeEnum === 'BLI_03');
    const bli03Approved = bli03Form?.coordinatorSignedAt != null;

    // Debug logging
    console.log('🔍 DEBUG - Unlock Status Check:');
    console.log('Application ID:', applicationId);
    console.log('Application Status:', application.status);
    console.log('BLI-01 Approved:', bli01Approved);
    console.log('BLI-03 Form:', bli03Form ? 'EXISTS' : 'NOT FOUND');
    console.log('Coordinator Signed At:', bli03Form?.coordinatorSignedAt);
    console.log('BLI-03 Approved:', bli03Approved);
    console.log('Documents in DB:', application.documents.map(d => ({ type: d.type, status: d.status })));

    // SLI-03 and DLI-01: Unlocked after BLI-03 is signed by coordinator
    if (bli03Approved) {
      unlockStatus.sli03 = true;
      unlockStatus.dli01 = true;
      console.log('✅ SLI-03 and DLI-01 UNLOCKED');
    } else {
      console.log('❌ SLI-03 and DLI-01 LOCKED - BLI-03 not approved yet');
    }

    // BLI-04: Unlocked after coordinator verifies the BLI-04 submission
    const bli04Form = application.formResponses.find(f => f.formTypeEnum === 'BLI_04');
    const bli04Verified = bli04Form?.verifiedBy != null;
    const bli04DocSigned = application.documents.some(
      (d) => d.type === DocumentType.BLI_04 && d.status === DocumentStatus.SIGNED,
    );
    const bli04Unlocked = bli04Verified || bli04DocSigned;
    
    if (bli04Unlocked) {
      unlockStatus.bli04 = true;
      console.log('✅ BLI-04 UNLOCKED');
    } else {
      console.log('❌ BLI-04 LOCKED - Not verified by coordinator yet');
    }

    console.log('Final Unlock Status:', unlockStatus);

    return {
      unlockStatus,
      applicationStatus: application.status,
      bli03Approved,
      bli04Verified,
    };
  }

  async uploadStudentSignature(
    applicationId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('You can only upload signatures for your own applications');
    }

    const fs = require('fs');
    const imageBuffer = fs.readFileSync(file.path);
    const base64Signature = imageBuffer.toString('base64');

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        studentSignature: base64Signature,
        studentSignatureType: 'image',
        studentSignedAt: new Date(),
      },
    });

    fs.unlinkSync(file.path);

    return {
      signatureUploaded: true,
      signedAt: updatedApplication.studentSignedAt,
    };
  }

  async uploadSupervisorSignature(
    applicationId: string,
    file: Express.Multer.File,
    token?: string,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (token) {
      const supervisorToken = await this.prisma.supervisorToken.findUnique({
        where: { token },
      });

      if (!supervisorToken || supervisorToken.applicationId !== applicationId) {
        throw new ForbiddenException('Invalid supervisor token');
      }

      if (supervisorToken.isRevoked) {
        throw new BadRequestException('This token has been revoked');
      }

      if (new Date() > supervisorToken.expiresAt) {
        throw new BadRequestException('This token has expired');
      }
    }

    const fs = require('fs');
    const imageBuffer = fs.readFileSync(file.path);
    const base64Signature = imageBuffer.toString('base64');

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        supervisorSignature: base64Signature,
        supervisorSignatureType: 'image',
        supervisorSignedAt: new Date(),
      },
    });

    fs.unlinkSync(file.path);

    return {
      signatureUploaded: true,
      signedAt: updatedApplication.supervisorSignedAt,
    };
  }

  async generateTestBLI03PDF(testData: any): Promise<Buffer> {
    const { student, organization, signatures } = testData;

    const pdfData = {
      student: {
        name: student.name,
        matricNo: student.matricNo,
        program: student.program,
        phone: student.phone,
        email: student.email,
        startDate: student.startDate,
        endDate: student.endDate,
      },
      organization: {
        name: organization.name,
        address: organization.address,
        phone: organization.phone,
        fax: organization.fax || '',
        email: organization.email,
        contactPersonName: organization.contactPersonName,
        contactPersonPhone: organization.contactPersonPhone,
      },
      application: {
        id: 'TEST-' + Date.now(),
        createdAt: new Date(),
      },
      signatures: {
        studentSignature: signatures?.studentSignature,
        studentSignatureType: signatures?.studentSignatureType as 'typed' | 'drawn' | 'image' | undefined,
        studentSignedAt: signatures?.studentSignedAt ? new Date(signatures.studentSignedAt) : new Date(),
        coordinatorSignature: signatures?.coordinatorSignature,
        coordinatorSignatureType: signatures?.coordinatorSignatureType as 'typed' | 'drawn' | 'image' | undefined,
        coordinatorSignedAt: signatures?.coordinatorSignedAt ? new Date(signatures.coordinatorSignedAt) : new Date(),
      },
    };

    // Validate data
    validateBLI03Data(pdfData);

    // Generate and return PDF buffer (no storage)
    const pdfBuffer = await generateBLI03(pdfData);
    return pdfBuffer;
  }
}
