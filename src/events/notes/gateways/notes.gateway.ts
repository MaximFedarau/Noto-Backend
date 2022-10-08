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
import { WsRequest } from 'types/wsRequest';

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
  handleNewNote(@MessageBody() data: string) {
    console.log(data);
  }

  @UseFilters(new WebsocketExceptionsFilter())
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @Request() { handshake }: WsRequest,
  ) {
    const id = handshake.user.id;
    client.join(id);
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
