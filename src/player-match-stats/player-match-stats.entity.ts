import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Match } from '../matches/match.entity';
import { Player } from '../players/player.entity';
import { IsEnum } from 'class-validator';

export enum teamEnum {
  TERRORISTS = 'TERRORISTS',
  COUNTER_TERRORISTS = 'COUNTER_TERRORISTS',
}

@Entity('player_match_stats')
export class PlayerMatchStats {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, player => player.matchStats, {
    cascade: true,
    eager: true,
    onDelete: 'SET NULL'
  })
  player: Player;

  @ManyToOne(() => Match, match => match.playerStats, {
    cascade: true,
    eager: true,
    onDelete: 'SET NULL'
  })
  match: Match;

  @Column({ type: 'varchar', nullable: true })
  @IsEnum(teamEnum)
  team?: teamEnum;

  @Column({ default: 0 })
  kills: number;

  @Column({ default: 0 })
  deaths: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
