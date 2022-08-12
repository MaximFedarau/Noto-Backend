// Nest JS Common
import {
  UseGuards,
  Logger,
  Body,
  Param,
  Req,
  Controller,
  Post,
  Get,
  ParseUUIDPipe,
  Delete,
  Put,
} from '@nestjs/common';

//Types
import { AuthRequest } from 'types/authRequest';

// Passport
import { AuthGuard } from '@nestjs/passport';

//Service
import { NotesService } from './notes.service';

//Pipes
import { NotePipe } from 'notes/pipes/note.pipe';

//DTOs
import { NoteDTO } from 'notes/dtos/note.dto';

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

  @Get('/')
  getAllNotes(@Req() req: AuthRequest) {
    this.logger.log('Getting all notes request was called.');
    const { user } = req;
    return this.notesService.getAllNotes(user);
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
