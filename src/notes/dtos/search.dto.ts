// Class validator
import { IsString, IsOptional } from 'class-validator';

export class SearchDTO {
  @IsString()
  @IsOptional()
  pattern?: string;
}
