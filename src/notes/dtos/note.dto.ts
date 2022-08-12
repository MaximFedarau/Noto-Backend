// Class validator
import { IsString, ValidateIf } from 'class-validator';

export class NoteDTO {
  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  title?: string;

  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  content?: string;
}
