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

  async createNote({ title, content }: NoteDTO, user?: Auth) {
    this.errorHandler.userExistenceCheck(
      'Creating new note failed.',
      user,
      true,
    );

    const newNote = new Note(new Date(), title, content, user);
    const createdNote = await this.notesRepo.save(newNote);
    this.logger.log('Note was successfully created.');
    return createdNote;
  }

  async deleteNote(noteId: string, user?: Auth) {
    this.errorHandler.userExistenceCheck('Deleting note failed.', user, true);

    const note = await this.notesRepo.findOne({ where: { id: noteId, user } });
    this.errorHandler.noteExistenceCheck('Deleting note failed.', note, true);

    await this.notesRepo.remove(note);
    this.logger.log('Note was successfully deleted.');
    return { message: 'Note was successfully deleted.' };
  }

  async updateNote(noteId: string, data: NoteDTO, user?: Auth) {
    this.errorHandler.userExistenceCheck('Updating note failed.', user, true);

    const note = await this.notesRepo.findOne({ where: { id: noteId, user } });
    this.errorHandler.noteExistenceCheck('Updating note failed.', note, true);

    const { title = '', content = '' } = data;
    const updatedNote = new Note(new Date(), title, content, user);
    updatedNote.id = noteId;
    await this.notesRepo.save(updatedNote);
    this.logger.log('Note was successfully updated.');
    return updatedNote;
  }

  async getNotePack(packNumber: number, patterns?: SearchDTO, user?: Auth) {
    this.errorHandler.userExistenceCheck('Getting note pack failed.', user);
    if (packNumber < 0)
      throw new BadRequestException('Pack number cannot be less than 1.');

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
    this.errorHandler.userExistenceCheck('Getting note failed.', user);

    const note = await this.notesRepo.findOne({ where: { id: noteId, user } });
    this.errorHandler.noteExistenceCheck('Getting note failed.', note);

    this.logger.log('Note was successfully received.');
    return note;
  }
}
