import { Module } from '@nestjs/common';

import { NotesModule } from 'ws/notes/notes.module';

@Module({
  imports: [NotesModule],
})
export class WebSocketModule {}
