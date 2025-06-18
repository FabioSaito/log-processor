import { Injectable } from '@nestjs/common';
import { HandleKillService } from '../events/domain/service/handle-kill.service';
import { TimestampService } from './timestamp.service';
import { CreateMatchDto } from 'src/matches/domain/application/dto/create-match.dto';
import { FinishMatchDto } from 'src/matches/domain/application/dto/finish-match.dto';
import { MatchService } from 'src/matches/domain/services/match.service';
import { EventDto } from 'src/events/domain/application/dto/event.dto';

import { weaponEnum } from 'src/events/event.entity';
import { CreateBulkPlayerMatchStatsDto } from 'src/player-match-stats/domain/application/dto/create-bulk-player-match-stats.dto';
import { PlayerMatchStatsService } from 'src/player-match-stats/domain/service/player-match-stats.service';
import { PlayerService } from 'src/players/domain/service/player.service';

enum LogType {
  Match = 'match',
  Kill = 'kill',
  End = 'end',
  Teams = 'teams',
}

@Injectable()
export class LogHandlerService {
  private currentMatchNumber: string | null = null;

  constructor(
    private handleKillService: HandleKillService,
    private timestampService: TimestampService,
    private matchService: MatchService,
    private playerMatchStatsService: PlayerMatchStatsService,
    private playerService: PlayerService,
  ) {}

  async parseLog(logContent: string): Promise<void> {
    const lines = logContent.split('\n');

    let logType: LogType;
    let logInfo;
    logType = LogType.Match

    for (const line of lines) {
      if (!line.trim()) continue;

      if (line.includes('New match')) {
        logType = LogType.Match;
        logInfo = this.parseLine(line, logType);

      } else if (line.includes('killed')) {
        logType = LogType.Kill;
        logInfo = this.parseLine(line, logType);

      } else if (line.includes('has ended')) {
        logType = LogType.End;
        logInfo = this.parseLine(line, logType);
      } else if (line.includes('TERRORISTS:')) {
        logType = LogType.Teams;
        logInfo = this.parseLine(line, logType);
      }

      switch (logType) {
        case LogType.Match:
          await this.handleNewMatch(logInfo);
          break;
        case LogType.Kill:
          await this.handleKillService.handleKill(logInfo);
          break;
        case LogType.End:
          await this.handleMatchEnd(logInfo);
          break;
        case LogType.Teams:
          await this.handleTeams(logInfo);
          break;
      }
    }
  }

  private parseLine(line: string, logType: LogType){
    const timestamp =  this.timestampService.parse(line);

    switch (logType) {
      case LogType.Match:
        const matchNumber = line.match(/match (\d+)/)?.[1];
        this.currentMatchNumber = matchNumber || null;

        return {
          startTime: timestamp,
          matchNumber
        }

      case LogType.Kill:
        const [, , killer, victim, weapon] = line.match(/(.+) - (.+) killed (.+) (?:using|by) (.+)/) || [];

        const eventDto = new EventDto();
        eventDto.matchNumber = this.currentMatchNumber || '';
        eventDto.occurredAt = this.timestampService.parse(line) || new Date();
        eventDto.killer = killer;
        eventDto.victim = victim;
        eventDto.weapon = weapon as weaponEnum;

        return eventDto

      case LogType.End:
        return {
          endTime: timestamp,
          matchNumber: this.currentMatchNumber || ''
        }

      case LogType.Teams:
        const teamsMatch = line.match(/TERRORISTS: \[(.*)\], COUNTER_TERRORISTS: \[(.*)\]/);
        if (!teamsMatch) return;

        const terrorists = teamsMatch[1].split(', ');
        const counterTerrorists = teamsMatch[2].split(', ');

        return {
          teams: {
            terrorists,
            counterTerrorists,
          },
          matchNumber: this.currentMatchNumber || '',
        }
    }
  }

  private async handleNewMatch(matchParams: CreateMatchDto) {
    await this.matchService.createMatch(matchParams);
  }

  private async handleMatchEnd(matchParams: FinishMatchDto) {
    this.currentMatchNumber = null;
    await this.matchService.finishMatch(matchParams);
  }

  private async handleTeams(playerMatchStats: CreateBulkPlayerMatchStatsDto) {
    await this.playerMatchStatsService.createBatchPlayerMatchStats(playerMatchStats);
  }
}
