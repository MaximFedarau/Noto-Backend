import { Request } from 'express';

import { Auth } from 'auth/entities/auth.entity';

export interface AuthRequest extends Request {
  user?: Auth;
}
