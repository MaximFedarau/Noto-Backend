// Nest JS Common
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);
}
