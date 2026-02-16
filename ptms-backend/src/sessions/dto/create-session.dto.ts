import { IsInt, IsNotEmpty, IsString, IsObject, Min, Max, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsInt()
  @Min(1)
  @Max(2)
  semester: number;

  @IsDateString()
  @IsOptional()
  trainingStartDate?: string;

  @IsDateString()
  @IsOptional()
  trainingEndDate?: string;

  @IsObject()
  @IsOptional()
  deadlinesJSON?: {
    applicationDeadline?: string;
    bli03Deadline?: string;
    reportingDeadline?: string;
  };

  @IsInt()
  @Min(1)
  @IsOptional()
  minCredits?: number;

  @IsInt()
  @Min(1)
  minWeeks: number;

  @IsInt()
  @Min(1)
  maxWeeks: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  coordinatorSignature?: string;

  @IsString()
  @IsOptional()
  coordinatorSignatureType?: string;
}
