// Nest JS Common
import {
  Logger,
  Controller,
  Get,
  Post,
  Param,
  Body,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

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
    this.logger.log('Signup request was called.');
    return this.authService.signUp(body); // returning the user
  }

  @Post('/login')
  logIn(@Body(new ValidationPipe()) body: LogInDTO) {
    // using validation pipe to validate the body
    this.logger.log('Login request was called.');
    return this.authService.logIn(body);
  }

  // * section: working with data

  @UseGuards(AuthGuard('jwt'))
  @Get('/user')
  getUserPublicData(@Req() req: AuthRequest) {
    // getting user public data using id from the request body
    this.logger.log('Fetching public data request was called.');
    return this.authService.getUserPublicData(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/image/upload/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    /* getting uploaded file
    getting id: 1) set name of the folder; 2) assign image to the user */
    this.logger.log('Uploading image request was called.');
    await this.authService.uploadImage(file, id);
  }

  // * section: working with tokens

  @UseGuards(AuthGuard('jwt-refresh')) // checking validity of the token
  @Post('/token/refresh')
  refreshToken(@Req() req: AuthRequest) {
    // using custom type to get user object from the request body
    this.logger.log('Tokens refreshing request was called.');
    return this.authService.refreshToken(req.user);
  }
}
