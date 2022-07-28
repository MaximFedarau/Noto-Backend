// Nest JS Common
import {
  Injectable,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';

//DTOs
import { SignUpDTO } from 'auth/dtos/signUp.dto';
import { LogInDTO } from './dtos/logIn.dto';

//Passport
import { JWT_SECRET, REFRESH_SECRET } from 'constants/jwt';
import { JwtService } from '@nestjs/jwt';

//TypeORM
import { Auth } from 'auth/entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
  private readonly logger = new Logger(AuthService.name); // Nest JS Logger

  // * section: working with credentials

  // Signing Up
  async signUp(signupData: SignUpDTO) {
    // * section: beginning of the sign up process
    this.logger.log('Signing up in service started.');
    const { nickname, password } = signupData;

    // * section: checking is user with these credentials already exists
    const checkUserExists = await this.authRepo.findOne({
      where: { nickname: nickname },
    });
    if (checkUserExists) {
      this.logger.error(
        'Signing Up was failed.',
        'User with these credentials already exists.',
      );
      throw new ForbiddenException(
        'User with these credentials already exists.',
      );
    }

    // * section: hashing the password
    this.logger.log('Hashing the password started.');
    const salt = await bcrypt.genSalt(); //generating salt
    const hashedPassword = await bcrypt.hash(password, salt); //generating hashed password

    // * section: creating new user
    this.logger.log('Creating new user started.');
    const user = await this.authRepo.save({
      nickname: nickname,
      password: hashedPassword,
    }); // saving user to the database
    this.logger.log('New user was successfully created.');
    return { id: user.id };
  }

  //Logging In
  async logIn(loginData: LogInDTO) {
    // * section: checking if user exists and password is correct
    const { nickname, password } = loginData;
    this.logger.log('Credentials check before login started.');
    const user = await this.authRepo.findOne({ where: { nickname: nickname } });
    const passwordIsCorrect =
      user && user.password
        ? await bcrypt.compare(password, user.password)
        : false;
    if (!user || !passwordIsCorrect) {
      this.logger.error(
        'Logging In was failed.',
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
    if (!user) {
      this.logger.error('Getting public data failed.', 'User does not exist.');
      throw new ForbiddenException('User does not exist.');
    }

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
    if (!user) {
      this.logger.error('Uploading image failed.', 'User does not exist.');
      throw new ForbiddenException('User does not exist.');
    }
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
    this.logger.log('Image was successfully  saved.');
  }

  // * section: working with tokens

  async refreshToken(user?: Auth) {
    // * section: running user checks
    if (!user) {
      this.logger.error('Token refreshing failed.', 'User does not exist.');
      throw new ForbiddenException('User does not exist.');
    }

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
        expiresIn: '5m', // 5 minutes
      }),
      this.jwtService.signAsync(payload, {
        // creating refresh token
        secret: REFRESH_SECRET,
        expiresIn: '7d', // 7 days
      }),
    ]).catch((err) => {
      // error handling
      this.logger.error('Error while creating login JWT tokens.');
      throw new InternalServerErrorException(err);
    });
    return { accessToken, refreshToken };
  }
}
