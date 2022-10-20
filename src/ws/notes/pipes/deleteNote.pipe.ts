import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { WsErrorCodes } from 'types/ws/errorCodes';

@Injectable()
export class DeleteNotePipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!value) {
      throw new WsException({
        status: WsErrorCodes.BAD_REQUEST,
        message: ['No data submitted.'],
        data: {
          id: value,
        },
      });
    }

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length) {
      let errorMessages: string[] = [];
      errors.map((error) => {
        errorMessages = [...errorMessages, ...Object.values(error.constraints)];
      });
      throw new WsException({
        status: WsErrorCodes.BAD_REQUEST,
        message: errorMessages,
        data: {
          id: value,
        },
      });
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
