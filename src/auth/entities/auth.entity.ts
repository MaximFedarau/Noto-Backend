//TypeORM
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

//Entities
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
  avatar?: string;

  @OneToMany(() => Note, (note) => note.user)
  notes: Note[];
}
