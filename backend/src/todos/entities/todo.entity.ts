import { Transform, TransformFnParams } from 'class-transformer';

export class Todo {
  id!: number;
  title!: string;
  description!: string;

  @Transform(
    ({ value }: TransformFnParams) =>
      (value as Date | null)?.toISOString().slice(0, 10) ?? null,
    { toPlainOnly: true },
  )
  dueDate!: Date | null;
}
