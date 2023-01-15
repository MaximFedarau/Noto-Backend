import { ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { WsException } from '@nestjs/websockets';
import { AuthGuard } from '@nestjs/passport';

// https://github.com/nestjs/nest/issues/3206

@Injectable()
export class WebSocketAuthGuard extends AuthGuard('ws') {
  // rewrite canActivate method to throw WsException() in any case
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      return super.canActivate(context);
    } catch (err) {
      throw new WsException('Unauthorized.');
    }
  }

  // rewrite method to throw WsException instead of UnauthorizedException in https://github.com/nestjs/passport/blob/master/lib/auth.guard.ts#L52
  handleRequest(err, user) {
    if (err || !user) throw err || new WsException('Unauthorized.');
    return user;
  }

  // getting a request object from a websocket context
  getRequest(context: ExecutionContext) {
    return context.switchToWs().getClient().handshake;
  }
}
