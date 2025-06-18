import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerMatchStats, teamEnum } from '../../player-match-stats.entity';
import { PlayerMatchStatsDto } from '../application/dto/player-match-stats.dto';
import { CreateBulkPlayerMatchStatsDto } from '../application/dto/create-bulk-player-match-stats.dto';
import { PlayerService } from '../../../players/domain/service/player.service';
import { MatchService } from '../../../matches/domain/services/match.service';

@Injectable()
export class PlayerMatchStatsService {
  constructor(
    @InjectRepository(PlayerMatchStats)
    private playerMatchStatsRepository: Repository<PlayerMatchStats>,
    private playerService: PlayerService,
    private matchService: MatchService
  ) {}

  async getAllPlayerMatchStats(): Promise<PlayerMatchStats[]> {
    return await this.playerMatchStatsRepository.find({
      relations: ['player', 'match']
    });
  }

  async getPlayerMatchStats(playerMatchStats: PlayerMatchStatsDto): Promise<PlayerMatchStats | null> {
    return await this.playerMatchStatsRepository.findOne({
      where: {
        player: {
          id: playerMatchStats.player.id
        },
        match: {
          id: playerMatchStats.match.id
        }
      }
    });
  }

  async createPlayerMatchStats(playerMatchStats: PlayerMatchStatsDto): Promise<PlayerMatchStats> {
    const existingPlayerMatchStats = await this.getPlayerMatchStats(playerMatchStats);

    if (existingPlayerMatchStats) {
      throw new Error('Player Match Stats already exists');
    }

    return this.playerMatchStatsRepository.save(playerMatchStats);
  }

  async createBatchPlayerMatchStats(playerMatchStats: CreateBulkPlayerMatchStatsDto){
    const match = await this.matchService.getMatchByMatchNumber(playerMatchStats.matchNumber);

    if (!match) {
      throw new Error('Match not found');
    }

    for (const playerName of playerMatchStats.teams.terrorists) {
      const player = await this.playerService.getOrCreatePlayer({ name: playerName });

      await this.createPlayerMatchStats({
        player,
        match,
        team: teamEnum.TERRORISTS,
      });
    }

    for (const playerName of playerMatchStats.teams.counterTerrorists) {
      const player = await this.playerService.getOrCreatePlayer({ name: playerName });

      await this.createPlayerMatchStats({
        player,
        match,
        team: teamEnum.COUNTER_TERRORISTS,
      });
    }
  }

  async getOrCreatePlayerMatchStats(playerMatchStats: PlayerMatchStatsDto) {
    const existingPlayerMatchStats = await this.getPlayerMatchStats(playerMatchStats);

    if (existingPlayerMatchStats) {
      return existingPlayerMatchStats;
    }

    return this.createPlayerMatchStats(playerMatchStats);
  }

  async updatePlayerKills(playerMatchStats: PlayerMatchStatsDto, isFriendlyFire: boolean = false) {
    const existingPlayerMatchStats = await this.getOrCreatePlayerMatchStats(playerMatchStats);
    const currentKills = existingPlayerMatchStats.kills;

    const updatedKillCount = isFriendlyFire ? currentKills - 1 : currentKills + 1;

    existingPlayerMatchStats.kills = updatedKillCount;

    this.playerMatchStatsRepository.save(existingPlayerMatchStats);
  }

  async updatePlayerDeaths(playerMatchStats: PlayerMatchStatsDto) {
    const existingPlayerMatchStats = await this.getOrCreatePlayerMatchStats(playerMatchStats);
    const currentDeaths = existingPlayerMatchStats.deaths;

    existingPlayerMatchStats.deaths = currentDeaths + 1;

    this.playerMatchStatsRepository.save(existingPlayerMatchStats);
  }
}
