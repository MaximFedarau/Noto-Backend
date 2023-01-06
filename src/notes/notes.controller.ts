import {
  UseGuards,
  Logger,
  Param,
  Query,
  Req,
  Controller,
  Get,
  ParseUUIDPipe,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { NotesService } from 'notes/notes.service';
import { SearchDTO } from 'notes/dtos/search.dto';
import { AuthRequest } from 'types/authRequest';

@UseGuards(AuthGuard('jwt'))
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  private readonly logger = new Logger(NotesController.name);

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
