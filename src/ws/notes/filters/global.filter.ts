import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { WsErrorCodes } from 'types/ws/errorCodes';

@Catch(WsException, HttpException)
export class GlobalExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient() as Socket;
    const error =
      exception instanceof WsException
        ? exception.getError()
        : exception.getResponse();
    const details = error instanceof Object ? { ...error } : { message: error };
    client.emit('globalError', {
      status: WsErrorCodes.UNAUTHORIZED,
      ...details,
    });
  }
}
