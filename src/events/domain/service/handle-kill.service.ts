import { Injectable } from '@nestjs/common';
import { Match } from '../../../matches/match.entity';
import { Player } from '../../../players/player.entity';
import { weaponEnum } from '../../event.entity';
import { PlayerMatchStats } from '../../../player-match-stats/player-match-stats.entity';
import { EventDto } from '../application/dto/event.dto';
import { PlayerService } from 'src/players/domain/service/player.service';
import { MatchService } from 'src/matches/domain/services/match.service';
import { PlayerMatchStatsService } from 'src/player-match-stats/domain/service/player-match-stats.service';
import { EventService } from './event.service';

@Injectable()
export class HandleKillService {
  constructor(
    private playerService: PlayerService,
    private matchService: MatchService,
    private playerMatchStatsService: PlayerMatchStatsService,
    private eventService: EventService,
  ) {}

  async handleKill(eventDto: EventDto) {
    const match = await this.matchService.getMatchByMatchNumber(eventDto.matchNumber);
    if (!match) {
      throw new Error('Match not found');
    }

    const killer = await this.playerService.getOrCreatePlayer({name: eventDto.killer});
    if (!killer) {
      throw new Error('Killer not found');
    }

    const victim = await this.playerService.getPlayerByName(eventDto.victim);
    if (!victim) {
      throw new Error('Victim not found');
    }

    const timestamp = eventDto.occurredAt;
    const weapon = eventDto.weapon;

    await this.processKillEvent(
      match,
      timestamp,
      weapon,
      victim,
      killer
    );
  }

  private async processKillEvent(
    match: Match,
    timestamp: Date,
    weapon: weaponEnum,
    victim: Player,
    killer: Player
  ) {

    const isWorld = killer.name == '<WORLD>';

    const killerMatchStats = await this.playerMatchStatsService.getOrCreatePlayerMatchStats({
      player: killer,
      match: match
    });

    if (!killerMatchStats) {
      throw new Error('Killer match stats not found');
    }

    const victimMatchStats = await this.playerMatchStatsService.getPlayerMatchStats({
      player: victim,
      match: match
    });

    if (!victimMatchStats) {
      throw new Error('Victim match stats not found');
    }

    const isFriendlyFire = this.isFriendlyFire(killerMatchStats, victimMatchStats);

    // Handle killer
    if (!isWorld) {
      await this.playerMatchStatsService.updatePlayerKills(killerMatchStats, isFriendlyFire);
    }

    // Handle victim
    await this.playerMatchStatsService.updatePlayerDeaths(victimMatchStats);

    await this.eventService.createEvent({
      matchNumber: match.matchNumber,
      occurredAt: timestamp,
      killer: killer.name,
      victim: victim.name,
      weapon
    });
  }

  private isFriendlyFire(killerMatchStats: PlayerMatchStats, victimMatchStats: PlayerMatchStats): boolean {
    return killerMatchStats?.team === victimMatchStats?.team;
  }
}
