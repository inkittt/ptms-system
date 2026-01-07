import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class UploadDocumentDto {
  @IsNotEmpty()
  @IsString()
  applicationId: string;

  @IsEnum(DocumentType)
  documentType: DocumentType;
}
