import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('supervisor')
@Public()
export class SupervisorController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get('verify/:token')
  async verifySupervisorToken(@Param('token') token: string) {
    try {
      const data = await this.applicationsService.verifySupervisorToken(token);
      return {
        success: true,
        ...data,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('sign/:token')
  async submitSupervisorSignature(
    @Param('token') token: string,
    @Body() signatureData: {
      signature?: string;
      signatureType: 'typed' | 'drawn' | 'image';
      reportingDate: string;
      remarks?: string;
    },
  ) {
    try {
      const result = await this.applicationsService.submitSupervisorSignature(
        token,
        signatureData,
      );
      return {
        success: true,
        message: 'BLI-04 form signed successfully',
        ...result,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
