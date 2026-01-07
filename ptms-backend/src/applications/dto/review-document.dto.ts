import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Decision } from '@prisma/client';

export class ReviewDocumentDto {
  @IsEnum(Decision)
  decision: Decision;

  @IsOptional()
  @IsString()
  comments?: string;
}
