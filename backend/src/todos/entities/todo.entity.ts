import { Expose } from 'class-transformer';

export class Todo {
  id!: number;
  title!: string;
  description!: string;

  @Expose({ name: 'due_date' })
  dueDate!: Date | null;
}
