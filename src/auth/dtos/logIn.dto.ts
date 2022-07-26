//Class validator
import { IsString, IsNotEmpty } from 'class-validator';

export class LogInDTO {
  @IsString()
  @IsNotEmpty({ message: 'Nickname is required.' })
  nickname: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}
