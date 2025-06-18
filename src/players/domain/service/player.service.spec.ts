import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlayerService } from './player.service';
import { Player } from "../../player.entity";
import { Repository } from 'typeorm';

describe('PlayerService', () => {
  let service: PlayerService;
  let repo: Repository<Player>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        {
          provide: getRepositoryToken(Player),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
    repo = module.get<Repository<Player>>(getRepositoryToken(Player));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a player if not exists', async () => {
    const player = { name: 'Roman' } as any;
    jest.spyOn(repo, 'findOne').mockResolvedValue(null);
    jest.spyOn(repo, 'save').mockResolvedValue(player);

    const result = await service.getOrCreatePlayer({ name: 'Roman' });
    expect(result).toEqual(player);
  });

  it('should return existing player', async () => {
    const player = { name: 'Roman' } as any;
    jest.spyOn(repo, 'findOne').mockResolvedValue(player);

    const result = await service.getOrCreatePlayer({ name: 'Roman' });
    expect(result).toEqual(player);
  });
});
