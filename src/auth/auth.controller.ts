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
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from 'auth/auth.service';
import { SignUpDTO } from 'auth/dtos/signUp.dto';
import { LogInDTO } from 'auth/dtos/logIn.dto';
import { AuthRequest } from 'types/authRequest';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly logger = new Logger(AuthController.name);

  @Post('/signup')
  signUp(@Body(new ValidationPipe()) body: SignUpDTO) {
    this.logger.log('Signup request was called.');
    return this.authService.signUp(body);
  }

  @Post('/login')
  logIn(@Body(new ValidationPipe()) body: LogInDTO) {
    this.logger.log('Login request was called.');
    return this.authService.logIn(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/user')
  getUserPublicData(@Req() { user: { id } }: AuthRequest) {
    this.logger.log('Fetching public data request was called.');
    return this.authService.getUserPublicData(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/image/upload/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    /* getting uploaded file
    getting id: 1) set name of the folder; 2) assign image to the user */
    this.logger.log('Uploading image request was called.');
    return await this.authService.uploadAvatar(file, id);
  }

  @UseGuards(AuthGuard('jwt-refresh')) // checking validity of the token
  @Post('/token/refresh')
  refreshToken(@Req() { user }: AuthRequest) {
    this.logger.log('Tokens refreshing request was called.');
    return this.authService.refreshToken(user);
  }
}
