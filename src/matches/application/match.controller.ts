import { Controller, Get, Param } from "@nestjs/common";
import { MatchService } from "../domain/services/match.service";
import { Match } from "../match.entity";

@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get()
  async getAllMatches(): Promise<Match[]> {
    return this.matchService.getAllMatches();
  }

  @Get(':matchNumber')
  async getMatchByNumber(@Param('matchNumber') matchNumber: string) {
    const match = await this.matchService.getMatchByMatchNumberComplete(matchNumber);

    if (!match) {
      return { error: 'Match not found' };
    }

    return {
      id: match.id,
      matchNumber: match.matchNumber,
      startTime: match.startTime,
      endTime: match.endTime,
      players: match.playerStats.map(stats => ({
        name: stats.player.name,
        team: stats.team,
        kills: stats.kills,
        deaths: stats.deaths,
        score: stats.kills - stats.deaths
      }))
    };
  }
}
