import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger, UseGuards, UseFilters, Request } from '@nestjs/common';
import { Socket } from 'socket.io';

import { WebsocketExceptionsFilter } from 'events/notes/filters/notes.filter';
import { WsAuthGuard } from 'events/guards/ws.guard';

@WebSocketGateway({
  namespace: 'notes',
  cors: {
    origin: '*',
  },
})
export class NotesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotesGateway.name);

  @UseFilters(new WebsocketExceptionsFilter())
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('newNote')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
    @Request() req: any,
  ) {
    console.log(data);
  }

  // * section: lifecycle hooks

  afterInit() {
    this.logger.log('Gateway initialized.');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }
}
