import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WebSocketStrategy } from 'events/strategies/ws.strategy';
import { NotesGateway } from 'events/notes/gateways/notes.gateway';
import { Auth } from 'auth/entities/auth.entity';

@Module({
  providers: [NotesGateway, WebSocketStrategy],
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([Auth])],
})
export class EventsModule {}
