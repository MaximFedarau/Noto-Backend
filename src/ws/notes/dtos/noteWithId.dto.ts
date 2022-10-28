import { IsUUID } from 'class-validator';

import { NoteDTO } from './note.dto';

export class NoteWithIdDTO extends NoteDTO {
  @IsUUID()
  id: string;
}
