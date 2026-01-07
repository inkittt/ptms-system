import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('programs')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  async getPrograms() {
    const programs = await this.studentsService.getPrograms();
    return { programs };
  }

  @Get('dashboard')
  @Roles(UserRole.STUDENT)
  async getDashboard(@CurrentUser() user: any) {
    return this.studentsService.getDashboardData(user.userId);
  }

  @Get('export-csv')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  async exportCsv(
    @Query('program') program: string,
    @Res() res: Response,
  ) {
    let students;
    
    if (program && program !== 'ALL') {
      students = await this.studentsService.exportStudentsByProgram(program);
    } else {
      students = await this.studentsService.exportAllStudents();
    }

    const csvHeader = 'matricNo,creditsEarned,status\n';
    const csvRows = students
      .map(s => `${s.matricNo},${s.creditsEarned},${s.status}`)
      .join('\n');
    
    const csvContent = csvHeader + csvRows;

    const filename = program && program !== 'ALL' 
      ? `students_${program}_${new Date().toISOString().split('T')[0]}.csv`
      : `students_all_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  }

  @Get('coordinator/students')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  async getCoordinatorStudents(
    @CurrentUser() user: any,
    @Query('sessionId') sessionId?: string,
    @Query('program') program?: string,
    @Query('eligibility') eligibility?: string,
  ) {
    const students = await this.studentsService.getCoordinatorStudents(
      user.userId,
      { sessionId, program, eligibility }
    );
    return { students };
  }

  @Get('coordinator/students/:id')
  @Roles(UserRole.COORDINATOR, UserRole.ADMIN)
  async getStudentDetails(
    @CurrentUser() user: any,
    @Query('id') studentId: string,
  ) {
    const studentDetails = await this.studentsService.getStudentDetails(
      user.userId,
      studentId
    );
    return studentDetails;
  }
}
