// Nest JS Common
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';

//TypeORM
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//Entities
import { Auth } from 'auth/entities/auth.entity';
import { Note } from 'notes/entities/note.entity';

//DTOs
import { NoteDTO } from './dtos/note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepo: Repository<Note>, // connecting to TypeORM auth repository (table)
  ) {}

  private readonly logger = new Logger(NotesService.name);

  // * section: notes managing

  async createNote(data: NoteDTO, user?: Auth) {
    // * section: running user checks
    if (!user) {
      this.logger.error('Creating new note failed.', 'User does not exist.');
      throw new ForbiddenException('User does not exist.');
    }

    // * section: creating new note
    const { title, content } = data;
    const newNote = new Note(title, content, user);
    const createdNote = await this.notesRepo.save(newNote);
    this.logger.log('Note was successfully created.');
    return {
      id: createdNote.id,
    };
  }

  async deleteNote(noteId: string, user?: Auth) {
    // * section: running user checks
    if (!user) {
      this.logger.error('Deleting note failed.', 'User does not exist.');
      throw new ForbiddenException('User does not exist.');
    }

    // * section: deleting note by id
    const note = await this.notesRepo.findOne({ where: { id: noteId, user } });
    if (!note) {
      this.logger.error('Deleting note failed.', 'Note does not exist.');
      throw new ForbiddenException('Note does not exist.');
    }
    await this.notesRepo.remove(note);
    this.logger.log('Note was successfully deleted.');
    return {
      message: 'Note was successfully deleted.',
    };
  }

  async updateNote(noteId: string, data: NoteDTO, user?: Auth) {
    // * section: running user checks
    if (!user) {
      this.logger.error('Updating note failed.', 'User does not exist.');
      throw new ForbiddenException('User does not exist.');
    }

    // * section: updating note by id
    const note = await this.notesRepo.findOne({ where: { id: noteId, user } });
    if (!note) {
      this.logger.error('Updating note failed.', 'Note does not exist.');
      throw new ForbiddenException('Note does not exist.');
    }
    const { title, content } = data;
    note.title = title || null;
    note.content = content || null;
    const updatedNote = await this.notesRepo.save(note);
    this.logger.log('Note was successfully updated.');
    return updatedNote;
  }

  // * section: notes receiving

  async getAllNotes(user?: Auth) {
    // * section: running user checks
    if (!user) {
      this.logger.error('Getting all notes failed.', 'User does not exist.');
      throw new ForbiddenException('User does not exist.');
    }

    // * section: getting all notes
    const allNotes = await this.notesRepo.find({ where: { user } });
    this.logger.log('All notes were successfully received.');
    return allNotes;
  }

  async getNoteById(noteId: string, user?: Auth) {
    // * section: running user checks
    if (!user) {
      this.logger.error('Getting note failed.', 'User does not exist.');
      throw new ForbiddenException('User does not exist.');
    }

    // * section: getting note by id
    const note = await this.notesRepo.findOne({ where: { id: noteId, user } });
    if (!note) {
      this.logger.error('Getting note failed.', 'Note does not exist.');
      throw new ForbiddenException('Note does not exist.');
    }
    this.logger.log('Note was successfully received.');
    return note;
  }
}
