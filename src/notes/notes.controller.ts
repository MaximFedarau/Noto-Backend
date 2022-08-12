// Nest JS Common
import { UseGuards, Logger, Body, Controller, Post } from '@nestjs/common';

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

  @Post('/')
  createNote(@Body(new NotePipe()) data: NoteDTO) {
    this.logger.log('Creating note request was called.');
    console.log(data);
    return 'This action adds a new note';
  }
}
