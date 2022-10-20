import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseGuards, UseFilters, Request } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

import { NotesService } from 'notes/notes.service';
import { GlobalExceptionsFilter } from 'ws/notes/filters/global.filter';
import { LocalExceptionsFilter } from 'ws/notes/filters/local.filter';
import { WebSocketAuthGuard } from 'ws/ws.guard';
import { NotePipe } from 'ws/notes/pipes/newNote.pipe';
import { DeleteNotePipe } from 'ws/notes/pipes/deleteNote.pipe';
import { NoteDTO } from 'ws/notes/dtos/note.dto';
import { WsRequest } from 'types/ws/wsRequest';
import { NoteStatuses } from 'types/ws/noteStatuses';
import { NoteIdDTO } from '../dtos/noteId.dto';

@WebSocketGateway({
  namespace: 'notes',
  cors: {
    origin: '*',
  },
})
export class NotesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly notesService: NotesService) {}

  private readonly logger = new Logger(NotesGateway.name);

  @WebSocketServer()
  server: Server;

  @UseFilters(new LocalExceptionsFilter(NoteStatuses.CREATED))
  @UseGuards(WebSocketAuthGuard)
  @SubscribeMessage('newNote')
  async handleNewNote(
    @ConnectedSocket() client: Socket,
    @MessageBody(new NotePipe()) messageBody: NoteDTO,
    @Request() { handshake }: WsRequest,
  ) {
    const { user } = handshake;
    const { id, title, content, date } = await this.notesService.createNote(
      messageBody,
      user,
    );

    const data = {
      status: NoteStatuses.CREATED,
      note: { id, title, content, date },
    };

    client.broadcast.to(user.id).emit('global', data); // send to all room members, except the sender
    client.emit('local', data);
    this.logger.debug(`New note created: ${id}.`);
  }

  @UseFilters(new LocalExceptionsFilter(NoteStatuses.DELETED))
  @UseGuards(WebSocketAuthGuard)
  @SubscribeMessage('deleteNote')
  async handleDeleteNote(
    @ConnectedSocket() client: Socket,
    @MessageBody(new DeleteNotePipe()) { noteId }: NoteIdDTO,
    @Request() { handshake }: WsRequest,
  ) {
    const { user } = handshake;
    await this.notesService.deleteNote(noteId, user);

    const data = {
      status: NoteStatuses.DELETED,
      note: { id: noteId },
    };

    client.broadcast.to(user.id).emit('global', data); // send to all room members, except the sender
    client.emit('local', data);
    this.logger.debug(`Note was deleted: ${noteId}.`);
  }

  @UseFilters(new GlobalExceptionsFilter())
  @UseGuards(WebSocketAuthGuard)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @Request() { handshake }: WsRequest,
  ) {
    const id = handshake.user.id;
    client.join(id);
    client.emit('joinRoom'); // pending
    this.logger.debug(`Client ${client.id} joined room ${id}.`);
  }

  // * section: lifecycle hooks

  afterInit() {
    this.logger.log('Gateway initialized.');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}.`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}.`);
  }
}
