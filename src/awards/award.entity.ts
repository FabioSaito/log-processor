import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Match } from '../matches/match.entity';
import { Player } from '../players/player.entity';

@Entity('awards')
export class Award {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, player => player.awards)
  player: Player;

  @ManyToOne(() => Match, match => match.awards)
  match: Match;

  @Column()
  type: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
