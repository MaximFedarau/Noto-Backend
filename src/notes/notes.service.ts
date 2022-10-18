import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';

import { Note } from 'notes/entities/note.entity';
import { Auth } from 'auth/entities/auth.entity';
import { NoteDTO } from 'notes/dtos/note.dto';
import { SearchDTO } from 'notes/dtos/search.dto';
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
    const newNote = new Note(new Date(), title, content, user);
    const createdNote = await this.notesRepo.save(newNote);
    this.logger.log('Note was successfully created.');
    return createdNote;
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
    this.errorHandler.noteExistenceCheck('Updating note failed.', note);

    // * section: updating note by id
    const { title, content } = data;
    note.title = title || null;
    note.content = content || null;
    note.date = new Date();
    const updatedNote = await this.notesRepo.save(note);
    this.logger.log('Note was successfully updated.');
    return updatedNote;
  }

  // * section: notes receiving

  async getNotePack(packNumber: number, patterns?: SearchDTO, user?: Auth) {
    // * section: running received data checks
    this.errorHandler.userExistenceCheck('Getting note pack failed.', user);
    if (packNumber < 0) {
      throw new BadRequestException('Pack number cannot be less than 1.');
    }

    // * section: getting note packs
    const { pattern } = patterns;
    // using ILike to make search case insensitive
    const [notePack, totalNotes] = await this.notesRepo.findAndCount({
      where: [
        { user, title: ILike(`%${pattern || ''}%`) },
        { user, content: ILike(`%${pattern || ''}%`) },
      ],
      order: { date: 'ASC' },
      skip: packNumber * 10,
      take: 10,
    });
    this.logger.log('Note pack was successfully received.');
    return {
      notePack,
      isEnd: totalNotes <= (packNumber + 1) * 10,
    };
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
