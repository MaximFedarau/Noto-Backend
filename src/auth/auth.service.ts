// Nest JS Common
import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';

//Passport
import { JwtService } from '@nestjs/jwt';

//TypeORM
import { Auth } from 'auth/entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepo: Repository<Auth>, // connecting to TypeORM auth repository (table)
    private readonly jwtService: JwtService, // working with JWT tokens
  ) {}
  private readonly logger = new Logger(AuthService.name); // Nest JS Logger
}
