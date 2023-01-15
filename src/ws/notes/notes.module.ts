import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { WebSocketStrategy } from 'ws/ws.strategy';
import { NotesGateway } from 'ws/notes/gateways/notes.gateway';
import { Auth } from 'auth/entities/auth.entity';
import { NotesModule as StandardNotesModule } from 'notes/notes.module';
import { JWT_SECRET } from 'constants/jwt';

@Module({
  providers: [NotesGateway, WebSocketStrategy],
  imports: [
    TypeOrmModule.forFeature([Auth]),
    StandardNotesModule,
    JwtModule.register({
      secret: JWT_SECRET,
    }),
  ],
})
export class NotesModule {}
