import { Injectable, NotFoundException } from '@nestjs/common';
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
      throw new NotFoundException(`Todo with id ${id} not found`);
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

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    await this.findOne(id);
    return this.todosRepository.update(id, {
      title: updateTodoDto.title,
      description: updateTodoDto.description,
      dueDate: updateTodoDto.dueDate ?? null,
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.todosRepository.remove(id);
  }
}
