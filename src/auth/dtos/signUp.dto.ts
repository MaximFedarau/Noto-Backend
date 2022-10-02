import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class SignUpDTO {
  @IsString()
  @IsNotEmpty({ message: 'Nickname is required.' })
  nickname: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    //minimum eight characters, at least one uppercase letter, one lowercase letter and one number
    message: 'Password is too weak.',
  })
  password: string;
}
