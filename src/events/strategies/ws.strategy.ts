import { PassportStrategy } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Auth } from 'auth/entities/auth.entity';
import { JWT_SECRET } from 'constants/jwt';

@Injectable()
export class WebSocketStrategy extends PassportStrategy(Strategy, 'ws') {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ({ headers }: Request) => {
          if (!headers || !headers.authorization) return null; // checking if token exists
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
      throw new WsException('Unauthorized');
    }
    return user;
  }
}
