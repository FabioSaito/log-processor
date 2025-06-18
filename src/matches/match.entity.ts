import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Event } from '../events/event.entity';
import { Award } from '../awards/award.entity';
import { PlayerMatchStats } from '../player-match-stats/player-match-stats.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  matchNumber: string;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime', nullable: true })
  endTime: Date;

  @OneToMany(() => Event, event => event.match)
  events: Event[];

  @OneToMany(() => Award, award => award.match)
  awards: Award[];

  @OneToMany(() => PlayerMatchStats, stats => stats.match)
  playerStats: PlayerMatchStats[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
