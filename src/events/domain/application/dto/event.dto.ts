import { IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { weaponEnum } from 'src/events/event.entity';

export class EventDto {
  @IsNotEmpty()
  @IsString()
  matchNumber: string;

  @IsNotEmpty()
  @IsDate()
  occurredAt: Date;

  @IsNotEmpty()
  @IsString()
  killer: string;

  @IsNotEmpty()
  @IsString()
  victim: string;

  @IsNotEmpty()
  @IsEnum(weaponEnum)
  weapon: weaponEnum;
}
