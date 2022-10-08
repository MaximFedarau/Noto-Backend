import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class NotePipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (!errors.length && (value?.title || value?.content)) return value; // allow one of the values be undefined

    if (errors.length) {
      let errorMessages: string[] = [];
      errors.map((error) => {
        errorMessages = [...errorMessages, ...Object.values(error.constraints)];
      });
      throw new WsException({
        status: 400,
        message: errorMessages,
      });
    }
    throw new WsException({
      status: 400,
      message: ['At least one field is required'],
    });
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
