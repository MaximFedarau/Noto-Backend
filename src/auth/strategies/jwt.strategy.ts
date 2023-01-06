import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Auth } from 'auth/entities/auth.entity';
import { JWT_SECRET } from 'constants/jwt';

export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ({ headers }: Request) => {
          if (!headers.authorization) return null; // checking if token exists
          const data = headers.authorization.slice(7); // cutting of the Bearer part
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
