import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../common/errors/not-found.error';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';
import { TodosRepository } from './todos.repository';

@Injectable()
export class TodosService {
  constructor(private readonly todosRepository: TodosRepository) {}

  findAll(): Promise<Todo[]> {
    return this.todosRepository.findAll();
  }

  async findOne(id: number): Promise<Todo> {
    const todo = await this.todosRepository.findById(id);
    if (!todo) {
      throw new NotFoundError(`Todo with id ${id} not found`);
    }
    return todo;
  }

  create(createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todosRepository.create({
      title: createTodoDto.title,
      description: createTodoDto.description,
      dueDate: createTodoDto.dueDate ?? null,
    });
  }

  update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    return this.todosRepository.update(id, {
      title: updateTodoDto.title,
      description: updateTodoDto.description,
      dueDate: updateTodoDto.dueDate ?? null,
    });
  }

  remove(id: number): Promise<void> {
    return this.todosRepository.remove(id);
  }
}
