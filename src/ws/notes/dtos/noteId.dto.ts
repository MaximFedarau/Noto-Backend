import { IsUUID } from 'class-validator';

export class NoteIdDTO {
  @IsUUID()
  noteId: string;
}
