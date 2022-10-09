import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotesService } from 'notes/notes.service';
import { NotesController } from 'notes/notes.controller';
import { Note } from 'notes/entities/note.entity';

@Module({
  providers: [NotesService],
  controllers: [NotesController],
  imports: [TypeOrmModule.forFeature([Note])],
  exports: [NotesService],
})
export class NotesModule {}
