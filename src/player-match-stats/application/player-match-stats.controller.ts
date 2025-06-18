import { Controller, Get } from "@nestjs/common";
import { PlayerMatchStatsService } from "../domain/service/player-match-stats.service";
import { PlayerMatchStats } from "../player-match-stats.entity";

@Controller('player-match-stats')
export class PlayerMatchStatsController {
  constructor(private readonly playerMatchStatsService: PlayerMatchStatsService) {}

  @Get()
  async getAllPlayerMatchStats(): Promise<PlayerMatchStats[]> {
    return this.playerMatchStatsService.getAllPlayerMatchStats();
  }
}
