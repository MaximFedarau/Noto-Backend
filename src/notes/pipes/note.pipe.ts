import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class NotePipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) return value;
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (!errors.length && (value?.title || value?.content)) return value; // allow one of the values be undefined

    if (errors.length) {
      let errorMessages: string[] = [];
      errors.map((error) => {
        errorMessages = [...errorMessages, ...Object.values(error.constraints)];
      });
      throw new BadRequestException(errorMessages, 'Validation failed');
    }

    throw new BadRequestException(
      ['At least one field is required.'],
      'Validation failed',
    );
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
