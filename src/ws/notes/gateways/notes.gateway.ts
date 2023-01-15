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
import { LocalExceptionsFilter } from 'ws/notes/filters/local.filter';
import { WebSocketAuthGuard } from 'ws/ws.guard';
import { NotePipe } from 'ws/notes/pipes/note.pipe';
import { NoteIdPipe } from 'ws/notes/pipes/noteId.pipe';
import { NoteDTO } from 'ws/notes/dtos/note.dto';
import { WsRequest } from 'types/ws/wsRequest';
import { NoteStatuses } from 'types/ws/noteStatuses';
import { NoteWithIdDTO } from 'ws/notes/dtos/noteWithId.dto';
import { JwtService } from '@nestjs/jwt';
import { WsErrorCodes } from 'types/ws/errorCodes';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from 'auth/entities/auth.entity';

@WebSocketGateway({
  namespace: 'notes',
  cors: {
    origin: '*',
  },
})
export class NotesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly notesService: NotesService,
    private readonly jwtService: JwtService,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

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
    const note = await this.notesService.createNote(messageBody, user);
    const data = { status: NoteStatuses.CREATED, note };

    this.server.to(user.id).emit('global', data); // send to all room members
    client.emit('local', data);
    this.logger.debug(`New note created: ${note.id}.`);
  }

  @UseFilters(new LocalExceptionsFilter(NoteStatuses.DELETED))
  @UseGuards(WebSocketAuthGuard)
  @SubscribeMessage('deleteNote')
  async handleDeleteNote(
    @ConnectedSocket() client: Socket,
    @MessageBody('noteId', new NoteIdPipe()) noteId: string,
    @Request() { handshake }: WsRequest,
  ) {
    const { user } = handshake;
    await this.notesService.deleteNote(noteId, user);
    const data = { status: NoteStatuses.DELETED, note: { id: noteId } };

    // ? when deleting note, we send isDeleteOrigin flag as the second parameter
    // ? if true, it means, that the note was deleted by the user who receives message
    // ? in client, using this flag, we can decide what to do if user is on the note page

    this.server.to(user.id).emit('global', data); // send to all room members
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
    const data = { status: NoteStatuses.UPDATED, note };

    this.server.to(user.id).emit('global', data); // send to all room members
    client.emit('local', data);
    this.logger.debug(`Note is updated: ${id}.`);
  }

  async handleJoinRoom(client: Socket) {
    const {
      handshake: { headers },
    } = client;
    try {
      if (!headers?.authorization) throw new Error();

      const { id }: { id: string } = this.jwtService.verify(
        headers.authorization.slice(7),
      );
      const user = await this.authRepository.findOne({ where: { id } });

      if (!user) throw new Error();

      client.join(user.id);
      client.emit('joinRoom');
      this.logger.debug(`Client ${client.id} joined room ${user.id}.`);
    } catch (error) {
      client.emit('globalError', { status: WsErrorCodes.UNAUTHORIZED });
    }
  }

  afterInit() {
    this.logger.log('Gateway initialized.');
  }

  async handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}.`);
    await this.handleJoinRoom(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}.`);
  }
}
