//TypeORM
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

//Entities
import { Auth } from 'auth/entities/auth.entity';

@Entity()
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  content?: string;

  @Column()
  date: Date;

  @ManyToOne(() => Auth, (auth) => auth.notes)
  user: Auth;

  constructor(date: Date, title?: string, content?: string, user?: Auth) {
    this.date = date;
    this.title = title;
    this.content = content;
    this.user = user;
  }
}
