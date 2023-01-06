import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WebSocketStrategy } from 'ws/ws.strategy';
import { NotesGateway } from 'ws/notes/gateways/notes.gateway';
import { Auth } from 'auth/entities/auth.entity';
import { NotesModule as StandardNotesModule } from 'notes/notes.module';

@Module({
  providers: [NotesGateway, WebSocketStrategy],
  imports: [TypeOrmModule.forFeature([Auth]), StandardNotesModule],
})
export class NotesModule {}
