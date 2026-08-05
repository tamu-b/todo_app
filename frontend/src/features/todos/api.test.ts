import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { BACKEND_URL } from '@/constants/app';
import { server } from '@/test/msw-server';
import {
  createTodo,
  deleteTodo,
  fetchTodo,
  fetchTodos,
  updateTodo,
} from './api';
import { Todo, TodoInput } from './types';

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

describe('fetchTodos', () => {
  it('成功時、Todo一覧を返す', async () => {
    server.use(
      http.get(`${BACKEND_URL}/todos`, () => HttpResponse.json([todo])),
    );

    const result = await fetchTodos();

    expect(result).toEqual({ type: 'success', data: [todo] });
  });

  it('予期しないエラーの場合、errorを返す', async () => {
    server.use(
      http.get(
        `${BACKEND_URL}/todos`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    const result = await fetchTodos();

    expect(result).toEqual({ type: 'error' });
  });
});

describe('fetchTodo', () => {
  it('成功時、指定したTodoを返す', async () => {
    server.use(
      http.get(`${BACKEND_URL}/todos/1`, () => HttpResponse.json(todo)),
    );

    const result = await fetchTodo(todo.id);

    expect(result).toEqual({ type: 'success', data: todo });
  });

  it('400の場合、bad-requestを返す', async () => {
    server.use(
      http.get(`${BACKEND_URL}/todos/1`, () =>
        HttpResponse.json(
          {
            statusCode: 400,
            message: 'IDの形式が不正です',
            error: 'Bad Request',
          },
          { status: 400 },
        ),
      ),
    );

    const result = await fetchTodo(todo.id);

    expect(result).toEqual({ type: 'bad-request' });
  });

  it('404の場合、not-foundを返す', async () => {
    server.use(
      http.get(`${BACKEND_URL}/todos/1`, () =>
        HttpResponse.json(
          {
            statusCode: 404,
            message: '対象のTodoが見つかりませんでした',
            error: 'Not Found',
          },
          { status: 404 },
        ),
      ),
    );

    const result = await fetchTodo(todo.id);

    expect(result).toEqual({ type: 'not-found' });
  });

  it('予期しないエラーの場合、errorを返す', async () => {
    server.use(
      http.get(
        `${BACKEND_URL}/todos/1`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    const result = await fetchTodo(todo.id);

    expect(result).toEqual({ type: 'error' });
  });
});

describe('createTodo', () => {
  it('成功時、作成されたTodoを返す', async () => {
    server.use(
      http.post(`${BACKEND_URL}/todos`, () =>
        HttpResponse.json(todo, { status: 201 }),
      ),
    );

    const result = await createTodo(input);

    expect(result).toEqual({ type: 'success', data: todo });
  });

  it('バリデーションエラーの場合、validation-errorを各フィールドのメッセージとともに返す', async () => {
    server.use(
      http.post(`${BACKEND_URL}/todos`, () =>
        HttpResponse.json(
          {
            type: 'validation_error',
            statusCode: 400,
            error: 'Bad Request',
            message: {
              title: { messages: ['タイトルは1文字以上で入力してください'] },
              dueDate: { messages: ['期限は有効な日付を入力してください'] },
            },
          },
          { status: 400 },
        ),
      ),
    );

    const result = await createTodo(input);

    expect(result).toEqual({
      type: 'validation-error',
      message: {
        title: ['タイトルは1文字以上で入力してください'],
        description: undefined,
        dueDate: ['期限は有効な日付を入力してください'],
      },
    });
  });

  it('予期しないエラーの場合、errorを返す', async () => {
    server.use(
      http.post(
        `${BACKEND_URL}/todos`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    const result = await createTodo(input);

    expect(result).toEqual({ type: 'error' });
  });
});

describe('updateTodo', () => {
  it('成功時、更新後のTodoを返す', async () => {
    server.use(
      http.put(`${BACKEND_URL}/todos/1`, () => HttpResponse.json(todo)),
    );

    const result = await updateTodo(todo.id, input);

    expect(result).toEqual({ type: 'success', data: todo });
  });

  it('バリデーションエラーの場合、validation-errorを各フィールドのメッセージとともに返す', async () => {
    server.use(
      http.put(`${BACKEND_URL}/todos/1`, () =>
        HttpResponse.json(
          {
            type: 'validation_error',
            statusCode: 400,
            error: 'Bad Request',
            message: {
              description: {
                messages: ['説明は1文字以上で入力してください'],
              },
            },
          },
          { status: 400 },
        ),
      ),
    );

    const result = await updateTodo(todo.id, input);

    expect(result).toEqual({
      type: 'validation-error',
      message: {
        title: undefined,
        description: ['説明は1文字以上で入力してください'],
        dueDate: undefined,
      },
    });
  });

  it('IDの形式が不正な場合、bad-requestを返す', async () => {
    server.use(
      http.put(`${BACKEND_URL}/todos/1`, () =>
        HttpResponse.json(
          {
            statusCode: 400,
            message: 'IDの形式が不正です',
            error: 'Bad Request',
          },
          { status: 400 },
        ),
      ),
    );

    const result = await updateTodo(todo.id, input);

    expect(result).toEqual({ type: 'bad-request' });
  });

  it('404の場合、not-foundを返す', async () => {
    server.use(
      http.put(`${BACKEND_URL}/todos/1`, () =>
        HttpResponse.json(
          {
            statusCode: 404,
            message: '対象のTodoが見つかりませんでした',
            error: 'Not Found',
          },
          { status: 404 },
        ),
      ),
    );

    const result = await updateTodo(todo.id, input);

    expect(result).toEqual({ type: 'not-found' });
  });

  it('予期しないエラーの場合、errorを返す', async () => {
    server.use(
      http.put(
        `${BACKEND_URL}/todos/1`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    const result = await updateTodo(todo.id, input);

    expect(result).toEqual({ type: 'error' });
  });
});

describe('deleteTodo', () => {
  it('成功時、successを返す', async () => {
    server.use(
      http.delete(
        `${BACKEND_URL}/todos/1`,
        () => new HttpResponse(null, { status: 200 }),
      ),
    );

    const result = await deleteTodo(todo.id);

    expect(result).toEqual({ type: 'success', data: undefined });
  });

  it('IDの形式が不正な場合、bad-requestを返す', async () => {
    server.use(
      http.delete(`${BACKEND_URL}/todos/1`, () =>
        HttpResponse.json(
          {
            statusCode: 400,
            message: 'IDの形式が不正です',
            error: 'Bad Request',
          },
          { status: 400 },
        ),
      ),
    );

    const result = await deleteTodo(todo.id);

    expect(result).toEqual({ type: 'bad-request' });
  });

  it('404の場合、not-foundを返す', async () => {
    server.use(
      http.delete(`${BACKEND_URL}/todos/1`, () =>
        HttpResponse.json(
          {
            statusCode: 404,
            message: '対象のTodoが見つかりませんでした',
            error: 'Not Found',
          },
          { status: 404 },
        ),
      ),
    );

    const result = await deleteTodo(todo.id);

    expect(result).toEqual({ type: 'not-found' });
  });

  it('予期しないエラーの場合、errorを返す', async () => {
    server.use(
      http.delete(`${BACKEND_URL}/todos/1`, () =>
        HttpResponse.json(
          { statusCode: 500, message: 'Internal Server Error' },
          { status: 500 },
        ),
      ),
    );

    const result = await deleteTodo(todo.id);

    expect(result).toEqual({ type: 'error' });
  });
});
