import { PipeTransform, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

import { WsErrorCodes } from 'types/ws/errorCodes';

@Injectable()
export class NoteIdPipe implements PipeTransform {
  transform(id: any) {
    if (!id) {
      throw new WsException({
        status: WsErrorCodes.BAD_REQUEST,
        message: ['No data submitted.'],
        data: { id },
      });
    }

    if (!this.validate(id)) {
      throw new WsException({
        status: WsErrorCodes.BAD_REQUEST,
        message: ['noteId must be a UUID.'],
        data: { id },
      });
    }

    return id;
  }

  validate(id: object) {
    if (typeof id !== 'string') return false;
    return /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(
      id,
    );
  }
}
