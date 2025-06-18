import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from '../../match.entity';
import { Repository } from 'typeorm';
import { CreateMatchDto } from '../application/dto/create-match.dto';
import { FinishMatchDto } from '../application/dto/finish-match.dto';

@Injectable()
export class MatchService {
    constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) {}

  async createMatch(match: CreateMatchDto): Promise<Match> {
    const existingMatch = await this.getMatchByMatchNumber(match.matchNumber);

    if (existingMatch) {
      throw new Error('Match Number already exists');
    }

    return this.matchRepository.save(match);
  }

  async finishMatch(match: FinishMatchDto) {
    const existingMatch = await this.getMatchByMatchNumber(match.matchNumber);

    if (!existingMatch) {
      throw new Error('Match Number does not exists');
    }

    existingMatch.endTime = match.endTime;
    await this.matchRepository.save(existingMatch);
  }

  async getMatchByMatchNumber(matchNumber: string): Promise<Match | null> {
    return await this.matchRepository.findOne({
      where: { matchNumber: matchNumber }
    });
  }

  async getMatchByMatchNumberComplete(matchNumber: string): Promise<Match | null> {
    return await this.matchRepository.findOne({
      where: { matchNumber: matchNumber },
      relations: ['playerStats', 'playerStats.player']
    });
  }

  async getAllMatches(): Promise<Match[]> {
    return await this.matchRepository.find();
  }
}
