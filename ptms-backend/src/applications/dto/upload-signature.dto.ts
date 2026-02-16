import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum SignatureRole {
  STUDENT = 'student',
  SUPERVISOR = 'supervisor',
  COORDINATOR = 'coordinator',
}

export class UploadSignatureDto {
  @IsEnum(SignatureRole)
  @IsNotEmpty()
  role: SignatureRole;

  @IsString()
  @IsNotEmpty()
  applicationId: string;
}
