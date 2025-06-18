import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Match } from 'src/matches/match.entity';
import { teamEnum } from 'src/player-match-stats/player-match-stats.entity';
import { Player } from 'src/players/player.entity';

export class PlayerMatchStatsDto {
  @IsNotEmpty()
  @IsObject()
  player: Player;

  @IsNotEmpty()
  @IsObject()
  match: Match;

  @IsOptional()
  @IsEnum(teamEnum)
  team?: teamEnum;

  @IsOptional()
  @IsNumber()
  kills?: number = 0;

  @IsOptional()
  @IsNumber()
  deaths?: number = 0;
}
