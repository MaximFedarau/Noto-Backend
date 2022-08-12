// Nest JS Common and Express
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

//Passport
import { JWT_SECRET } from 'constants/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// TypeORM
import { Auth } from 'auth/entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          if (!request.headers.authorization) return null; // checking if token exists
          const data = request.headers.authorization.slice(7); // cutting of the Bearer part
          return data || null;
        },
      ]),
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: { id: string }) {
    const { id } = payload;
    const user = await this.authRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
