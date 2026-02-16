import { IsString, IsNotEmpty, IsEmail, IsBoolean, IsDateString, IsEnum } from 'class-validator';

export class SubmitBli03Dto {
  // Student Information
  @IsString()
  @IsNotEmpty()
  studentPhone: string;

  @IsEmail()
  @IsNotEmpty()
  studentEmail: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  // Organization Information
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

  @IsString()
  @IsNotEmpty()
  reportingPeriod: string;

  // Student Signature
  @IsString()
  studentSignature?: string;

  @IsEnum(['typed', 'drawn', 'image'])
  @IsNotEmpty()
  studentSignatureType: 'typed' | 'drawn' | 'image';
}
