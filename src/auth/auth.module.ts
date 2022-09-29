// Nest JS Common
import { Module } from '@nestjs/common';
import { AuthService } from 'auth/auth.service';
import { AuthController } from 'auth/auth.controller';

// Passport
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JWTStrategy } from 'auth/strategies/jwt.strategy';
import { RefreshStrategy } from 'auth/strategies/refresh.strategy';

//TypeORM
import { Auth } from 'auth/entities/auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule,
    TypeOrmModule.forFeature([Auth]),
  ],
  providers: [AuthService, JWTStrategy, RefreshStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
