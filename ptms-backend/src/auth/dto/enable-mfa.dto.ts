import { IsString } from 'class-validator';

export class EnableMfaDto {
  @IsString()
  token: string;
}

export class VerifyMfaDto {
  @IsString()
  token: string;
}
