import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  isString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { validationMessages } from '../../common/validation/validation-messages';
import { TODO_FIELD_LABELS } from './todo-field-labels';

const validateIfString = (_object: object, value: unknown) => isString(value);

export class UpdateTodoDto {
  @MaxLength(191, {
    validateIf: validateIfString,
    message: validationMessages.maxLength(TODO_FIELD_LABELS.title, 191),
  })
  @MinLength(1, {
    validateIf: validateIfString,
    message: validationMessages.minLength(TODO_FIELD_LABELS.title, 1),
  })
  @IsString({
    message: validationMessages.isString(TODO_FIELD_LABELS.title),
  })
  title!: string;

  @MaxLength(191, {
    validateIf: validateIfString,
    message: validationMessages.maxLength(TODO_FIELD_LABELS.description, 191),
  })
  @MinLength(1, {
    validateIf: validateIfString,
    message: validationMessages.minLength(TODO_FIELD_LABELS.description, 1),
  })
  @IsString({
    message: validationMessages.isString(TODO_FIELD_LABELS.description),
  })
  description!: string;

  @Transform(({ value }: TransformFnParams) =>
    value === null || value === undefined
      ? undefined
      : new Date(value as string | number | Date),
  )
  @IsDate({
    message: validationMessages.isDate(TODO_FIELD_LABELS.dueDate),
  })
  @IsOptional()
  dueDate?: Date;
}
