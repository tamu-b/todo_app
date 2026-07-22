import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import type { TodoModel } from '../generated/prisma/models';
import { NotFoundError } from '../common/errors/not-found.error';
import { PrismaErrorCode } from '../prisma/prisma-error-codes';
import { Todo } from './entities/todo.entity';
import { TodoData, TodosRepository } from './todos.repository';

@Injectable()
export class PrismaTodosRepository implements TodosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Todo[]> {
    const todos = await this.prisma.todo.findMany();
    return todos.map(toTodo);
  }

  async findById(id: number): Promise<Todo | null> {
    const todo = await this.prisma.todo.findUnique({ where: { id } });
    return todo ? toTodo(todo) : null;
  }

  async create(data: TodoData): Promise<Todo> {
    const todo = await this.prisma.todo.create({
      data: {
        title: data.title,
        description: data.description,
        due_date: data.dueDate,
      },
    });
    return toTodo(todo);
  }

  async update(id: number, data: Partial<TodoData>): Promise<Todo> {
    try {
      const todo = await this.prisma.todo.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          due_date: data.dueDate,
        },
      });
      return toTodo(todo);
    } catch (error) {
      throw toNotFoundOrRethrow(error, id);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.todo.delete({ where: { id } });
    } catch (error) {
      throw toNotFoundOrRethrow(error, id);
    }
  }
}

function toNotFoundOrRethrow(error: unknown, id: number): unknown {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === PrismaErrorCode.RecordNotFound
  ) {
    return new NotFoundError(`Todo with id ${id} not found`);
  }
  return error;
}

function toTodo(todo: TodoModel): Todo {
  return Object.assign(new Todo(), {
    id: todo.id,
    title: todo.title,
    description: todo.description,
    dueDate: todo.due_date,
  });
}
