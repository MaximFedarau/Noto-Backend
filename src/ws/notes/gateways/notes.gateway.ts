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

import { NotesService } from 'notes/notes.service';
import { WebsocketExceptionsFilter } from 'ws/notes/filters/notes.filter';
import { WebSocketAuthGuard } from 'ws/ws.guard';
import { NotePipe } from 'ws/notes/pipes/newNote.pipe';
import { NoteDTO } from 'ws/notes/dtos/note.dto';
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
  @UseGuards(WebSocketAuthGuard)
  @SubscribeMessage('newNote')
  handleNewNote(@MessageBody(new NotePipe()) data: NoteDTO) {
    console.log(data);
  }

  @UseFilters(new WebsocketExceptionsFilter())
  @UseGuards(WebSocketAuthGuard)
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
