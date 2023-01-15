import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { Auth } from 'auth/entities/auth.entity';
import { Note } from 'notes/entities/note.entity';
import { WsErrorCodes } from 'types/ws/errorCodes';

@Injectable()
export class ErrorHandler {
  private readonly logger: Logger;

  constructor(source: string) {
    this.logger = new Logger(source);
  }

  userExistenceCheck(errorTitle: string, user?: Auth, isWS = false) {
    if (user) return;
    this.logger.error(errorTitle, 'User does not exist.');

    if (!isWS) throw new ForbiddenException('User does not exist.');

    throw new WsException({
      status: WsErrorCodes.FORBIDDEN,
      message: 'User does not exist.',
    });
  }

  noteExistenceCheck(errorTitle: string, note?: Note, isWS = false) {
    if (note) return;
    this.logger.error(errorTitle, 'Note does not exist.');

    if (!isWS) throw new ForbiddenException('Note does not exist.');

    throw new WsException({
      status: WsErrorCodes.FORBIDDEN,
      message: 'Note does not exist.',
    });
  }
}
