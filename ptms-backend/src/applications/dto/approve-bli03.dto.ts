import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class ApproveBli03Dto {
  @IsEnum(['APPROVE', 'REQUEST_CHANGES'])
  @IsNotEmpty()
  decision: 'APPROVE' | 'REQUEST_CHANGES';

  @IsString()
  @IsOptional()
  comments?: string;

  @IsString()
  @IsOptional()
  coordinatorSignature?: string;

  @IsEnum(['typed', 'drawn'])
  @IsOptional()
  coordinatorSignatureType?: 'typed' | 'drawn';
}
