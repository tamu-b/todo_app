import { Expose, Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateTodoDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @Expose({ name: 'due_date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;
}
