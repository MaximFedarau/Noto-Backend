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
    // * section: checking is user with these credentials alrady exists
    const checkUserExists = await this.authRepo.findOne({
      where: { nickname: nickname },
    });
    if (checkUserExists) {
      this.logger.error('User with these credentials already exists.');
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
    return { id: user.id };
  }

  //Logging In
  async logIn(loginData: LogInDTO) {
    const { nickname, password } = loginData;
    // * section: checking is user exists and password is correct
    this.logger.log('Credentials check before login started.');
    const user = await this.authRepo.findOne({ where: { nickname: nickname } });
    const passwordIsCorrect =
      user && user.password
        ? await bcrypt.compare(password, user.password)
        : false;
    if (!user || !passwordIsCorrect) {
      this.logger.error('User with these credentials does not exist.');
      throw new ForbiddenException(
        'User with these credentials does not exist.',
      );
    }
    // * section: creating and assigning JWT tokens
    this.logger.log('Creating and assigning login JWT tokens started.');
    return await this.creatingAndAssigningJWTTokens({ id: user.id });
  }

  // * section: working with tokens

  async refreshToken(user?: Auth) {
    // * section: running user checks
    if (!user) {
      this.logger.error('User does not exist.');
      throw new ForbiddenException('User does not exist.');
    }
    // * section: creating and assigning JWT tokens
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
