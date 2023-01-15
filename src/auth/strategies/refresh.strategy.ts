import { UnauthorizedException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Auth } from 'auth/entities/auth.entity';
import { REFRESH_SECRET } from 'constants/jwt';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ({ headers }: Request) => {
          if (!headers?.authorization) return null; // checking if token exists
          const data = headers.authorization.slice(7); // cutting of the Bearer part
          return data || null;
        },
      ]),
      secretOrKey: REFRESH_SECRET,
    });
  }

  async validate({ id }: { id: string }) {
    const user = await this.authRepository.findOne({ where: { id } });
    if (!user) throw new UnauthorizedException('Unauthorized');
    return user;
  }
}
