import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UpdateBli03Dto {
  // A. Student Information (BUTIRAN PELAJAR)
  @IsString()
  @IsOptional()
  studentPhone?: string;

  @IsEmail()
  @IsOptional()
  studentEmail?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  // B. Organization Selection (PEMILIHAN TEMPAT ORGANISASI)
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @IsString()
  @IsNotEmpty()
  organizationAddress: string;

  @IsString()
  @IsNotEmpty()
  organizationPhone: string;

  @IsString()
  @IsOptional()
  organizationFax?: string;

  @IsEmail()
  @IsNotEmpty()
  organizationEmail: string;

  @IsString()
  @IsNotEmpty()
  contactPersonName: string;

  @IsString()
  @IsNotEmpty()
  contactPersonPhone: string;

  @IsBoolean()
  @IsNotEmpty()
  organizationDeclaration: boolean;

  // Additional BLI03 Information
  @IsString()
  @IsOptional()
  reportingPeriod?: string;

  @IsString()
  @IsOptional()
  roleTasksSummary?: string;

  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @IsEmail()
  @IsOptional()
  emergencyContactEmail?: string;
}
