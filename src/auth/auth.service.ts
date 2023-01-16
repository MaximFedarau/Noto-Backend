import {
  Injectable,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UploadApiResponse, v2 } from 'cloudinary';

import { Auth } from 'auth/entities/auth.entity';
import { SignUpDTO } from 'auth/dtos/signUp.dto';
import { LogInDTO } from 'auth/dtos/logIn.dto';
import { JWT_SECRET, REFRESH_SECRET } from 'constants/jwt';
import { ErrorHandler } from 'utils/ErrorHandler';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepo: Repository<Auth>, // connecting to TypeORM auth repository (table)
    private readonly jwtService: JwtService, // working with JWT tokens
  ) {}

  private readonly logger = new Logger(AuthService.name);
  private readonly errorHandler = new ErrorHandler(AuthService.name);

  async signUp({ nickname, password }: SignUpDTO) {
    this.logger.log('Signup inside service started.');
    const user = await this.authRepo.findOne({ where: { nickname } });
    if (user) {
      this.logger.error(
        'Signup failed.',
        'User with these credentials already exists.',
      );
      throw new ForbiddenException(
        'User with these credentials already exists.',
      );
    }

    this.logger.log("Hashing user's password started.");
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    this.logger.log('Creating new user started.');
    const { id } = await this.authRepo.save({
      nickname,
      password: hashedPassword,
    });
    this.logger.log('New user successfully created.');
    return { id };
  }

  async logIn({ nickname, password }: LogInDTO) {
    this.logger.log('Credentials check before starting the login.');
    const user = await this.authRepo.findOne({ where: { nickname } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      this.logger.error(
        'Login failed.',
        'User with these credentials does not exist.',
      );
      throw new ForbiddenException(
        'User with these credentials does not exist.',
      );
    }

    this.logger.log('Creating and assigning login JWT tokens started.');
    return await this.creatingAndAssigningJWTTokens({ id: user.id });
  }

  async getUserPublicData(id: string) {
    const user = await this.authRepo.findOne({ where: { id } });
    this.errorHandler.userExistenceCheck('Failed to get public data.', user);

    this.logger.log('Public data was successfully sent.');
    return {
      nickname: user.nickname,
      avatar: user.thumbnail,
    };
  }

  // uploading image to Cloudinary method
  async streamUpload({ buffer }: Express.Multer.File, id: string) {
    const fullScaleAvatarResult: UploadApiResponse = await new Promise(
      (resolve, reject) => {
        v2.uploader
          .upload_stream(
            {
              public_id: `NOTO/${id}/avatar`,
              overwrite: true,
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            },
          )
          .end(buffer);
      },
    );
    const thumbnailResult: UploadApiResponse = await new Promise(
      (resolve, reject) => {
        v2.uploader.upload(
          fullScaleAvatarResult.url,
          {
            public_id: `NOTO/${id}/thumbnail`,
            overwrite: true,
            width: 512,
            height: 512,
            crop: 'scale',
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          },
        );
      },
    );
    return [fullScaleAvatarResult.url, thumbnailResult.url];
  }

  async uploadAvatar(file: Express.Multer.File, id: string) {
    const user = await this.authRepo.findOne({ where: { id } });
    this.errorHandler.userExistenceCheck('Image uploading failed.', user);

    try {
      const [fullScaleAvatarURL, thumbnailURL] = await this.streamUpload(
        file,
        id,
      );
      this.logger.log('Image was successfully uploaded.');
      user.fullScaleAvatar = fullScaleAvatarURL;
      user.thumbnail = thumbnailURL;
      await this.authRepo.save(user);
      this.logger.log('Image was successfully saved.');
      return thumbnailURL;
    } catch (error) {
      this.logger.error('Image uploading failed.', error.message || error);
      throw new InternalServerErrorException('Image uploading failed.');
    }
  }

  async refreshToken(user?: Auth) {
    this.errorHandler.userExistenceCheck('Token refreshing failed.', user);

    this.logger.log('Creating and assigning refresh JWT tokens started.');
    return await this.creatingAndAssigningJWTTokens({ id: user.id });
  }

  async creatingAndAssigningJWTTokens(payload: string | object | Buffer) {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: JWT_SECRET,
          expiresIn: '5m',
        }),
        this.jwtService.signAsync(payload, {
          secret: REFRESH_SECRET,
          expiresIn: '7d',
        }),
      ]);
      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error('Error while creating login JWT tokens.');
      throw new InternalServerErrorException(error);
    }
  }
}
