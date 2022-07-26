// Nest JS Common
import { Logger, Controller, Post, Body, ValidationPipe } from '@nestjs/common';

//DTOs
import { SignUpDTO } from 'auth/dtos/signUp.dto';
import { LogInDTO } from './dtos/logIn.dto';

//Service
import { AuthService } from 'auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {} // Auth Service

  private readonly logger = new Logger(AuthController.name); // Nest JS Logger

  // * section: working with credentials

  @Post('/signup')
  signUp(@Body(new ValidationPipe()) body: SignUpDTO) {
    // using validation pipe to validate the body
    this.logger.log('Signing up request was called.');
    return this.authService.signUp(body); // returning the user
  }

  @Post('/login')
  logIn(@Body(new ValidationPipe()) body: LogInDTO) {
    // using validation pipe to validate the body
    this.logger.log('Logging in request was called.');
    return this.authService.logIn(body);
  }
}
