//Nest Js Common
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';

//Entitites
import { Auth } from 'auth/entities/auth.entity';
import { Note } from 'notes/entities/note.entity';

@Injectable()
export class ErrorHandler {
  private readonly logger: Logger;

  constructor(source: string) {
    this.logger = new Logger(source);
  }

  userExistenceCheck(errorTitle: string, user?: Auth) {
    if (!user) {
      this.logger.error(errorTitle, 'User does not exist.');
      throw new ForbiddenException('User does not exist.');
    }
  }

  noteExistenceCheck(errorTitle: string, note?: Note) {
    if (!note) {
      this.logger.error(errorTitle, 'Note does not exist.');
      throw new ForbiddenException('Note does not exist.');
    }
  }
}
