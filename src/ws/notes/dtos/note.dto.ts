import { IsString, IsOptional } from 'class-validator';

export class NoteDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;
}
