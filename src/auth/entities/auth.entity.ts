import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { Note } from 'notes/entities/note.entity';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nickname: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fullScaleAvatar?: string;

  @Column({ nullable: true })
  thumbnail?: string;

  @OneToMany(() => Note, (note) => note.user, { cascade: true })
  notes: Note[];
}
