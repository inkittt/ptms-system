import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  studentName: string;

  @IsString()
  @IsNotEmpty()
  icNo: string;

  @IsString()
  @IsNotEmpty()
  matricNo: string;

  @IsUUID()
  @IsNotEmpty()
  trainingSession: string;

  @IsString()
  @IsNotEmpty()
  cgpa: string;

  @IsString()
  @IsNotEmpty()
  program: string;

  @IsString()
  @IsNotEmpty()
  faculty: string;
}
