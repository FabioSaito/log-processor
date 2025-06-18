import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Player } from "src/players/player.entity";
import { Repository } from "typeorm";
import { PlayerDto } from "../application/dto/player.dto";

@Injectable()
export class PlayerService {
    constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>
  ) {}

  async getPlayerByName(name: string): Promise<Player | null> {
    return await this.playerRepository.findOne(
      { where: { name } }
    );
  }

  async createPlayer(playerDto: PlayerDto): Promise<Player> {
    return await this.playerRepository.save({ name: playerDto.name });
  }

  async getOrCreatePlayer(playerDto: PlayerDto): Promise<Player> {
    const player = await this.getPlayerByName(playerDto.name);

    if (!player) {
      return this.createPlayer(playerDto);
    }
    return player;
  }

  async getAllPlayers(): Promise<Player[]> {
    return await this.playerRepository.find();
  }
}
