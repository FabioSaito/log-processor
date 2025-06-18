import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MatchService } from './match.service';
import { Match } from '../../match.entity';
import { Repository } from 'typeorm';

describe('MatchService', () => {
  let service: MatchService;
  let repo: Repository<Match>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: getRepositoryToken(Match),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    repo = module.get<Repository<Match>>(getRepositoryToken(Match));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a match', async () => {
    const match = { matchNumber: '123', startTime: new Date() } as any;
    jest.spyOn(repo, 'findOne').mockResolvedValue(null);
    jest.spyOn(repo, 'save').mockResolvedValue(match);

    const result = await service.createMatch(match);
    expect(result).toEqual(match);
  });

  it('should finish a match', async () => {
    const matchStart = {
      id: 1,
      matchNumber: '1234',
      startTime: new Date('2023-01-01T10:00:00Z'),
      endTime: null
    } as any;

    const matchEnd = {
      id: 1,
      matchNumber: '1234',
      startTime: new Date('2023-01-01T10:00:00Z'),
      endTime: new Date('2023-01-01T11:00:00Z')
    } as any;

    const saveSpy = jest.spyOn(repo, 'save').mockResolvedValue(matchEnd);
    jest.spyOn(repo, 'findOne')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(matchStart);

    // create match
    await service.createMatch(matchStart);

    // end match
    await service.finishMatch({ matchNumber: '1234', endTime: new Date('2023-01-01T11:00:00Z') });

    expect(saveSpy).toHaveBeenCalledWith(matchEnd);
  });

  it('should throw if match already exists', async () => {
    const match = { matchNumber: '123', startTime: new Date() } as any;
    jest.spyOn(repo, 'findOne').mockResolvedValue(match);

    await expect(service.createMatch(match)).rejects.toThrow('Match Number already exists');
  });
});
