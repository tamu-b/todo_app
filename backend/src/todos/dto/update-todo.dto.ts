import { Expose, Transform, TransformFnParams } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  isString,
  Length,
} from 'class-validator';

const validateIfString = (_object: object, value: unknown) => isString(value);

export class UpdateTodoDto {
  @Length(1, 191, { validateIf: validateIfString })
  @IsString()
  title!: string;

  @Length(1, 191, { validateIf: validateIfString })
  @IsString()
  description!: string;

  @Expose({ name: 'due_date' })
  @Transform(({ value }: TransformFnParams) =>
    value === null || value === undefined
      ? undefined
      : new Date(value as string | number | Date),
  )
  @IsDate()
  @IsOptional()
  dueDate?: Date;
}
