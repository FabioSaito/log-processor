import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Match } from '../matches/match.entity';
import { Player } from '../players/player.entity';
import { IsEnum } from 'class-validator';

// TODO: create weapons entity
export enum weaponEnum {
  M16 = 'M16',
  AK47 = 'AK47',
  DROWN = 'DROWN',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Match, match => match.events)
  match: Match;

  @Column({ type: 'datetime' })
  occurredAt: Date;

  @ManyToOne(() => Player, player => player.kills, { nullable: true })
  killer: Player;

  @ManyToOne(() => Player, player => player.deaths)
  victim: Player;

  @Column({ type: 'varchar', nullable: true })
  @IsEnum(weaponEnum)
  weapon: weaponEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
