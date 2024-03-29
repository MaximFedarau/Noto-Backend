import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { WsErrorCodes } from 'types/ws/errorCodes';
import { NoteStatuses } from 'types/ws/noteStatuses';

@Catch()
export class LocalExceptionsFilter extends BaseWsExceptionFilter {
  constructor(private readonly noteStatus: NoteStatuses) {
    super();
  }

  catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient() as Socket;
    const error =
      exception instanceof WsException
        ? exception.getError()
        : exception.getResponse();
    const details = error instanceof Object ? { ...error } : { message: error };

    const emittedData = {
      status: WsErrorCodes.UNAUTHORIZED,
      data: {
        status: this.noteStatus,
        note: host.switchToWs().getData(),
      },
      ...details, // rewrite status and data if they are in details
    };

    client.emit('localError', emittedData);
  }
}
