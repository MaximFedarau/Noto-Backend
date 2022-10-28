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
import { NotePipe } from 'ws/notes/pipes/note.pipe';
import { DeleteNotePipe } from 'ws/notes/pipes/deleteNote.pipe';
import { NoteDTO } from 'ws/notes/dtos/note.dto';
import { WsRequest } from 'types/ws/wsRequest';
import { NoteStatuses } from 'types/ws/noteStatuses';
import { NoteIdDTO } from '../dtos/noteId.dto';
import { NoteWithIdDTO } from '../dtos/noteWithId.dto';

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

  // ! we use custom filter for global and local errors => it sends error to the client
  @UseFilters(new LocalExceptionsFilter(NoteStatuses.CREATED))
  @UseGuards(WebSocketAuthGuard)
  @SubscribeMessage('createNote')
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

    // ? when deleting note, we send isDeleteOrigin flag as the second parameter
    // ? if true, it means, that the note was deleted by the user who receives message
    // ? in client, using this flag, we can decide what to do if user is on the note page

    client.broadcast.to(user.id).emit('global', data); // send to all room members, except the sender
    client.broadcast.to(user.id).emit('local', {
      ...data,
      isDeleteOrigin: false, // false, because the note was deleted not by any of room members
    });
    client.emit('local', {
      ...data,
      isDeleteOrigin: true, // true, because the note was deleted by the sender
    });
    this.logger.debug(`Note was deleted: ${noteId}.`);
  }

  @UseFilters(new LocalExceptionsFilter(NoteStatuses.UPDATED))
  @UseGuards(WebSocketAuthGuard)
  @SubscribeMessage('updateNote')
  async handleUpdateNote(
    @ConnectedSocket() client: Socket,
    @MessageBody(new NotePipe()) { id, ...messageBody }: NoteWithIdDTO,
    @Request() { handshake }: WsRequest,
  ) {
    const { user } = handshake;
    const note = await this.notesService.updateNote(id, messageBody, user);

    const data = {
      status: NoteStatuses.UPDATED,
      note,
    };

    client.broadcast.to(user.id).emit('global', data); // send to all room members, except the sender
    client.emit('local', data);
    this.logger.debug(`Note is updated: ${id}.`);
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
