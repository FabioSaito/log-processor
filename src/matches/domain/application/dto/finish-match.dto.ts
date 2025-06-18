import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class FinishMatchDto {
  @IsNotEmpty()
  @IsString()
  matchNumber: string;

  @IsNotEmpty()
  @IsDate()
  endTime: Date;
}
