import { apiClient } from '@/lib/api-client';
import { Todo, TodoInput } from './types';
import {
  BadRequestResult,
  NotFoundResult,
  SuccessResult,
  UnexpectedErrorResult,
  ValidationErrorResult,
} from '@/types/result';

type FetchTodosResult = SuccessResult<Todo[]> | UnexpectedErrorResult;
export async function fetchTodos(): Promise<FetchTodosResult> {
  const { data, error } = await apiClient.GET('/todos', {
    cache: 'no-store',
  });

  if (data) {
    return {
      type: 'success',
      data,
    };
  }

  data satisfies undefined;
  error satisfies never;
  return { type: 'error' };
}

type FetchTodoResult =
  | SuccessResult<Todo>
  | BadRequestResult
  | NotFoundResult
  | UnexpectedErrorResult;
export async function fetchTodo(id: number): Promise<FetchTodoResult> {
  const { data, error } = await apiClient.GET('/todos/{id}', {
    params: { path: { id } },
    cache: 'no-store',
  });

  if (data) {
    return {
      type: 'success',
      data,
    };
  }

  if (error.statusCode === 400) {
    return {
      type: 'bad-request',
    };
  }

  if (error.statusCode === 404) {
    return {
      type: 'not-found',
    };
  }

  data satisfies undefined;
  error satisfies never;
  return { type: 'error' };
}

type CreateTodoResult =
  | SuccessResult<Todo>
  | ValidationErrorResult<'title' | 'description' | 'dueDate'>
  | UnexpectedErrorResult;
export async function createTodo(input: TodoInput): Promise<CreateTodoResult> {
  const { data, error } = await apiClient.POST('/todos', {
    body: input,
  });

  if (data) {
    return {
      type: 'success',
      data,
    };
  }

  error satisfies { type: 'validation_error' };
  // error は openapi 上は ValidationErrorResponse のみだが、UnexpectedErrorの可能性も残すため if 文で型を絞る
  if (error.statusCode === 400) {
    error.type satisfies 'validation_error';
    return {
      type: 'validation-error',
      message: {
        title: error.message.title?.messages,
        description: error.message.description?.messages,
        dueDate: error.message.dueDate?.messages,
      },
    };
  }

  data satisfies undefined;
  return { type: 'error' };
}

type UpdateTodoResult =
  | SuccessResult<Todo>
  | ValidationErrorResult<'title' | 'description' | 'dueDate'>
  | BadRequestResult
  | NotFoundResult
  | UnexpectedErrorResult;
export async function updateTodo(
  id: number,
  input: TodoInput,
): Promise<UpdateTodoResult> {
  const { data, error } = await apiClient.PUT('/todos/{id}', {
    params: { path: { id } },
    body: input,
  });

  if (data) {
    return {
      type: 'success',
      data,
    };
  }

  if (error.statusCode === 400) {
    if ('type' in error && error.type === 'validation_error') {
      return {
        type: 'validation-error',
        message: {
          title: error.message.title?.messages,
          description: error.message.description?.messages,
          dueDate: error.message.dueDate?.messages,
        },
      };
    }

    return {
      type: 'bad-request',
    };
  }

  if (error.statusCode === 404) {
    return {
      type: 'not-found',
    };
  }

  data satisfies undefined;
  error satisfies never;
  return { type: 'error' };
}

type DeleteTodoResult =
  | SuccessResult<undefined>
  | BadRequestResult
  | NotFoundResult
  | UnexpectedErrorResult;
export async function deleteTodo(id: number): Promise<DeleteTodoResult> {
  const { error } = await apiClient.DELETE('/todos/{id}', {
    params: { path: { id } },
  });

  if (!error) {
    return {
      type: 'success',
      data: undefined,
    };
  }

  if (error.statusCode === 400) {
    return {
      type: 'bad-request',
    };
  }

  if (error.statusCode === 404) {
    return {
      type: 'not-found',
    };
  }

  error satisfies never;
  return { type: 'error' };
}
