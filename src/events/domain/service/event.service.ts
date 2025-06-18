import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventDto } from '../application/dto/event.dto';
import { Event } from 'src/events/event.entity';
import { MatchService } from 'src/matches/domain/services/match.service';
import { PlayerService } from 'src/players/domain/service/player.service';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private matchService: MatchService,
    private playerService: PlayerService,
  ) { }

  async getEvent(eventDto: EventDto) {
    const { matchNumber, occurredAt, weapon, killer, victim } = eventDto;

    const match = await this.matchService.getMatchByMatchNumber(matchNumber);
    const killerPlayer = await this.playerService.getPlayerByName(killer);
    const victimPlayer = await this.playerService.getPlayerByName(victim);

    if (!match || !killerPlayer || !victimPlayer) {
      throw new Error('Match or player not found');
    }

    return this.eventRepository.findOne({
        where: {
          match,
          occurredAt,
          killer: killerPlayer,
          victim: victimPlayer
        }
      });
  }

  async createEvent(eventDto: EventDto) {
    const existingEvent = await this.getEvent(eventDto);

    if (existingEvent) {
      throw new Error('Event already exists');
    }

    const { matchNumber, occurredAt, weapon, killer, victim } = eventDto;

    const match = await this.matchService.getMatchByMatchNumber(matchNumber);
    const killerPlayer = await this.playerService.getPlayerByName(killer);
    const victimPlayer = await this.playerService.getPlayerByName(victim);

    if (!match || !killerPlayer || !victimPlayer) {
      throw new Error('Match or player not found');
    }

    const eventData = {
      match,
      occurredAt,
      weapon,
      killer: killerPlayer,
      victim: victimPlayer
    };

    return this.eventRepository.save(eventData);
  }

  async getAllEvents(): Promise<Event[]> {
    return this.eventRepository.find({
      relations: ['match', 'killer', 'victim']
    });
  }
}
