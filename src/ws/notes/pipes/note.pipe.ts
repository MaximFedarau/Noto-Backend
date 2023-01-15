import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { WsErrorCodes } from 'types/ws/errorCodes';

@Injectable()
export class NotePipe implements PipeTransform {
  async transform(note: any, { metatype }: ArgumentMetadata) {
    if (!note) {
      throw new WsException({
        status: WsErrorCodes.BAD_REQUEST,
        message: ['No data submitted.'],
        data: { note },
      });
    }

    if (!metatype || !this.toValidate(metatype)) return note;

    const object = plainToInstance(metatype, note);
    const errors = await validate(object);

    if (!errors.length && (note?.title || note?.content)) return note; // allow one of the values be undefined

    if (errors.length) {
      let errorMessages: string[] = [];
      errors.map((error) => {
        errorMessages = [...errorMessages, ...Object.values(error.constraints)];
      });
      throw new WsException({
        status: WsErrorCodes.BAD_REQUEST,
        message: errorMessages,
        data: { note },
      });
    }

    throw new WsException({
      status: WsErrorCodes.BAD_REQUEST,
      message: ['At least one field is required.'],
      data: { note },
    });
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
