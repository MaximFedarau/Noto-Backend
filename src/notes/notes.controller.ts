import {
  UseGuards,
  Logger,
  Body,
  Param,
  Query,
  Req,
  Controller,
  Post,
  Get,
  ParseUUIDPipe,
  Delete,
  Put,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { NotesService } from 'notes/notes.service';
import { NotePipe } from 'notes/pipes/note.pipe';
import { NoteDTO } from 'notes/dtos/note.dto';
import { SearchDTO } from 'notes/dtos/search.dto';
import { AuthRequest } from 'types/authRequest';

@UseGuards(AuthGuard('jwt'))
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  private readonly logger = new Logger(NotesController.name);

  // * section: notes managing

  @Post('/')
  createNote(@Body(new NotePipe()) data: NoteDTO, @Req() req: AuthRequest) {
    this.logger.log('Creating note request was called.');
    const { user } = req;
    return this.notesService.createNote(data, user);
  }

  @Delete('/:id')
  deleteNote(
    @Req() req: AuthRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    this.logger.log('Deleting note request was called.');
    const { user } = req;
    return this.notesService.deleteNote(id, user);
  }

  @Put('/:id')
  updateNote(
    @Req() req: AuthRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new NotePipe()) data: NoteDTO,
  ) {
    this.logger.log('Updating note request was called.');
    const { user } = req;
    return this.notesService.updateNote(id, data, user);
  }

  // * section: notes receiving
  @Get('/pack/:packNumber')
  getNotePack(
    @Req() req: AuthRequest,
    @Param('packNumber', new ParseIntPipe()) packNumber: number,
    @Query(new ValidationPipe()) patterns: SearchDTO,
  ) {
    this.logger.log('Getting note pack request was called.');
    const { user } = req;
    return this.notesService.getNotePack(packNumber - 1, patterns, user); // decreasing pack number by 1, because pack number starts from 1
  }

  @Get('/:id')
  getNoteById(
    @Req() req: AuthRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    this.logger.log('Getting note by id request was called.');
    const { user } = req;
    return this.notesService.getNoteById(id, user);
  }
}
