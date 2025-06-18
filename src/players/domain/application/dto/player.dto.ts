import { IsNotEmpty, IsString } from 'class-validator';

export class PlayerDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
