import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogParserController } from './events/application/event.controller';
import { LogHandlerService } from './services/log-handler.service';
import { HandleKillService } from './events/domain/service/handle-kill.service';
import { TimestampService } from './services/timestamp.service';
import { Match } from './matches/match.entity';
import { Player } from './players/player.entity';
import { Event } from './events/event.entity';
import { Award } from './awards/award.entity';
import { PlayerMatchStats } from './player-match-stats/player-match-stats.entity';
import { MatchService } from './matches/domain/services/match.service';
import { PlayerService } from './players/domain/service/player.service';
import { PlayerMatchStatsService } from './player-match-stats/domain/service/player-match-stats.service';
import { EventService } from './events/domain/service/event.service';
import { MatchController } from './matches/application/match.controller';
import { PlayerMatchStatsController } from './player-match-stats/application/player-match-stats.controller';

@Module({
  imports: [
    MulterModule.register({
      // dest: './uploads',
      // storage: undefined,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Match, Player, Event, Award, PlayerMatchStats],
      synchronize: true, // Only for development
      // logging: true,
    }),
    TypeOrmModule.forFeature([Match, Player, Event, Award, PlayerMatchStats]),
  ],
  controllers: [LogParserController, MatchController, PlayerMatchStatsController],
  providers: [
    LogHandlerService,
    HandleKillService,
    TimestampService,
    MatchService,
    PlayerService,
    PlayerMatchStatsService,
    EventService
  ],
})
export class AppModule {}
