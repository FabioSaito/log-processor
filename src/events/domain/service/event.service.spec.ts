import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventService } from './event.service';
import { Event } from '../../event.entity';
import { MatchService } from '../../../matches/domain/services/match.service';
import { PlayerService } from '../../../players/domain/service/player.service';
import { Repository } from 'typeorm';
import { EventDto } from '../application/dto/event.dto';

describe('EventService', () => {
  let service: EventService;
  let repo: Repository<Event>;
  let matchService: MatchService;
  let playerService: PlayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getRepositoryToken(Event),
          useClass: Repository,
        },
        {
          provide: MatchService,
          useValue: { getMatchByMatchNumber: jest.fn() },
        },
        {
          provide: PlayerService,
          useValue: { getPlayerByName: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    repo = module.get<Repository<Event>>(getRepositoryToken(Event));
    matchService = module.get<MatchService>(MatchService);
    playerService = module.get<PlayerService>(PlayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEvent', () => {
    it('should return event when found', async () => {
      const eventDto: EventDto = {
        matchNumber: '123',
        occurredAt: new Date(),
        killer: 'Roman',
        victim: 'Nick',
        weapon: 'M16' as any
      };

      const match = { id: 1, matchNumber: '123' } as any;
      const killer = { id: 1, name: 'Roman' } as any;
      const victim = { id: 2, name: 'Nick' } as any;
      const event = { id: 1, match, killer, victim } as any;

      jest.spyOn(matchService, 'getMatchByMatchNumber').mockResolvedValue(match);
      jest.spyOn(playerService, 'getPlayerByName')
        .mockResolvedValueOnce(killer)
        .mockResolvedValueOnce(victim);
      jest.spyOn(repo, 'findOne').mockResolvedValue(event);

      const result = await service.getEvent(eventDto);

      expect(result).toEqual(event);
    });

    it('should return null when event not found', async () => {
      const eventDto: EventDto = {
        matchNumber: '123',
        occurredAt: new Date(),
        killer: 'Roman',
        victim: 'Nick',
        weapon: 'M16' as any
      };

      const match = { id: 1, matchNumber: '123' } as any;
      const killer = { id: 1, name: 'Roman' } as any;
      const victim = { id: 2, name: 'Nick' } as any;

      jest.spyOn(matchService, 'getMatchByMatchNumber').mockResolvedValue(match);
      jest.spyOn(playerService, 'getPlayerByName')
        .mockResolvedValueOnce(killer)
        .mockResolvedValueOnce(victim);
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      const result = await service.getEvent(eventDto);

      expect(result).toBeNull();
    });

    it('should throw error when match not found', async () => {
      const eventDto: EventDto = {
        matchNumber: '123',
        occurredAt: new Date(),
        killer: 'Roman',
        victim: 'Nick',
        weapon: 'M16' as any
      };

      jest.spyOn(matchService, 'getMatchByMatchNumber').mockResolvedValue(null);

      await expect(service.getEvent(eventDto)).rejects.toThrow('Match or player not found');
    });

    it('should throw error when killer not found', async () => {
      const eventDto: EventDto = {
        matchNumber: '123',
        occurredAt: new Date(),
        killer: 'Roman',
        victim: 'Nick',
        weapon: 'M16' as any
      };

      const match = { id: 1, matchNumber: '123' } as any;

      jest.spyOn(matchService, 'getMatchByMatchNumber').mockResolvedValue(match);
      jest.spyOn(playerService, 'getPlayerByName').mockResolvedValue(null);

      await expect(service.getEvent(eventDto)).rejects.toThrow('Match or player not found');
    });

    it('should throw error when victim not found', async () => {
      const eventDto: EventDto = {
        matchNumber: '123',
        occurredAt: new Date(),
        killer: 'Roman',
        victim: 'Nick',
        weapon: 'M16' as any
      };

      const match = { id: 1, matchNumber: '123' } as any;
      const killer = { id: 1, name: 'Roman' } as any;

      jest.spyOn(matchService, 'getMatchByMatchNumber').mockResolvedValue(match);
      jest.spyOn(playerService, 'getPlayerByName')
        .mockResolvedValueOnce(killer)
        .mockResolvedValueOnce(null);

      await expect(service.getEvent(eventDto)).rejects.toThrow('Match or player not found');
    });
  });

  describe('createEvent', () => {
    it('should create event successfully', async () => {
      const eventDto: EventDto = {
        matchNumber: '123',
        occurredAt: new Date(),
        killer: 'Roman',
        victim: 'Nick',
        weapon: 'M16' as any
      };

      const match = { id: 1, matchNumber: '123' } as any;
      const killer = { id: 1, name: 'Roman' } as any;
      const victim = { id: 2, name: 'Nick' } as any;
      const createdEvent = { id: 1, match, killer, victim, weapon: 'M16' } as any;

      jest.spyOn(matchService, 'getMatchByMatchNumber').mockResolvedValue(match);
      jest.spyOn(playerService, 'getPlayerByName')
        .mockResolvedValueOnce(killer)
        .mockResolvedValueOnce(victim)
        .mockResolvedValueOnce(killer)
        .mockResolvedValueOnce(victim);
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      jest.spyOn(repo, 'save').mockResolvedValue(createdEvent);

      const result = await service.createEvent(eventDto);

      expect(result).toEqual(createdEvent);
      expect(repo.save).toHaveBeenCalledWith({
        match,
        occurredAt: eventDto.occurredAt,
        weapon: eventDto.weapon,
        killer,
        victim
      });
    });

    it('should throw error when event already exists', async () => {
      const eventDto: EventDto = {
        matchNumber: '123',
        occurredAt: new Date(),
        killer: 'Roman',
        victim: 'Nick',
        weapon: 'M16' as any
      };

      const match = { id: 1, matchNumber: '123' } as any;
      const killer = { id: 1, name: 'Roman' } as any;
      const victim = { id: 2, name: 'Nick' } as any;
      const existingEvent = { id: 1, match, killer, victim } as any;

      jest.spyOn(matchService, 'getMatchByMatchNumber').mockResolvedValue(match);
      jest.spyOn(playerService, 'getPlayerByName')
        .mockResolvedValueOnce(killer)
        .mockResolvedValueOnce(victim);
      jest.spyOn(repo, 'findOne').mockResolvedValue(existingEvent);

      await expect(service.createEvent(eventDto)).rejects.toThrow('Event already exists');
    });
  });

  describe('getAllEvents', () => {
    it('should return all events with relations', async () => {
      const events = [
        { id: 1, match: { id: 1 }, killer: { id: 1 }, victim: { id: 2 } },
        { id: 2, match: { id: 1 }, killer: { id: 2 }, victim: { id: 3 } }
      ] as any;

      jest.spyOn(repo, 'find').mockResolvedValue(events);

      const result = await service.getAllEvents();

      expect(result).toEqual(events);
    });

    it('should return empty array when no events exist', async () => {
      jest.spyOn(repo, 'find').mockResolvedValue([]);

      const result = await service.getAllEvents();

      expect(result).toEqual([]);
    });
  });
});
