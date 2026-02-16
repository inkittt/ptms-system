import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Res,
  StreamableFile,
  UseInterceptors,
  UploadedFile,
  Patch,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { ReviewDocumentDto } from './dto/review-document.dto';
import { UpdateBli03Dto } from './dto/update-bli03.dto';
import { SubmitBli03Dto } from './dto/submit-bli03.dto';
import { ApproveBli03Dto } from './dto/approve-bli03.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(UserRole.STUDENT)
  async createApplication(
    @CurrentUser() user: any,
    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    const application = await this.applicationsService.createApplication(
      user.userId,
      createApplicationDto,
    );
    return {
      message: 'Application created successfully',
      application,
    };
  }

  @Get()
  @Roles(UserRole.STUDENT)
  async getMyApplications(@CurrentUser() user: any) {
    const applications = await this.applicationsService.getApplicationsByUser(
      user.userId,
    );
    return { applications };
  }

  @Get('sessions/active')
  @Roles(UserRole.STUDENT)
  async getActiveSessions() {
    const sessions = await this.applicationsService.getActiveSessions();
    return { sessions };
  }

  @Get('profile')
  @Roles(UserRole.STUDENT)
  async getProfile(@CurrentUser() user: any) {
    const profile = await this.applicationsService.getUserProfile(user.userId);
    return { profile };
  }

  @Get(':id')
  @Roles(UserRole.STUDENT)
  async getApplicationById(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const application = await this.applicationsService.getApplicationById(
      id,
      user.userId,
    );
    return { application };
  }

  @Get(':id/bli-01/pdf')
  @Roles(UserRole.STUDENT, UserRole.COORDINATOR)
  async generateBLI01PDF(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pdfBuffer = await this.applicationsService.generateBLI01PDF(
      id,
      user.userId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="BLI-01-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return new StreamableFile(pdfBuffer);
  }

  @Get(':id/bli-03/pdf')
  @Roles(UserRole.STUDENT, UserRole.COORDINATOR)
  async generateBLI03PDF(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pdfBuffer = await this.applicationsService.generateBLI03PDF(
      id,
      user.userId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="BLI-03-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return new StreamableFile(pdfBuffer);
  }

  @Get(':id/sli-03/pdf')
  @Roles(UserRole.STUDENT, UserRole.COORDINATOR)
  async generateSLI03PDF(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pdfBuffer = await this.applicationsService.generateSLI03PDF(
      id,
      user.userId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="SLI-03-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return new StreamableFile(pdfBuffer);
  }

  @Get(':id/dli-01/pdf')
  @Roles(UserRole.STUDENT, UserRole.COORDINATOR)
  async generateDLI01PDF(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pdfBuffer = await this.applicationsService.generateDLI01PDF(
      id,
      user.userId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="DLI-01-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return new StreamableFile(pdfBuffer);
  }

  @Get(':id/bli-04/pdf')
  @Roles(UserRole.STUDENT, UserRole.COORDINATOR)
  async generateBLI04PDF(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    // For students, pass userId to verify ownership. For coordinators, don't pass userId
    const userId = user.role === 'STUDENT' ? user.userId : undefined;
    
    const pdfBuffer = await this.applicationsService.generateBLI04PDF(
      id,
      userId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="BLI-04-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return new StreamableFile(pdfBuffer);
  }

  @Post(':id/documents/upload')
  @Roles(UserRole.STUDENT)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf|jpg|jpeg|png)$/i)) {
          return cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadDocument(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDocumentDto: UploadDocumentDto,
  ) {
    const document = await this.applicationsService.uploadDocument(
      applicationId,
      user.userId,
      file,
      uploadDocumentDto.documentType,
    );

    return {
      message: 'Document uploaded successfully',
      document,
    };
  }

  @Get('documents/pending-review')
  @Roles(UserRole.COORDINATOR)
  async getPendingDocuments(
    @CurrentUser() user: any,
    @Query('sessionId') sessionId?: string,
    @Query('status') status?: string,
    @Query('program') program?: string,
  ) {
    const documents = await this.applicationsService.getPendingDocuments(
      user.userId,
      {
        sessionId,
        status,
        program,
      },
    );
    return { documents };
  }

  @Get('documents/:documentId')
  @Roles(UserRole.COORDINATOR, UserRole.STUDENT)
  async getDocument(
    @CurrentUser() user: any,
    @Param('documentId') documentId: string,
  ) {
    // Only pass coordinatorId if user is a coordinator
    const coordinatorId = user.role === UserRole.COORDINATOR ? user.userId : undefined;
    const document = await this.applicationsService.getDocumentById(
      documentId,
      coordinatorId,
    );
    return { document };
  }

  @Get('documents/:documentId/download')
  @Roles(UserRole.COORDINATOR)
  async downloadUploadedDocument(
    @CurrentUser() user: any,
    @Param('documentId') documentId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const fileBuffer = await this.applicationsService.downloadUploadedDocument(
      documentId,
      user.userId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="document-${documentId}.pdf"`,
      'Content-Length': fileBuffer.length,
    });

    return new StreamableFile(fileBuffer);
  }

  @Get('students/:userId/documents/download-all')
  @Roles(UserRole.COORDINATOR)
  async downloadAllStudentDocuments(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    const { stream, studentName, matricNo } =
      await this.applicationsService.downloadAllStudentDocumentsAsZip(
        userId,
        user.userId,
      );

    const sanitizedName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedName}_${matricNo}_Documents.zip`;

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    stream.pipe(res);
  }

  @Patch('documents/:documentId/review')
  @Roles(UserRole.COORDINATOR)
  async reviewDocument(
    @CurrentUser() user: any,
    @Param('documentId') documentId: string,
    @Body() reviewDto: ReviewDocumentDto,
  ) {
    const review = await this.applicationsService.reviewDocument(
      documentId,
      user.userId,
      reviewDto,
    );

    return {
      message: 'Document reviewed successfully',
      review,
    };
  }

  @Patch(':id/bli03')
  @Roles(UserRole.STUDENT)
  async updateBli03Data(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() updateBli03Dto: UpdateBli03Dto,
  ) {
    const application = await this.applicationsService.updateBli03Data(
      applicationId,
      user.userId,
      updateBli03Dto,
    );

    return {
      message: 'BLI-03 data updated successfully',
      application,
    };
  }

  @Get('bli03/submissions')
  @Roles(UserRole.COORDINATOR)
  async getBli03Submissions(
    @CurrentUser() user: any,
    @Query('sessionId') sessionId?: string,
    @Query('program') program?: string,
  ) {
    const submissions = await this.applicationsService.getBli03Submissions(
      user.userId,
      { sessionId, program },
    );
    return { submissions };
  }

  @Get('bli03/submissions/:id')
  @Roles(UserRole.COORDINATOR)
  async getBli03SubmissionById(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
  ) {
    const submission = await this.applicationsService.getBli03SubmissionById(
      applicationId,
      user.userId,
    );
    return { submission };
  }

  @Post(':id/bli04')
  @Roles(UserRole.STUDENT)
  async submitBli04(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() bli04Data: any,
  ) {
    const result = await this.applicationsService.submitBli04(
      applicationId,
      user.userId,
      bli04Data,
    );
    return {
      message: 'BLI-04 form submitted successfully',
      ...result,
    };
  }

  @Post(':id/sli04/pdf')
  @Roles(UserRole.STUDENT)
  async generateSLI04PDF(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() sli04Data: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pdfBuffer = await this.applicationsService.generateSLI04PDF(
      id,
      user.userId,
      sli04Data,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="SLI-04-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return new StreamableFile(pdfBuffer);
  }

  @Get(':id/documents')
  @Roles(UserRole.STUDENT)
  async getStudentDocuments(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
  ) {
    const documents = await this.applicationsService.getStudentDocuments(
      applicationId,
      user.userId,
    );
    return { documents };
  }

  @Get(':id/documents/:documentId/download')
  @Roles(UserRole.STUDENT)
  async downloadStudentDocument(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Param('documentId') documentId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const fileBuffer = await this.applicationsService.downloadStudentDocument(
      applicationId,
      documentId,
      user.userId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="document-${documentId}.pdf"`,
      'Content-Length': fileBuffer.length,
    });

    return new StreamableFile(fileBuffer);
  }

  @Post(':id/bli04/save')
  @Roles(UserRole.STUDENT)
  async saveBli04Draft(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() bli04Data: any,
  ) {
    const formResponse = await this.applicationsService.saveBli04Draft(
      applicationId,
      user.userId,
      bli04Data,
    );
    return {
      message: 'BLI-04 draft saved successfully',
      formResponse,
    };
  }

  @Post(':id/bli04/generate-link')
  @Roles(UserRole.STUDENT)
  async generateSupervisorLink(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
  ) {
    const linkData = await this.applicationsService.generateSupervisorLink(
      applicationId,
      user.userId,
    );
    return {
      message: 'Supervisor link generated successfully',
      ...linkData,
    };
  }

  @Get('bli04/submissions')
  @Roles(UserRole.COORDINATOR)
  async getBli04Submissions(
    @CurrentUser() user: any,
    @Query('sessionId') sessionId?: string,
    @Query('program') program?: string,
  ) {
    const submissions = await this.applicationsService.getBli04Submissions(
      user.userId,
      { sessionId, program },
    );
    return { submissions };
  }

  @Post('bli04/submissions/:id/verify')
  @Roles(UserRole.COORDINATOR)
  async verifyBli04Submission(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() verifyDto: { decision: string; comments?: string },
  ) {
    const review = await this.applicationsService.verifyBli04Submission(
      applicationId,
      user.userId,
      verifyDto.decision as any,
      verifyDto.comments,
    );
    return {
      message: 'BLI-04 submission verified successfully',
      review,
    };
  }

  @Post(':id/bli03/submit')
  @Roles(UserRole.STUDENT)
  async submitBli03WithSignature(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() submitBli03Dto: SubmitBli03Dto,
  ) {
    const result = await this.applicationsService.submitBli03WithSignature(
      applicationId,
      user.userId,
      submitBli03Dto,
    );
    return result;
  }

  @Post('bli03/submissions/:id/approve')
  @Roles(UserRole.COORDINATOR)
  async approveBli03Submission(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() approveBli03Dto: ApproveBli03Dto,
  ) {
    const result = await this.applicationsService.approveBli03Submission(
      applicationId,
      user.userId,
      approveBli03Dto,
    );
    return result;
  }

  @Get(':id/unlock-status')
  @Roles(UserRole.STUDENT)
  async getDocumentUnlockStatus(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
  ) {
    const unlockData = await this.applicationsService.getDocumentUnlockStatus(
      applicationId,
      user.userId,
    );
    return unlockData;
  }

  @Post(':id/upload-signature')
  @Roles(UserRole.STUDENT)
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: diskStorage({
        destination: './uploads/signatures',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `signature-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/i)) {
          return cb(new Error('Only PNG and JPG image files are allowed for signatures'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  async uploadStudentSignature(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.applicationsService.uploadStudentSignature(
      applicationId,
      user.userId,
      file,
    );
    return {
      message: 'Signature uploaded successfully',
      ...result,
    };
  }

  @Post(':id/upload-supervisor-signature')
  @Public()
  @UseInterceptors(
    FileInterceptor('signature', {
      storage: diskStorage({
        destination: './uploads/signatures',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `supervisor-signature-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/i)) {
          return cb(new Error('Only PNG and JPG image files are allowed for signatures'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  async uploadSupervisorSignature(
    @Param('id') applicationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('token') token?: string,
  ) {
    const result = await this.applicationsService.uploadSupervisorSignature(
      applicationId,
      file,
      token,
    );
    return {
      message: 'Supervisor signature uploaded successfully',
      ...result,
    };
  }

  @Post('test/bli03-pdf')
  @Public()
  async generateTestBLI03PDF(
    @Body() testData: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pdfBuffer = await this.applicationsService.generateTestBLI03PDF(testData);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="BLI-03-TEST.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return new StreamableFile(pdfBuffer);
  }
}
