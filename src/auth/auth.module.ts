import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from 'auth/auth.service';
import { AuthController } from 'auth/auth.controller';
import { JWTStrategy } from 'auth/strategies/jwt.strategy';
import { RefreshStrategy } from 'auth/strategies/refresh.strategy';
import { Auth } from 'auth/entities/auth.entity';

@Module({
  providers: [AuthService, JWTStrategy, RefreshStrategy],
  controllers: [AuthController],
  imports: [
    JwtModule.register({}),
    PassportModule,
    TypeOrmModule.forFeature([Auth]),
  ],
})
export class AuthModule {}
