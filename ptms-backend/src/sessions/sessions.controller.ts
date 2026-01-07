import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() createSessionDto: CreateSessionDto, @Request() req) {
    return this.sessionsService.create(createSessionDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    // If user is a coordinator, only show their sessions
    if (req.user.role === UserRole.COORDINATOR) {
      return this.sessionsService.findByCoordinator(req.user.userId);
    }
    // Admins can see all sessions
    return this.sessionsService.findAll();
  }

  @Get('my-coordinator-sessions')
  @Roles(UserRole.COORDINATOR)
  getMyCoordinatorSessions(@Request() req) {
    return this.sessionsService.findByCoordinator(req.user.userId);
  }

  @Get('my-session')
  @Roles(UserRole.STUDENT)
  getMySession(@Request() req) {
    return this.sessionsService.getStudentSession(req.user.userId);
  }

  @Get('my-sessions')
  @Roles(UserRole.STUDENT)
  getMySessions(@Request() req) {
    return this.sessionsService.getStudentSessions(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionsService.update(id, updateSessionDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  remove(@Param('id') id: string) {
    return this.sessionsService.remove(id);
  }

  @Post(':id/import-students')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  @UseInterceptors(FileInterceptor('file'))
  async importStudents(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    if (!file.originalname.endsWith('.csv')) {
      throw new BadRequestException('Only CSV files are allowed');
    }

    return this.sessionsService.importStudentsFromCsv(id, file.buffer);
  }

  @Get(':id/students')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  getSessionStudents(@Param('id') id: string) {
    return this.sessionsService.getSessionStudents(id);
  }

  @Delete(':sessionId/students/:userId')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  removeStudentFromSession(
    @Param('sessionId') sessionId: string,
    @Param('userId') userId: string,
  ) {
    return this.sessionsService.removeStudentFromSession(sessionId, userId);
  }
}
