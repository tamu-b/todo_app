import { Todo } from './entities/todo.entity';

export type TodoData = {
  title: string;
  description: string;
  dueDate: Date | null;
};

export abstract class TodosRepository {
  abstract findAll(): Promise<Todo[]>;
  abstract findById(id: number): Promise<Todo | null>;
  abstract create(data: TodoData): Promise<Todo>;
  /**
   * @throws NotFoundError if the Todo with the specified id does not exist
   */
  abstract update(id: number, data: Partial<TodoData>): Promise<Todo>;
  /**
   * @throws NotFoundError if the Todo with the specified id does not exist
   */
  abstract remove(id: number): Promise<void>;
}
