// Nest JS Common
import { Injectable, Logger } from '@nestjs/common';

//TypeORM
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//Entities
import { Auth } from 'auth/entities/auth.entity';
import { Note } from 'notes/entities/note.entity';

//DTOs
import { NoteDTO } from './dtos/note.dto';

//Utils
import { ErrorHandler } from 'utils/ErrorHandler';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepo: Repository<Note>, // connecting to TypeORM auth repository (table)
  ) {}

  private readonly logger = new Logger(NotesService.name);
  private readonly errorHandler = new ErrorHandler(NotesService.name);

  // * section: notes managing

  async createNote(data: NoteDTO, user?: Auth) {
    // * section: running user checks
    this.errorHandler.userExistenceCheck('Creating new note failed.', user);

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
    this.errorHandler.userExistenceCheck('Deleting note failed.', user);

    // * section: running note checks
    const note = await this.notesRepo.findOne({ where: { id: noteId, user } });
    this.errorHandler.noteExistenceCheck('Deleting note failed.', note);

    // * section: deleting note by id
    await this.notesRepo.remove(note);
    this.logger.log('Note was successfully deleted.');
    return {
      message: 'Note was successfully deleted.',
    };
  }

  async updateNote(noteId: string, data: NoteDTO, user?: Auth) {
    // * section: running user checks
    this.errorHandler.userExistenceCheck('Updating note failed.', user);

    // * section: running note checks
    const note = await this.notesRepo.findOne({ where: { id: noteId, user } });
    this.errorHandler.userExistenceCheck('Updating note failed.', user);

    // * section: updating note by id
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
    this.errorHandler.userExistenceCheck('Getting all notes failed.', user);

    // * section: getting all notes
    const allNotes = await this.notesRepo.find({ where: { user } });
    this.logger.log('All notes were successfully received.');
    return allNotes;
  }

  async getNoteById(noteId: string, user?: Auth) {
    // * section: running user checks
    this.errorHandler.userExistenceCheck('Getting note failed.', user);

    // * section: running note checks
    const note = await this.notesRepo.findOne({ where: { id: noteId, user } });
    this.errorHandler.noteExistenceCheck('Getting note failed.', note);

    // * section: getting note by id
    this.logger.log('Note was successfully received.');
    return note;
  }
}
