import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateMatchDto {
  @IsNotEmpty()
  @IsString()
  matchNumber: string;

  @IsNotEmpty()
  @IsDate()
  startTime: Date;
}
