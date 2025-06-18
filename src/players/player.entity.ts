import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Event } from '../events/event.entity';
import { Award } from '../awards/award.entity';
import { PlayerMatchStats } from '../player-match-stats/player-match-stats.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Event, event => event.killer)
  kills: Event[];

  @OneToMany(() => Event, event => event.victim)
  deaths: Event[];

  @OneToMany(() => Award, award => award.player)
  awards: Award[];

  @OneToMany(() => PlayerMatchStats, stats => stats.player)
  matchStats: PlayerMatchStats[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
