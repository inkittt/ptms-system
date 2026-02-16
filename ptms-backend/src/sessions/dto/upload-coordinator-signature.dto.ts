import { IsNotEmpty, IsString } from 'class-validator';

export class UploadCoordinatorSignatureDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
