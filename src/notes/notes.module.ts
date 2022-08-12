// Nest JS Common
import { Module } from '@nestjs/common';
import { NotesService } from 'notes/notes.service';
import { NotesController } from 'notes/notes.controller';

//TypeORM
import { TypeOrmModule } from '@nestjs/typeorm';

//Entities
import { Note } from 'notes/entities/note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note])],
  providers: [NotesService],
  controllers: [NotesController],
})
export class NotesModule {}
