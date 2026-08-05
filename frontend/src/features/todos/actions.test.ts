import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createTodoAction,
  deleteTodoAction,
  updateTodoAction,
} from './actions';
import * as api from './api';
import { Todo, TodoInput } from './types';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
vi.mock('./api');

const todo: Todo = {
  id: 1,
  title: 'title',
  description: 'description',
  dueDate: '2026-01-01',
};

const input: TodoInput = {
  title: 'title',
  description: 'description',
  dueDate: '2026-01-01',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createTodoAction', () => {
  it('createTodoをinputで呼び出し、その結果をそのまま返す', async () => {
    const result = { type: 'success', data: todo } as const;
    vi.mocked(api.createTodo).mockResolvedValue(result);

    const actual = await createTodoAction(input);

    expect(api.createTodo).toHaveBeenCalledWith(input);
    expect(actual).toEqual(result);
  });

  it('/todosを再検証する', async () => {
    vi.mocked(api.createTodo).mockResolvedValue({
      type: 'success',
      data: todo,
    });

    await createTodoAction(input);

    expect(revalidatePath).toHaveBeenCalledWith('/todos');
  });
});

describe('updateTodoAction', () => {
  it('updateTodoをidとinputで呼び出し、その結果をそのまま返す', async () => {
    const result = { type: 'success', data: todo } as const;
    vi.mocked(api.updateTodo).mockResolvedValue(result);

    const actual = await updateTodoAction(todo.id, input);

    expect(api.updateTodo).toHaveBeenCalledWith(todo.id, input);
    expect(actual).toEqual(result);
  });

  it('/todosと/todos/{id}を再検証する', async () => {
    vi.mocked(api.updateTodo).mockResolvedValue({
      type: 'success',
      data: todo,
    });

    await updateTodoAction(todo.id, input);

    expect(revalidatePath).toHaveBeenCalledWith('/todos');
    expect(revalidatePath).toHaveBeenCalledWith(`/todos/${todo.id}`);
  });
});

describe('deleteTodoAction', () => {
  it('deleteTodoをidで呼び出し、その結果をそのまま返す', async () => {
    const result = { type: 'success', data: undefined } as const;
    vi.mocked(api.deleteTodo).mockResolvedValue(result);

    const actual = await deleteTodoAction(todo.id);

    expect(api.deleteTodo).toHaveBeenCalledWith(todo.id);
    expect(actual).toEqual(result);
  });

  it('/todosを再検証する', async () => {
    vi.mocked(api.deleteTodo).mockResolvedValue({
      type: 'success',
      data: undefined,
    });

    await deleteTodoAction(todo.id);

    expect(revalidatePath).toHaveBeenCalledWith('/todos');
  });
});
