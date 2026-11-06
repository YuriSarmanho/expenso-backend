import { BadRequestException, PipeTransform } from '@nestjs/common';
import { z, type ZodType } from 'zod';
import { fromZodError } from 'zod-validation-error';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: fromZodError(result.error),
      });
    }

    return result.data;
  }
}
