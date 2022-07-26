// Nest JS Common
import {
  Logger,
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';

//Types
import { AuthRequest } from 'types/authRequest';

//DTOs
import { SignUpDTO } from 'auth/dtos/signUp.dto';
import { LogInDTO } from './dtos/logIn.dto';

//Service
import { AuthService } from 'auth/auth.service';

//Passport
import { AuthGuard } from '@nestjs/passport';

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

  // * section: working with tokens
  @UseGuards(AuthGuard('jwt-refresh')) // checking validity of the token
  @Post('/token/refresh')
  refreshToken(@Req() req: AuthRequest) {
    // using custom type to get user object from the request
    this.logger.log('Refreshing token request was called.');
    return this.authService.refreshToken(req.user);
  }
}
