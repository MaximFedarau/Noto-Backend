import { ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { WsException } from '@nestjs/websockets';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class WebSocketAuthGuard extends AuthGuard('ws') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      return super.canActivate(context);
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new WsException('Unauthorized');
    }
    return user;
  }

  // getting a request object from a websocket context
  getRequest(context: ExecutionContext) {
    return context.switchToWs().getClient().handshake;
  }
}
