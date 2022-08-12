// Nest JS Common
import {
  Injectable,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';

//DTOs
import { SignUpDTO } from 'auth/dtos/signUp.dto';
import { LogInDTO } from 'auth/dtos/logIn.dto';

//Passport
import { JWT_SECRET, REFRESH_SECRET } from 'constants/jwt';
import { JwtService } from '@nestjs/jwt';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//Entities
import { Auth } from 'auth/entities/auth.entity';

//Utils
import { ErrorHandler } from 'utils/ErrorHandler';

//bcrypt
import * as bcrypt from 'bcrypt';

//Cloudinary
import { v2 } from 'cloudinary';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepo: Repository<Auth>, // connecting to TypeORM auth repository (table)
    private readonly jwtService: JwtService, // working with JWT tokens
  ) {}

  private readonly logger = new Logger(AuthService.name);
  private readonly errorHandler = new ErrorHandler(AuthService.name);

  // * section: working with credentials

  async signUp(signupData: SignUpDTO) {
    // * section: checking is user with these credentials already exists
    this.logger.log('Signup inside service started.');
    const { nickname, password } = signupData;
    const checkUserExists = await this.authRepo.findOne({
      where: { nickname: nickname },
    });
    if (checkUserExists) {
      this.logger.error(
        'Signup failed.',
        'User with these credentials already exists.',
      );
      throw new ForbiddenException(
        'User with these credentials already exists.',
      );
    }

    // * section: hashing the password
    this.logger.log("Hashing user's password started.");
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // * section: creating new user
    this.logger.log('Creating new user started.');
    const user = await this.authRepo.save({
      nickname: nickname,
      password: hashedPassword,
    });
    this.logger.log('New user successfully created.');
    return { id: user.id };
  }

  async logIn(loginData: LogInDTO) {
    // * section: checking if user exists and password is correct
    const { nickname, password } = loginData;
    this.logger.log('Credentials check before starting the login.');
    const user = await this.authRepo.findOne({ where: { nickname: nickname } });
    const passwordIsCorrect =
      user?.password && (await bcrypt.compare(password, user.password));
    if (!user || !passwordIsCorrect) {
      this.logger.error(
        'Login failed.',
        'User with these credentials does not exist.',
      );
      throw new ForbiddenException(
        'User with these credentials does not exist.',
      );
    }

    // * section: creating and assigning JWT tokens
    this.logger.log('Creating and assigning login JWT tokens started.');
    return await this.creatingAndAssigningJWTTokens({ id: user.id });
  }

  // * section: working with accessing user data

  async getUserPublicData(id: string) {
    // * section: checking if user exists
    const user = await this.authRepo.findOne({
      where: { id: id },
    });
    this.errorHandler.userExistenceCheck('Failed to get public data.', user);

    //* section: sending public data
    this.logger.log('Public data was successfully sent.');
    return {
      nickname: user.nickname,
      avatar: user.avatar,
    };
  }

  // * section: working with images

  async uploadImage(file: Express.Multer.File, id: string) {
    const user = await this.authRepo.findOne({
      where: { id: id },
    });
    this.errorHandler.userExistenceCheck('Uploading image failed.', user);
    // uploading image to the cloud (Cloudinary)
    const streamUpload = (): Promise<{ url: string }> => {
      return new Promise((resolve, reject) => {
        v2.uploader
          .upload_stream(
            {
              public_id: `NOTO/${id}/avatar`,
              overwrite: true,
            },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            },
          )
          .end(file.buffer);
      });
    };
    const result = await streamUpload();
    this.logger.log('Image was successfully uploaded.');
    user.avatar = result.url;
    await this.authRepo.save(user);
    this.logger.log('Image was successfully saved.');
  }

  // * section: working with tokens

  async refreshToken(user?: Auth) {
    // * section: running user checks
    this.errorHandler.userExistenceCheck('Token refreshing failed.', user);

    // * section: creating and assigning JWT tokens
    this.logger.log('Creating and assigning refresh JWT tokens started.');
    return await this.creatingAndAssigningJWTTokens({ id: user.id });
  }

  // * section: reusables

  async creatingAndAssigningJWTTokens(payload: string | object | Buffer) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        // creating access token
        secret: JWT_SECRET,
        expiresIn: '5m',
      }),
      this.jwtService.signAsync(payload, {
        // creating refresh token
        secret: REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]).catch((err) => {
      this.logger.error('Error while creating login JWT tokens.');
      throw new InternalServerErrorException(err);
    });
    return { accessToken, refreshToken };
  }
}
