import { Request } from 'express';

import { Auth } from 'auth/entities/auth.entity';

export interface WsRequest extends Request {
  handshake: { user: Auth };
}
