import { IsNotEmpty, IsString } from 'class-validator';

export class ImportStudentsDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
