import { Expose, Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  description!: string;

  @Expose({ name: 'due_date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;
}
