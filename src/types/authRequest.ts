//Express
import { Request } from 'express';

//Passport
import { Auth } from 'auth/entities/auth.entity';

export interface AuthRequest extends Request {
  user?: Auth;
}
