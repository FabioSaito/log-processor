import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateBulkPlayerMatchStatsDto {

  @IsNotEmpty()
  @IsObject()
  teams: {
    terrorists: string[];
    counterTerrorists: string[];
  };

  @IsNotEmpty()
  @IsString()
  matchNumber: string;
}
