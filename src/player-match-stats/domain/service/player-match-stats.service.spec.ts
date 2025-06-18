import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlayerMatchStatsService } from './player-match-stats.service';
import { PlayerMatchStats, teamEnum } from '../../player-match-stats.entity';
import { MatchService } from '../../../matches/domain/services/match.service';
import { PlayerService } from '../../../players/domain/service/player.service';
import { Repository } from 'typeorm';
import { PlayerMatchStatsDto } from '../application/dto/player-match-stats.dto';
import { CreateBulkPlayerMatchStatsDto } from '../application/dto/create-bulk-player-match-stats.dto';

describe('PlayerMatchStatsService', () => {
  let service: PlayerMatchStatsService;
  let repo: Repository<PlayerMatchStats>;
  let matchService: MatchService;
  let playerService: PlayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerMatchStatsService,
        {
          provide: getRepositoryToken(PlayerMatchStats),
          useClass: Repository,
        },
        {
          provide: MatchService,
          useValue: { getMatchByMatchNumber: jest.fn() },
        },
        {
          provide: PlayerService,
          useValue: { getOrCreatePlayer: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PlayerMatchStatsService>(PlayerMatchStatsService);
    repo = module.get<Repository<PlayerMatchStats>>(getRepositoryToken(PlayerMatchStats));
    matchService = module.get<MatchService>(MatchService);
    playerService = module.get<PlayerService>(PlayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllPlayerMatchStats', () => {
    it('should return all player match stats with relations', async () => {
      const stats = [
        { id: 1, player: { id: 1, name: 'Roman' }, match: { id: 1, matchNumber: '123' } },
        { id: 2, player: { id: 2, name: 'Nick' }, match: { id: 1, matchNumber: '123' } }
      ] as any;

      jest.spyOn(repo, 'find').mockResolvedValue(stats);

      const result = await service.getAllPlayerMatchStats();

      expect(result).toEqual(stats);
    });

    it('should return empty array when no stats exist', async () => {
      jest.spyOn(repo, 'find').mockResolvedValue([]);

      const result = await service.getAllPlayerMatchStats();

      expect(result).toEqual([]);
    });
  });

  describe('getPlayerMatchStats', () => {
    it('should return player match stats when found', async () => {
      const playerMatchStatsDto: PlayerMatchStatsDto = {
        player: { id: 1, name: 'Roman' } as any,
        match: { id: 1, matchNumber: '123' } as any,
        team: teamEnum.TERRORISTS,
        kills: 5,
        deaths: 2
      };

      const stats = { id: 1, player: { id: 1 }, match: { id: 1 }, kills: 5, deaths: 2 } as any;

      jest.spyOn(repo, 'findOne').mockResolvedValue(stats);

      const result = await service.getPlayerMatchStats(playerMatchStatsDto);

      expect(result).toEqual(stats);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          player: { id: 1 },
          match: { id: 1 }
        }
      });
    });

    it('should return null when player match stats not found', async () => {
      const playerMatchStatsDto: PlayerMatchStatsDto = {
        player: { id: 1, name: 'Roman' } as any,
        match: { id: 1, matchNumber: '123' } as any,
        team: teamEnum.TERRORISTS
      };

      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      const result = await service.getPlayerMatchStats(playerMatchStatsDto);

      expect(result).toBeNull();
      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          player: { id: 1 },
          match: { id: 1 }
        }
      });
    });
  });

  describe('createPlayerMatchStats', () => {
    it('should create player match stats successfully', async () => {
      const playerMatchStatsDto: PlayerMatchStatsDto = {
        player: { id: 1, name: 'Roman' } as any,
        match: { id: 1, matchNumber: '123' } as any,
        team: teamEnum.TERRORISTS,
        kills: 0,
        deaths: 0
      };

      const createdStats = { id: 1, ...playerMatchStatsDto } as any;

      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      jest.spyOn(repo, 'save').mockResolvedValue(createdStats);

      const result = await service.createPlayerMatchStats(playerMatchStatsDto);

      expect(result).toEqual(createdStats);
      expect(repo.save).toHaveBeenCalledWith(playerMatchStatsDto);
    });

    it('should throw error when player match stats already exists', async () => {
      const playerMatchStatsDto: PlayerMatchStatsDto = {
        player: { id: 1, name: 'Roman' } as any,
        match: { id: 1, matchNumber: '123' } as any,
        team: teamEnum.TERRORISTS
      };

      const existingStats = { id: 1, ...playerMatchStatsDto } as any;

      jest.spyOn(repo, 'findOne').mockResolvedValue(existingStats);

      await expect(service.createPlayerMatchStats(playerMatchStatsDto))
        .rejects.toThrow('Player Match Stats already exists');
    });
  });

  describe('createBatchPlayerMatchStats', () => {
    it('should create batch player match stats successfully', async () => {
      const createBulkDto: CreateBulkPlayerMatchStatsDto = {
        teams: {
          terrorists: ['Roman', 'Marcus'],
          counterTerrorists: ['Nick', 'John']
        },
        matchNumber: '123'
      };

      const match = { id: 1, matchNumber: '123' } as any;
      const roman = { id: 1, name: 'Roman' } as any;
      const marcus = { id: 2, name: 'Marcus' } as any;
      const nick = { id: 3, name: 'Nick' } as any;
      const john = { id: 4, name: 'John' } as any;

      jest.spyOn(matchService, 'getMatchByMatchNumber').mockResolvedValue(match);
      jest.spyOn(playerService, 'getOrCreatePlayer')
        .mockResolvedValueOnce(roman)
        .mockResolvedValueOnce(marcus)
        .mockResolvedValueOnce(nick)
        .mockResolvedValueOnce(john);
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      jest.spyOn(repo, 'save').mockResolvedValue({} as any);

      await service.createBatchPlayerMatchStats(createBulkDto);

      expect(matchService.getMatchByMatchNumber).toHaveBeenCalledWith('123');
      expect(playerService.getOrCreatePlayer).toHaveBeenCalledTimes(4);
      expect(repo.save).toHaveBeenCalledTimes(4);
    });

    it('should throw error when match not found', async () => {
      const createBulkDto: CreateBulkPlayerMatchStatsDto = {
        teams: {
          terrorists: ['Roman'],
          counterTerrorists: ['Nick']
        },
        matchNumber: '123'
      };

      jest.spyOn(matchService, 'getMatchByMatchNumber').mockResolvedValue(null);

      await expect(service.createBatchPlayerMatchStats(createBulkDto))
        .rejects.toThrow('Match not found');
    });
  });

  describe('getOrCreatePlayerMatchStats', () => {
    it('should return existing player match stats', async () => {
      const playerMatchStatsDto: PlayerMatchStatsDto = {
        player: { id: 1, name: 'Roman' } as any,
        match: { id: 1, matchNumber: '123' } as any,
        team: teamEnum.TERRORISTS
      };

      const existingStats = { id: 1, ...playerMatchStatsDto } as any;

      jest.spyOn(repo, 'findOne').mockResolvedValue(existingStats);
      jest.spyOn(repo, 'save').mockResolvedValue(existingStats);

      const result = await service.getOrCreatePlayerMatchStats(playerMatchStatsDto);

      expect(result).toEqual(existingStats);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: {
          player: { id: 1 },
          match: { id: 1 }
        }
      });
    });

    it('should create new player match stats when not exists', async () => {
      const playerMatchStatsDto: PlayerMatchStatsDto = {
        player: { id: 1, name: 'Roman' } as any,
        match: { id: 1, matchNumber: '123' } as any,
        team: teamEnum.TERRORISTS
      };

      const createdStats = { id: 1, ...playerMatchStatsDto } as any;

      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      jest.spyOn(repo, 'save').mockResolvedValue(createdStats);

      const result = await service.getOrCreatePlayerMatchStats(playerMatchStatsDto);

      expect(result).toEqual(createdStats);
      expect(repo.save).toHaveBeenCalledWith(playerMatchStatsDto);
    });
  });

  describe('updatePlayerKills', () => {
    it('should update player kills successfully', async () => {
      const playerMatchStatsDto: PlayerMatchStatsDto = {
        player: { id: 1, name: 'Roman' } as any,
        match: { id: 1, matchNumber: '123' } as any,
        team: teamEnum.TERRORISTS
      };

      const existingStats = {
        id: 1,
        ...playerMatchStatsDto,
        kills: 5,
        deaths: 2
      } as any;

      jest.spyOn(repo, 'findOne').mockResolvedValue(existingStats);
      jest.spyOn(repo, 'save').mockResolvedValue(existingStats);

      await service.updatePlayerKills(playerMatchStatsDto, false);

      expect(existingStats.kills).toBe(6);
      expect(repo.save).toHaveBeenCalledWith(existingStats);
    });

    it('should handle friendly fire correctly', async () => {
      const playerMatchStatsDto: PlayerMatchStatsDto = {
        player: { id: 1, name: 'Roman' } as any,
        match: { id: 1, matchNumber: '123' } as any,
        team: teamEnum.TERRORISTS
      };

      const existingStats = {
        id: 1,
        ...playerMatchStatsDto,
        kills: 5,
        deaths: 2
      } as any;

      jest.spyOn(repo, 'findOne').mockResolvedValue(existingStats);
      jest.spyOn(repo, 'save').mockResolvedValue(existingStats);

      await service.updatePlayerKills(playerMatchStatsDto, true);

      expect(existingStats.kills).toBe(4);
      expect(repo.save).toHaveBeenCalledWith(existingStats);
    });
  });

  describe('updatePlayerDeaths', () => {
    it('should update player deaths successfully', async () => {
      const playerMatchStatsDto: PlayerMatchStatsDto = {
        player: { id: 1, name: 'Roman' } as any,
        match: { id: 1, matchNumber: '123' } as any,
        team: teamEnum.TERRORISTS
      };

      const existingStats = {
        id: 1,
        ...playerMatchStatsDto,
        kills: 5,
        deaths: 2
      } as any;

      jest.spyOn(repo, 'findOne').mockResolvedValue(existingStats);
      jest.spyOn(repo, 'save').mockResolvedValue(existingStats);

      await service.updatePlayerDeaths(playerMatchStatsDto);

      expect(existingStats.deaths).toBe(3);
      expect(repo.save).toHaveBeenCalledWith(existingStats);
    });
  });
});
