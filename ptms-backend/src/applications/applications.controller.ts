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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
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

  @Get(':id/bli01/pdf')
  @Roles(UserRole.STUDENT)
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

  @Get(':id/bli03/pdf')
  @Roles(UserRole.STUDENT)
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

  @Get(':id/sli03/pdf')
  @Roles(UserRole.STUDENT)
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

  @Get(':id/dli01/pdf')
  @Roles(UserRole.STUDENT)
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

  @Get(':id/bli04/pdf')
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
}
