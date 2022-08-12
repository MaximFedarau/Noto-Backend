//TypeORM
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

//Entities
import { Auth } from 'auth/entities/auth.entity';

@Entity()
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  content: string;

  @ManyToOne(() => Auth, (auth) => auth.notes)
  user: Auth;
}
