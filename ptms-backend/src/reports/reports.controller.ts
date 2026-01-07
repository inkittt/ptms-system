import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  @Roles(UserRole.COORDINATOR, UserRole.LECTURER)
  async getOverviewStats(
    @Query('sessionId') sessionId?: string,
    @Query('program') program?: string,
  ) {
    const stats = await this.reportsService.getOverviewStats(sessionId, program);
    return { stats };
  }

  @Get('application-trends')
  @Roles(UserRole.COORDINATOR, UserRole.LECTURER)
  async getApplicationTrends(
    @Query('sessionId') sessionId?: string,
    @Query('months') months?: string,
  ) {
    const monthsCount = months ? parseInt(months) : 6;
    const trends = await this.reportsService.getApplicationTrends(sessionId, monthsCount);
    return { trends };
  }

  @Get('status-distribution')
  @Roles(UserRole.COORDINATOR, UserRole.LECTURER)
  async getStatusDistribution(
    @Query('sessionId') sessionId?: string,
    @Query('program') program?: string,
  ) {
    const distribution = await this.reportsService.getStatusDistribution(sessionId, program);
    return { distribution };
  }

  @Get('program-distribution')
  @Roles(UserRole.COORDINATOR, UserRole.LECTURER)
  async getProgramDistribution(@Query('sessionId') sessionId?: string) {
    const distribution = await this.reportsService.getProgramDistribution(sessionId);
    return { distribution };
  }

  @Get('top-companies')
  @Roles(UserRole.COORDINATOR, UserRole.LECTURER)
  async getTopCompanies(
    @Query('sessionId') sessionId?: string,
    @Query('limit') limit?: string,
  ) {
    const limitCount = limit ? parseInt(limit) : 5;
    const companies = await this.reportsService.getTopCompanies(sessionId, limitCount);
    return { companies };
  }

  @Get('industry-distribution')
  @Roles(UserRole.COORDINATOR, UserRole.LECTURER)
  async getIndustryDistribution(@Query('sessionId') sessionId?: string) {
    const distribution = await this.reportsService.getIndustryDistribution(sessionId);
    return { distribution };
  }

  @Get('document-stats')
  @Roles(UserRole.COORDINATOR, UserRole.LECTURER)
  async getDocumentStats(@Query('sessionId') sessionId?: string) {
    const stats = await this.reportsService.getDocumentStats(sessionId);
    return { stats };
  }

  @Get('review-performance')
  @Roles(UserRole.COORDINATOR, UserRole.LECTURER)
  async getReviewPerformance(
    @Query('sessionId') sessionId?: string,
    @Query('weeks') weeks?: string,
  ) {
    const weeksCount = weeks ? parseInt(weeks) : 4;
    const performance = await this.reportsService.getReviewPerformance(sessionId, weeksCount);
    return { performance };
  }

  @Get('student-progress')
  @Roles(UserRole.COORDINATOR, UserRole.LECTURER)
  async getStudentProgress(@Query('sessionId') sessionId?: string) {
    const progress = await this.reportsService.getStudentProgress(sessionId);
    return { progress };
  }
}
