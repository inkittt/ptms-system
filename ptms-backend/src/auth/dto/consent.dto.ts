import { IsBoolean } from 'class-validator';

export class ConsentDto {
  @IsBoolean()
  pdpaConsent: boolean;

  @IsBoolean()
  tosAccepted: boolean;
}
